// Supabase 연결 + 헤더 로그인 상태 (모든 페이지 공용)
// 접속 설정은 js/config.js에 있습니다. 브라우저에는 publishable(anon) 키만 둡니다.
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }) : '-');

let me = null; // { id, name } 또는 null

async function loadMe() {
  const { data } = await sb.auth.getSession();
  const user = data.session?.user;
  if (!user) return (me = null);
  let name = user.user_metadata?.name || '';
  const { data: prof } = await sb.from('profiles').select('name').eq('id', user.id).maybeSingle();
  if (prof?.name) name = prof.name;
  return (me = { id: user.id, name: name || user.email });
}

// 로그인 후 지금 보던 화면으로 돌아오게 현재 쿼리를 함께 넘깁니다. params로 값을 덧붙이거나 바꿀 수 있습니다.
function loginUrl(params = {}) {
  const here = location.pathname.split('/').pop() || 'index.html';
  const q = new URLSearchParams(location.search);
  Object.entries(params).forEach(([k, v]) => q.set(k, v));
  const qs = q.toString();
  return 'login.html?next=' + encodeURIComponent(here + (qs ? '?' + qs : ''));
}

function renderHeader() {
  const box = document.getElementById('headIcons');
  if (!box) return;
  box.innerHTML = me
    ? `<span>${esc(me.name)}님</span><a href="my.html">마이</a><a href="#" id="logoutBtn">로그아웃</a>`
    : `<a href="${loginUrl()}">로그인</a><a href="${loginUrl()}">마이</a>`;
  const out = document.getElementById('logoutBtn');
  if (out)
    out.addEventListener('click', async (e) => {
      e.preventDefault();
      await sb.auth.signOut();
      location.href = 'index.html';
    });
}

// 함수 호출 오류에서 서버가 준 메시지를 꺼냅니다.
async function fnError(error) {
  try {
    const body = await error.context.json();
    return body.message || error.message;
  } catch {
    return error.message;
  }
}

const ready = loadMe().then(renderHeader);
