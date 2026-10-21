// 결제 성공 처리 (success.html)
const q = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);
const orderId = q.get('orderId');
const paymentKey = q.get('paymentKey');
const amount = Number(q.get('amount'));
$('orderId').textContent = orderId || '-';
$('amount').textContent = amount.toLocaleString('ko-KR') + '원';

function fail(message) {
  $('mark').textContent = '⚠️';
  $('title').textContent = '결제 승인에 실패했어요';
  $('sub').textContent = message;
  $('status').textContent = '실패';
}

(async () => {
  await ready;
  if (!me) return (location.href = loginUrl());
  if (!orderId || !paymentKey) return fail('결제 정보가 올바르지 않아요.');
  // 금액 검증과 토스 승인은 서버(Edge Function)가 합니다.
  const { error } = await sb.functions.invoke('confirm-payment', { body: { paymentKey, orderId, amount } });
  if (error) return fail(await fnError(error));
  $('mark').textContent = '✅';
  $('title').textContent = '결제가 완료되었어요';
  $('sub').textContent = '토스페이먼츠 결제 승인이 정상 처리되었습니다.';
  $('status').textContent = '결제 완료';
})();
