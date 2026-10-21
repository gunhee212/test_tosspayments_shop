// 결제 실패 안내 (fail.html)
const q = new URLSearchParams(location.search);
document.getElementById('message').textContent = q.get('message') || '알 수 없는 오류';
document.getElementById('code').textContent = q.get('code') || '-';
document.getElementById('orderId').textContent = q.get('orderId') || '-';
