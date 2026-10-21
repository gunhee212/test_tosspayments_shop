// 로그인·회원가입 (login.html)
let mode = 'login';
const q = new URLSearchParams(location.search);
// 같은 사이트의 페이지로만 돌아가게 제한합니다.
const next = /^[\w-]+\.html(\?[\w%=&.+-]*)?$/.test(q.get('next') || '') ? q.get('next') : 'index.html';
const $ = (id) => document.getElementById(id);

document.querySelectorAll('.tabs button').forEach((b) =>
  b.addEventListener('click', () => {
    mode = b.dataset.mode;
    document.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('active', x === b));
    $('nameRow').hidden = mode !== 'signup';
    $('password').autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
    $('submit').textContent = mode === 'signup' ? '가입하기' : '로그인';
    $('msg').textContent = '';
  })
);

ready.then(() => { if (me) location.replace(next); });

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('email').value.trim();
  const password = $('password').value;
  const name = $('name').value.trim();
  const msg = $('msg');
  msg.textContent = '';
  if (!email || !password) return (msg.textContent = '이메일과 비밀번호를 입력해주세요.');
  if (mode === 'signup' && !name) return (msg.textContent = '이름을 입력해주세요.');
  $('submit').disabled = true;
  const { data, error } =
    mode === 'signup'
      ? await sb.auth.signUp({ email, password, options: { data: { name } } })
      : await sb.auth.signInWithPassword({ email, password });
  $('submit').disabled = false;
  if (error) {
    msg.textContent =
      error.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 올바르지 않아요.' : error.message;
    return;
  }
  if (!data.session) {
    msg.textContent = '가입 완료! 이메일로 보낸 인증 링크를 확인한 뒤 로그인해주세요.';
    return;
  }
  location.href = next;
});
