import { createClient } from 'jsr:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ message: 'method not allowed' }, 405);

  const secretKey = Deno.env.get('TOSS_SECRET_KEY');
  if (!secretKey) return json({ message: '서버에 TOSS_SECRET_KEY가 설정되지 않았어요.' }, 500);

  const url = Deno.env.get('SUPABASE_URL')!;
  const authed = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }
  });
  const { data: u } = await authed.auth.getUser();
  if (!u?.user) return json({ message: '로그인이 필요해요.' }, 401);

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  let body: { paymentKey?: string; orderId?: string; amount?: number };
  try { body = await req.json(); } catch { return json({ message: '잘못된 요청이에요.' }, 400); }
  const { paymentKey, orderId } = body;
  const amount = Number(body.amount);
  if (!paymentKey || !orderId || !Number.isFinite(amount)) return json({ message: '필수 값이 없어요.' }, 400);

  const { data: order } = await admin.from('orders').select('*').eq('id', orderId).eq('user_id', u.user.id).maybeSingle();
  if (!order) return json({ message: '주문을 찾을 수 없어요.' }, 404);
  if (order.status === 'paid') return json({ ok: true, order });
  if (order.status !== 'pending') return json({ message: `처리할 수 없는 주문 상태예요. (${order.status})` }, 409);

  // 금액 검증: DB에 저장된 서버 계산 금액과 다르면 승인하지 않음
  if (order.amount !== amount) {
    await admin.from('orders').update({ status: 'failed' }).eq('id', orderId);
    return json({ message: '결제 금액이 주문 금액과 달라요.' }, 400);
  }

  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(secretKey + ':'),
      'Content-Type': 'application/json',
      'Idempotency-Key': orderId
    },
    body: JSON.stringify({ paymentKey, orderId, amount: order.amount })
  });
  const toss = await res.json().catch(() => ({}));
  if (!res.ok) {
    await admin.from('orders').update({ status: 'failed' }).eq('id', orderId).eq('status', 'pending');
    return json({ message: toss.message ?? '결제 승인에 실패했어요.', code: toss.code }, 400);
  }

  const { data: updated, error } = await admin
    .from('orders')
    .update({ status: 'paid', payment_key: paymentKey, paid_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
  if (error) return json({ message: '결제는 승인됐지만 주문 갱신에 실패했어요.' }, 500);
  return json({ ok: true, order: updated });
});
