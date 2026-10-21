// 상품 검색: 헤더 자동완성 + search.html 결과 (data.js 필요)
// 성별 별칭은 단어가 정확히 같을 때만 맞춥니다. (부분 일치로 하면 "men"이 "women"에 걸립니다)
const SEARCH_ALIAS = { M: ['남자', 'men', 'man', 'male'], W: ['여자', 'women', 'woman', 'female'] };

// 같은 뜻으로 보는 검색어 묶음. 한 단어를 입력하면 묶음 안의 어느 말이 들어 있어도 찾습니다.
const SEARCH_SYNONYMS = [
  ['청바지', '데님 팬츠', '진', 'jeans'],
  ['데님', 'denim'],
  ['반바지', '쇼츠', 'shorts'],
  ['운동화', '스니커즈', '스니커스', '스니커', 'sneakers', 'sneaker', '러닝화', '워커'],
  ['재킷', '자켓', 'jacket'],
  ['카디건', '가디건', 'cardigan'],
  ['후디', '후드', 'hood', 'hoodie'],
  ['티셔츠', '반팔 티', '긴팔 티', 'tshirt', 't-shirt', 'tee'],
  ['셔츠', '남방', 'shirt'],
  ['구두', '로퍼', '더비', 'loafer'],
  ['부츠', 'boots', 'boot'],
  ['샌들', '슬리퍼', '슬라이드', 'sandal'],
  ['원피스', '드레스', 'dress'],
  ['코트', 'coat'],
  ['바람막이', '윈드브레이커', 'windbreaker'],
  ['슬랙스', '정장바지', 'slacks'],
  ['바지', '팬츠', 'pants'],
  ['신발', '슈즈', 'shoes'],
  ['옷', '의류', '상의', 'clothes'],
  ['아카이브', 'archive'],
  ['노웨어', 'nowhere'],
  ['모노', 'mono'],
  ['어반랩', '어반 랩', 'urban lab'],
  ['스트라이드', 'stride'],
  ['트렉', '트랙', 'trek'],
  ['로퍼코', 'loafer co'],
  ['데니마크', 'denimark']
];

function allProducts() {
  return Object.entries(PRODUCTS).flatMap(([cat, list]) => list.map((p) => ({ ...p, cat })));
}

const expandWord = (w) => SEARCH_SYNONYMS.find((g) => g.includes(w)) || [w];

// 공백으로 나눈 단어가 모두 (브랜드·상품명·카테고리·성별) 어딘가에 포함된 상품을 찾습니다.
function searchProducts(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return allProducts().filter((p) => {
    const hay = `${p.brand} ${p.name} ${CATEGORIES[p.cat].label} ${CATEGORIES[p.cat].title} ${GENDERS[p.gender]}`.toLowerCase();
    return words.every((w) => SEARCH_ALIAS[p.gender].includes(w) || expandWord(w).some((s) => hay.includes(s)));
  });
}

const productUrl = (p) => `${CATEGORIES[p.cat].href}?open=${p.id}`;
const searchEsc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

(function initHeaderSearch() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const box = document.getElementById('suggest');
  if (!form || !input || !box) return;
  const qParam = new URLSearchParams(location.search).get('q');
  if (qParam && document.getElementById('results')) input.value = qParam;

  let active = -1;
  const items = () => [...box.querySelectorAll('a')];
  const close = () => {
    box.hidden = true;
    active = -1;
  };
  const mark = () => items().forEach((a, i) => a.classList.toggle('on', i === active));

  input.addEventListener('input', () => {
    const q = input.value.trim();
    const hits = searchProducts(q);
    if (!q) return close();
    box.hidden = false;
    active = -1;
    box.innerHTML = hits.length
      ? hits
          .slice(0, 6)
          .map(
            (p) => `<a href="${productUrl(p)}"><span class="s-thumb">${imgTag(p)}</span><span class="s-text"><b>${searchEsc(p.brand)}</b> ${searchEsc(p.name)}<br><em>${GENDERS[p.gender]} · ${CATEGORIES[p.cat].label}</em> ${won(salePrice(p))}원</span></a>`
          )
          .join('') +
        (hits.length > 6 ? `<a class="s-all" href="search.html?q=${encodeURIComponent(q)}">“${searchEsc(q)}” 결과 ${hits.length}개 모두 보기</a>` : '')
      : `<p class="s-none">“${searchEsc(q)}”에 맞는 상품이 없어요</p>`;
  });
  input.addEventListener('keydown', (e) => {
    const list = items();
    if (e.key === 'Escape') return close();
    if (!list.length || box.hidden) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length;
      mark();
    }
    if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      location.href = list[active].href;
    }
  });
  form.addEventListener('submit', (e) => {
    if (!input.value.trim()) e.preventDefault();
  });
  document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) close();
  });
})();

(function renderResults() {
  const box = document.getElementById('results');
  if (!box) return;
  const q = (new URLSearchParams(location.search).get('q') || '').trim();
  const hits = searchProducts(q);
  document.getElementById('resultTitle').textContent = q ? `“${q}” 검색 결과` : '검색';
  document.getElementById('resultCount').textContent = q ? `${hits.length}개의 상품` : '검색어를 입력해 주세요';
  document.title = (q ? `“${q}” 검색 결과` : '검색') + ' | STYLE STORE';
  box.innerHTML = hits.length
    ? hits
        .map(
          (p) => `<a class="card" href="${productUrl(p)}">
      <div class="thumb" style="background:${p.color}">${imgTag(p)}</div>
      <div class="info">
        <p class="brand">${searchEsc(p.brand)} <span class="gtag">${GENDERS[p.gender]}</span></p>
        <p class="name">${searchEsc(p.name)}</p>
        <p class="price"><b class="off">${p.off}%</b> ${won(salePrice(p))}원</p>
      </div></a>`
        )
        .join('')
    : q
      ? '<p class="s-none wide">검색 결과가 없어요. 브랜드, 상품명, “여성 신발”처럼 다시 검색해 보세요.</p>'
      : '';
})();
