# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

무신사 스타일의 의류 쇼핑몰 퍼블리싱 데모입니다. 순수 HTML/CSS/JS(프레임워크·빌드 단계 없음)로 만들었고, 토스페이먼츠 결제창 SDK v2(테스트 모드)로 결제까지 연결돼 있습니다. 원격 저장소는 `gunhee212/test_tosspayments_shop`(`main` 브랜치)입니다.

## 실행

빌드, 린트, 테스트 설정은 없습니다. 로컬 확인은 정적 서버로 합니다.

```bash
node server.js          # http://localhost:3000 (PORT 환경변수로 포트 변경)
```

- 결제창은 `http(s)` 주소에서만 동작합니다. `file://`로 열면 `app.js`가 안내 알림을 띄우고 결제를 막습니다.
- `server.js`는 외부 의존성이 없는 정적 파일 서버입니다. API 라우트는 없습니다.
- `.claude/launch.json`(gitignore 대상)은 `node.exe`를 전체 경로(`C:\Program Files\nodejs\node.exe`)로 실행합니다. 앱이 Node 설치 전의 PATH를 들고 있으면 `npx`/`node`가 PATH에서 안 잡히기 때문입니다.
- `.mcp.json`은 토스페이먼츠 연동 가이드 MCP(`@tosspayments/integration-guide-mcp`)를 `npx`로 실행하므로 Node.js가 필요합니다.

## 아키텍처

세 상품 페이지(`index.html`=옷, `shoes.html`=신발, `pants.html`=바지)는 `<body data-category="clothes|shoes|pants">`와 활성 탭만 다르고 마크업이 동일합니다. 헤더, 구매 시트, 스크립트 구성을 바꿀 때는 세 파일을 모두 고쳐야 합니다.

스크립트는 번들러 없이 전역으로 이어집니다. 로드 순서는 토스 SDK(`https://js.tosspayments.com/v2/standard`) → `js/data.js` → `js/app.js`입니다.

- `js/data.js`: 전역 `PRODUCTS`(카테고리별 상품 배열), `CATEGORIES`, 그리고 `salePrice(p)`(정가에 할인율을 적용하고 100원 단위로 내림), `won(n)`. 상품 추가·수정은 여기서 합니다. 이미지는 `color`와 `icon`(이모지) 자리표시입니다.
- `js/app.js`: `body.dataset.category`로 해당 카테고리 상품을 렌더링하고(정렬 포함), 카드 클릭 시 구매 시트를 열고, 사이즈 선택 후 `requestPayment`를 호출합니다. 상태는 모듈 변수 `current = { product, size }` 하나뿐입니다.
- `success.html` / `fail.html`: 토스가 리다이렉트할 때 붙여주는 쿼리스트링(`orderId`, `amount`, `paymentKey` / `code`, `message`)을 화면에 보여주기만 합니다.
- `css/style.css`: 전체 공용 스타일 하나. 반응형 기준은 900px, 640px입니다.

### 결제 흐름과 한계

`app.js`가 `TossPayments(CLIENT_KEY).payment({ customerKey: TossPayments.ANONYMOUS })`로 결제창을 띄웁니다. `successUrl`/`failUrl`은 `location.href`에서 현재 디렉터리를 뽑아 `success.html`/`fail.html`을 붙여 만들기 때문에, 배포 주소가 바뀌어도 코드를 고칠 필요가 없습니다. `orderId`는 클라이언트에서 `ORD-<timestamp>-<random>`으로 만듭니다.

**결제 승인(`POST https://api.tosspayments.com/v1/payments/confirm`)은 구현돼 있지 않습니다.** 현재는 결제 인증까지만 되고 실제 승인은 일어나지 않습니다. 승인을 붙일 때는 다음을 지켜야 합니다.

- 시크릿 키(`test_sk_*`, `live_sk_*`)는 서버 코드에서만 읽고, `NEXT_PUBLIC_`, `VITE_` 같은 공개 접두어 환경변수에 넣지 않습니다.
- `api.tosspayments.com`은 브라우저에서 직접 호출하지 않고 가맹점 서버(API 라우트)가 대신 호출합니다.
- 브라우저 코드에는 클라이언트 키(`test_ck_*`)만 둡니다. 지금 `CLIENT_KEY`는 토스 공용 테스트 키이므로 실서비스 전에 본인 상점 키로 교체해야 합니다.
- 금액은 서버에서 상품 정보로 다시 계산해 검증해야 합니다. 지금은 금액을 클라이언트의 `salePrice()`로만 정합니다.

## Supabase 연동 구현 현황

구현 완료: DB 스키마·RLS(`profiles/products/orders/reviews/review_likes/product_likes`), `create_order` RPC, Edge Function `confirm-payment`·`cancel-payment`, `login.html`/`my.html`/`success.html`, `js/common.js`(Supabase 클라이언트·헤더), `js/my.js`. 주문 상태 변경은 서버(service role)만 하고, 금액은 DB 상품 가격으로 계산합니다. **Edge Function secret `TOSS_SECRET_KEY`는 대시보드/CLI에서 직접 등록해야 합니다.** 상품·가격을 바꾸면 `js/data.js`와 DB `products`를 모두 고칩니다.

### 환경설정 파일

- `js/config.js`: 브라우저용 공개 설정(`SUPABASE_URL`, `SUPABASE_KEY`=publishable 키, `CLIENT_KEY`=토스 클라이언트 키). 스크립트 로드 순서는 `supabase-js` CDN → `data.js` → `config.js` → `common.js` → `app.js`/`my.js`입니다. 키를 바꿀 때는 여기만 고칩니다.
- `supabase/migrations/`: 서버에 적용된 DB 스키마·RLS의 사본입니다. DB를 바꾸면 새 마이그레이션 파일을 추가합니다.
- `supabase/functions/{confirm-payment,cancel-payment}/index.ts`: Edge Function 소스의 사본입니다. 코드를 고치면 Supabase에 다시 배포해야 반영됩니다.
- `supabase/config.toml`: 프로젝트 ref와 함수별 `verify_jwt` 설정.
- `.env.example`: 서버 비밀 값(`TOSS_SECRET_KEY`) 예시입니다. 실제 값은 `.env`(gitignore)나 Supabase secrets에만 둡니다. 브라우저 코드·`js/config.js`에는 시크릿 키를 넣지 않습니다.

## Supabase 연동 (원래 계획)

- 기능 요구사항과 구현 순서는 `PRD.md`가 기준입니다. 범위: 가입/로그인, 로그인 필수 구매, 내 주문 내역, 취소(환불), 리뷰, 좋아요.
- 프로젝트: `tosspayments-shop` (ref `wguagqycggjqnvxjgktz`, 리전 `ap-northeast-2`, 조직 `gunhee212's Org`, 무료 플랜).
- MCP가 두 개 있습니다. `plugin:supabase:supabase`는 OAuth 인증이 필요해서 지금은 쓰지 않고, 별도로 연결된 Supabase 커넥터(`list_projects`, `execute_sql`, `apply_migration` 등)가 정상 동작합니다.
- 프로젝트 생성은 `get_cost` → `confirm_cost` → `create_project(confirm_cost_id)` 순서가 필요합니다. (비용이 $0이어도 필요)
- 브라우저 코드에는 publishable(anon) 키만 두고, 토스 시크릿 키는 Edge Function의 secrets에만 둡니다.

## 참고

- `serve.ps1`은 Node 설치 전에 쓰던 PowerShell 서버로, 지금은 쓰지 않으며 gitignore 처리돼 있습니다.
- 이 저장소의 코드 주석과 UI 문구는 한국어입니다.
