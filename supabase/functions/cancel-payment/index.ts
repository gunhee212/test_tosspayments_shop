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

  let body: { orderId?: string; reason?: string };
  try { body = await req.json(); } catch { return json({ message: '잘못된 요청이에요.' }, 400); }
  const reason = (body.reason ?? '').trim();
  if (!body.orderId || !reason) return json({ message: '취소 사유를 입력해주세요.' }, 400);

  const { data: order } = await admin.from('orders').select('*').eq('id', body.orderId).eq('user_id', u.user.id).maybeSingle();
  if (!order) return json({ message: '주문을 찾을 수 없어요.' }, 404);
  if (order.status === 'canceled') return json({ message: '이미 취소된 주문이에요.' }, 409);
  if (order.status !== 'paid' || !order.payment_key) return json({ message: '결제 완료된 주문만 취소할 수 있어요.' }, 409);

  // 전액 환불만 지원 (cancelAmount 생략)
  const res = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(order.payment_key)}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(secretKey + ':'),
      'Content-Type': 'application/json',
      'Idempotency-Key': 'cancel-' + order.id
    },
    body: JSON.stringify({ cancelReason: reason })
  });
  const toss = await res.json().catch(() => ({}));
  if (!res.ok) return json({ message: toss.message ?? '결제 취소에 실패했어요.', code: toss.code }, 400);

  const { data: updated, error } = await admin
    .from('orders')
    .update({ status: 'canceled', canceled_at: new Date().toISOString(), cancel_reason: reason })
    .eq('id', order.id)
    .eq('status', 'paid')
    .select()
    .single();
  if (error) return json({ message: '토스에서는 취소됐지만 주문 갱신에 실패했어요.' }, 500);
  return json({ ok: true, order: updated });
});
