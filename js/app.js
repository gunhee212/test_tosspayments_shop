// 토스페이먼츠 결제창 SDK v2 (테스트 클라이언트 키)
const CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

const category = document.body.dataset.category;
const grid = document.getElementById('grid');
const sheet = document.getElementById('sheet');
const dim = document.getElementById('dim');
let current = null; // { product, size }
let sort = 'popular';

/* ---------- 목록 ---------- */
function renderGrid() {
  const list = [...PRODUCTS[category]];
  if (sort === 'low') list.sort((a, b) => salePrice(a) - salePrice(b));
  if (sort === 'high') list.sort((a, b) => salePrice(b) - salePrice(a));
  if (sort === 'sale') list.sort((a, b) => b.off - a.off);
  document.getElementById('count').textContent = `${list.length}개의 상품`;
  grid.innerHTML = list
    .map(
      (p, i) => `
    <article class="card" data-id="${p.id}">
      <div class="thumb" style="background:${p.color}">
        <span class="rank">${i + 1}</span>
        <span class="emoji">${p.icon}</span>
        <button class="heart" aria-label="좋아요">♡</button>
      </div>
      <div class="info">
        <p class="brand">${p.brand}</p>
        <p class="name">${p.name}</p>
        <p class="price"><b class="off">${p.off}%</b> ${won(salePrice(p))}원</p>
      </div>
    </article>`
    )
    .join('');
}

grid.addEventListener('click', (e) => {
  if (e.target.closest('.heart')) {
    const h = e.target.closest('.heart');
    h.classList.toggle('on');
    h.textContent = h.classList.contains('on') ? '♥' : '♡';
    return;
  }
  const card = e.target.closest('.card');
  if (card) openSheet(card.dataset.id);
});

document.querySelectorAll('.sort button').forEach((b) =>
  b.addEventListener('click', () => {
    document.querySelectorAll('.sort button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    sort = b.dataset.sort;
    renderGrid();
  })
);

/* ---------- 구매 시트 ---------- */
function openSheet(id) {
  const p = PRODUCTS[category].find((x) => x.id === id);
  current = { product: p, size: null };
  document.getElementById('sheetThumb').style.background = p.color;
  document.getElementById('sheetEmoji').textContent = p.icon;
  document.getElementById('sheetBrand').textContent = p.brand;
  document.getElementById('sheetName').textContent = p.name;
  document.getElementById('sheetOrigin').textContent = won(p.price) + '원';
  document.getElementById('sheetOff').textContent = p.off + '%';
  document.getElementById('sheetPrice').textContent = won(salePrice(p)) + '원';
  document.getElementById('sizes').innerHTML = p.sizes
    .map((s) => `<button type="button" data-size="${s}">${s}</button>`)
    .join('');
  document.getElementById('payBtn').textContent = '사이즈를 선택해주세요';
  document.getElementById('payBtn').disabled = true;
  sheet.classList.add('open');
  dim.classList.add('open');
  document.body.classList.add('lock');
}

function closeSheet() {
  sheet.classList.remove('open');
  dim.classList.remove('open');
  document.body.classList.remove('lock');
}
dim.addEventListener('click', closeSheet);
document.getElementById('sheetClose').addEventListener('click', closeSheet);
document.addEventListener('keydown', (e) => e.key === 'Escape' && closeSheet());

document.getElementById('sizes').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  document.querySelectorAll('#sizes button').forEach((x) => x.classList.remove('active'));
  b.classList.add('active');
  current.size = b.dataset.size;
  const btn = document.getElementById('payBtn');
  btn.disabled = false;
  btn.textContent = `${won(salePrice(current.product))}원 바로 구매하기`;
});

/* ---------- 토스페이먼츠 결제 ---------- */
document.getElementById('payBtn').addEventListener('click', async () => {
  if (!current || !current.size) return;
  if (location.protocol === 'file:') {
    alert('결제는 http(s) 주소에서만 동작합니다.\n로컬 서버로 실행해주세요. (예: npx serve .)');
    return;
  }
  const { product, size } = current;
  const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const base = location.href.replace(/[^/]*$/, '');
  try {
    const tossPayments = TossPayments(CLIENT_KEY);
    const payment = tossPayments.payment({ customerKey: TossPayments.ANONYMOUS });
    await payment.requestPayment({
      method: 'CARD',
      amount: { currency: 'KRW', value: salePrice(product) },
      orderId,
      orderName: `${product.brand} ${product.name} (${size})`,
      successUrl: base + 'success.html',
      failUrl: base + 'fail.html',
      card: { useEscrow: false, flowMode: 'DEFAULT', useCardPoint: false, useAppCardOnly: false }
    });
  } catch (err) {
    // 사용자가 결제창을 닫은 경우 등
    if (err && err.code !== 'USER_CANCEL') alert(`결제 요청 실패: ${err.message || err}`);
  }
});

renderGrid();
