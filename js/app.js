
const category = document.body.dataset.category;
const grid = document.getElementById('grid');
const sheet = document.getElementById('sheet');
const dim = document.getElementById('dim');
let current = null; // { product, size }
let sort = 'popular';
let gender = new URLSearchParams(location.search).get('gender') || 'all';
let likedProducts = new Set();

/* ---------- 목록 ---------- */
function renderGrid() {
  const list = PRODUCTS[category].filter((p) => gender === 'all' || p.gender === gender);
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
        ${imgTag(p)}
        <button class="heart${likedProducts.has(p.id) ? ' on' : ''}" aria-label="좋아요">${likedProducts.has(p.id) ? '♥' : '♡'}</button>
      </div>
      <div class="info">
        <p class="brand">${p.brand} <span class="gtag">${GENDERS[p.gender]}</span></p>
        <p class="name">${p.name}</p>
        <p class="price"><b class="off">${p.off}%</b> ${won(salePrice(p))}원</p>
      </div>
    </article>`
    )
    .join('');
}

grid.addEventListener('click', async (e) => {
  if (e.target.closest('.heart')) {
    const h = e.target.closest('.heart');
    if (!me) {
      location.href = loginUrl();
      return;
    }
    const id = h.closest('.card').dataset.id;
    const on = !likedProducts.has(id);
    const { error } = on
      ? await sb.from('product_likes').insert({ user_id: me.id, product_id: id })
      : await sb.from('product_likes').delete().eq('user_id', me.id).eq('product_id', id);
    if (error) return alert('좋아요 처리에 실패했어요: ' + error.message);
    on ? likedProducts.add(id) : likedProducts.delete(id);
    h.classList.toggle('on', on);
    h.textContent = on ? '♥' : '♡';
    return;
  }
  const card = e.target.closest('.card');
  if (card) openSheet(card.dataset.id);
});

document.querySelectorAll('#genderChips button').forEach((b) => {
  b.classList.toggle('on', b.dataset.gender === gender);
  b.addEventListener('click', () => {
    gender = b.dataset.gender;
    document.querySelectorAll('#genderChips button').forEach((x) => x.classList.toggle('on', x === b));
    const u = new URL(location.href);
    gender === 'all' ? u.searchParams.delete('gender') : u.searchParams.set('gender', gender);
    history.replaceState(null, '', u);
    renderGrid();
  });
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
  document.getElementById('sheetEmoji').innerHTML = imgTag(p);
  document.getElementById('sheetBrand').textContent = p.brand + ' · ' + GENDERS[p.gender];
  document.getElementById('sheetName').textContent = p.name;
  document.getElementById('sheetOrigin').textContent = won(p.price) + '원';
  document.getElementById('sheetOff').textContent = p.off + '%';
  document.getElementById('sheetPrice').textContent = won(salePrice(p)) + '원';
  document.getElementById('sizes').innerHTML = p.sizes
    .map((s) => `<button type="button" data-size="${s}">${s}</button>`)
    .join('');
  document.getElementById('payBtn').textContent = '사이즈를 선택해주세요';
  document.getElementById('payBtn').disabled = true;
  loadReviews(p.id);
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

/* ---------- 리뷰 ---------- */
async function loadReviews(productId) {
  const box = document.getElementById('reviews');
  box.innerHTML = '<p class="empty">불러오는 중…</p>';
  const { data, error } = await sb
    .from('reviews')
    .select('id, user_id, author_name, rating, content, created_at, review_likes(user_id)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (!current || current.product.id !== productId) return; // 그새 다른 상품을 열었으면 무시
  if (error) {
    box.innerHTML = '<p class="empty">리뷰를 불러오지 못했어요.</p>';
    return;
  }
  if (!data.length) {
    box.innerHTML = '<p class="empty">아직 리뷰가 없어요.</p>';
    return;
  }
  box.innerHTML = data
    .map((r) => {
      const liked = me && r.review_likes.some((l) => l.user_id === me.id);
      return `<div class="review" data-id="${r.id}">
        <div class="rv-top"><span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          <span class="rv-meta">${esc(r.author_name || '익명')} · ${esc(new Date(r.created_at).toLocaleDateString('ko-KR'))}</span></div>
        <p class="rv-body">${esc(r.content)}</p>
        <button class="rv-like${liked ? ' on' : ''}" type="button">${liked ? '♥' : '♡'} ${r.review_likes.length}</button>
      </div>`;
    })
    .join('');
}

document.getElementById('reviews').addEventListener('click', async (e) => {
  const b = e.target.closest('.rv-like');
  if (!b) return;
  if (!me) {
    location.href = loginUrl();
    return;
  }
  const id = Number(b.closest('.review').dataset.id);
  const { error } = b.classList.contains('on')
    ? await sb.from('review_likes').delete().eq('user_id', me.id).eq('review_id', id)
    : await sb.from('review_likes').insert({ user_id: me.id, review_id: id });
  if (error) return alert('좋아요 처리에 실패했어요: ' + error.message);
  loadReviews(current.product.id);
});

/* ---------- 토스페이먼츠 결제 ---------- */
document.getElementById('payBtn').addEventListener('click', async () => {
  if (!current || !current.size) return;
  if (!me) {
    location.href = loginUrl();
    return;
  }
  if (location.protocol === 'file:') {
    alert('결제는 http(s) 주소에서만 동작합니다.\n로컬 서버로 실행해주세요. (예: node server.js)');
    return;
  }
  const { product, size } = current;
  const btn = document.getElementById('payBtn');
  btn.disabled = true;
  try {
    // 주문을 먼저 '결제 대기'로 저장합니다. 금액은 DB 가격으로 서버가 계산합니다.
    const { data, error } = await sb.rpc('create_order', { p_product_id: product.id, p_size: size });
    if (error) throw new Error(error.message);
    const order = data[0];
    const base = location.href.replace(/[^/]*$/, '');
    const tossPayments = TossPayments(CLIENT_KEY);
    const payment = tossPayments.payment({ customerKey: me.id });
    await payment.requestPayment({
      method: 'CARD',
      amount: { currency: 'KRW', value: order.amount },
      orderId: order.order_id,
      orderName: order.order_name,
      successUrl: base + 'success.html',
      failUrl: base + 'fail.html',
      card: { useEscrow: false, flowMode: 'DEFAULT', useCardPoint: false, useAppCardOnly: false }
    });
  } catch (err) {
    // 사용자가 결제창을 닫은 경우 등 (주문은 '결제 대기'로 남음)
    if (err && err.code !== 'USER_CANCEL') alert(`결제 요청 실패: ${err.message || err}`);
  } finally {
    btn.disabled = false;
  }
});

/* ---------- 시작 ---------- */
async function loadLikes() {
  await ready;
  if (!me) return;
  const { data } = await sb.from('product_likes').select('product_id');
  likedProducts = new Set((data || []).map((x) => x.product_id));
  renderGrid();
}

renderGrid();
loadLikes();

// 검색 결과·JSON-LD 링크(?open=id, #id)로 들어오면 해당 상품 구매 시트를 엽니다.
const openId = new URLSearchParams(location.search).get('open') || location.hash.slice(1);
if (openId && PRODUCTS[category].some((p) => p.id === openId)) openSheet(openId);
