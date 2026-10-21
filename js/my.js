// 마이 페이지: 주문 내역, 취소, 리뷰 작성/수정/삭제, 좋아요한 상품
const STATUS = { pending: '결제 대기', paid: '결제 완료', canceled: '취소됨', failed: '결제 실패' };
const ALL = Object.entries(PRODUCTS).flatMap(([cat, list]) => list.map((p) => ({ ...p, cat })));
const findProduct = (id) => ALL.find((p) => p.id === id);

const $ = (id) => document.getElementById(id);
const dim = $('dim');
const modal = $('modal');
let reviewsByOrder = {}; // order_id -> review
let modalAction = null;
let rating = 0;

/* ---------- 모달 ---------- */
function openModal({ title, sub, placeholder, value = '', submitText, stars = false, onSubmit }) {
  $('modalTitle').textContent = title;
  $('modalSub').textContent = sub;
  $('modalText').placeholder = placeholder;
  $('modalText').value = value;
  $('modalMsg').textContent = '';
  $('modalSubmit').textContent = submitText;
  $('starsRow').hidden = !stars;
  modalAction = onSubmit;
  modal.classList.add('open');
  dim.classList.add('open');
}
function closeModal() {
  modal.classList.remove('open');
  dim.classList.remove('open');
}
function setRating(n) {
  rating = n;
  $('starsRow').innerHTML = [1, 2, 3, 4, 5]
    .map((i) => `<button type="button" data-n="${i}" class="${i <= n ? 'on' : ''}" aria-label="${i}점">★</button>`)
    .join('');
}
$('starsRow').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) setRating(Number(b.dataset.n));
});
dim.addEventListener('click', closeModal);
$('modalClose').addEventListener('click', closeModal);
$('modalSubmit').addEventListener('click', async () => {
  const btn = $('modalSubmit');
  btn.disabled = true;
  const msg = await modalAction($('modalText').value.trim());
  btn.disabled = false;
  if (msg) $('modalMsg').textContent = msg;
  else {
    closeModal();
    load();
  }
});

/* ---------- 액션 ---------- */
function startCancel(order) {
  openModal({
    title: '주문 취소',
    sub: `${order.label} · ${won(order.amount)}원 전액 환불돼요.`,
    placeholder: '취소 사유를 입력해주세요',
    submitText: '주문 취소하기',
    onSubmit: async (reason) => {
      if (!reason) return '취소 사유를 입력해주세요.';
      const { error } = await sb.functions.invoke('cancel-payment', { body: { orderId: order.id, reason } });
      return error ? await fnError(error) : null;
    }
  });
}

function startReview(order, existing) {
  setRating(existing?.rating || 0);
  openModal({
    title: existing ? '리뷰 수정' : '리뷰 쓰기',
    sub: order.label,
    placeholder: '상품은 어떠셨나요?',
    value: existing?.content || '',
    submitText: existing ? '수정하기' : '등록하기',
    stars: true,
    onSubmit: async (content) => {
      if (!rating) return '별점을 선택해주세요.';
      if (!content) return '후기를 입력해주세요.';
      const { error } = existing
        ? await sb.from('reviews').update({ rating, content }).eq('id', existing.id)
        : await sb.from('reviews').insert({ user_id: me.id, product_id: order.product_id, order_id: order.id, rating, content });
      return error ? (error.code === '23505' ? '이미 이 주문의 리뷰를 작성했어요.' : error.message) : null;
    }
  });
}

async function deleteReview(review) {
  if (!confirm('리뷰를 삭제할까요?')) return;
  const { error } = await sb.from('reviews').delete().eq('id', review.id);
  if (error) return alert('삭제에 실패했어요: ' + error.message);
  load();
}

/* ---------- 렌더링 ---------- */
function orderCard(o) {
  const p = findProduct(o.product_id);
  const label = `${p ? p.brand + ' ' + p.name : o.product_id} (${o.size})`;
  o.label = label;
  const rv = reviewsByOrder[o.id];
  let actions = '';
  if (o.status === 'paid') {
    actions = `<button data-act="cancel">취소하기</button>` +
      (rv
        ? `<button data-act="edit-review">리뷰 수정</button><button data-act="del-review">리뷰 삭제</button>`
        : `<button data-act="review" class="primary">리뷰 쓰기</button>`);
  }
  const when =
    o.status === 'canceled'
      ? `취소 ${fmtDate(o.canceled_at)} · 사유: ${esc(o.cancel_reason || '-')}`
      : o.status === 'paid'
        ? `결제 ${fmtDate(o.paid_at)}`
        : '';
  return `<article class="order" data-id="${o.id}">
    <div class="o-thumb" style="background:${p ? p.color : '#eee'}">${p ? imgTag(p) : ''}</div>
    <div class="o-main">
      <p class="o-status s-${o.status}">${STATUS[o.status]}</p>
      <p class="o-name">${esc(label)}</p>
      <p class="o-meta">${won(o.amount)}원 · 주문 ${fmtDate(o.created_at)}</p>
      ${when ? `<p class="o-meta">${when}</p>` : ''}
      ${o.ship_address ? `<p class="o-meta">배송지: ${esc(o.ship_name)} · ${esc(o.ship_phone)} · ${esc(o.ship_address)}${o.ship_memo ? ` (${esc(o.ship_memo)})` : ''}</p>` : ''}
      <p class="o-meta o-id">${esc(o.id)}</p>
    </div>
    <div class="o-actions">${actions}</div>
  </article>`;
}

let orders = [];
async function load() {
  const [o, r, l] = await Promise.all([
    sb.from('orders').select('*').order('created_at', { ascending: false }),
    sb.from('reviews').select('id, order_id, rating, content').eq('user_id', me.id),
    sb.from('product_likes').select('product_id')
  ]);
  if (o.error) {
    $('orders').innerHTML = '<p class="empty">주문 내역을 불러오지 못했어요.</p>';
    return;
  }
  orders = o.data;
  reviewsByOrder = Object.fromEntries((r.data || []).map((x) => [x.order_id, x]));
  $('orders').innerHTML = orders.length ? orders.map(orderCard).join('') : '<p class="empty">주문 내역이 없어요.</p>';

  const likedIds = (l.data || []).map((x) => x.product_id);
  $('liked').innerHTML = likedIds.length
    ? likedIds
        .map(findProduct)
        .filter(Boolean)
        .map(
          (p) => `<a class="liked-item" href="${CATEGORIES[p.cat].href}">
            <span class="o-thumb" style="background:${p.color}">${imgTag(p)}</span>
            <span><b>${esc(p.brand)}</b><br>${esc(p.name)}<br>${won(salePrice(p))}원</span></a>`
        )
        .join('')
    : '<p class="empty">좋아요한 상품이 없어요.</p>';
}

$('orders').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const order = orders.find((x) => x.id === b.closest('.order').dataset.id);
  const rv = reviewsByOrder[order.id];
  if (b.dataset.act === 'cancel') startCancel(order);
  if (b.dataset.act === 'review') startReview(order, null);
  if (b.dataset.act === 'edit-review') startReview(order, rv);
  if (b.dataset.act === 'del-review') deleteReview(rv);
});

(async () => {
  await ready;
  if (!me) return (location.href = loginUrl());
  $('who').textContent = `${me.name}님`;
  load();
})();
