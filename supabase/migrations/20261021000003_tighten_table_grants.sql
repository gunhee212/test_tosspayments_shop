-- 테이블 권한을 RLS 정책과 같은 범위로 줄입니다.
-- Supabase 기본값은 anon·authenticated에 모든 권한(INSERT/UPDATE/DELETE/TRUNCATE…)을 주고 RLS만으로 막습니다.
-- 나중에 정책을 잘못 추가해도 뚫리지 않도록 권한 자체를 필요한 만큼만 남깁니다.
-- 주문 상태 변경은 Edge Function(service role)과 create_order(security definer)가 하므로 영향이 없습니다.

revoke all on public.profiles, public.products, public.orders,
  public.reviews, public.review_likes, public.product_likes
  from anon, authenticated;

-- 비로그인: 상품·리뷰·리뷰 좋아요 읽기만
grant select on public.products, public.reviews, public.review_likes to anon;

-- 로그인 사용자
grant select on public.profiles, public.products, public.orders,
  public.reviews, public.review_likes, public.product_likes to authenticated;
grant update (name, phone, address) on public.profiles to authenticated;
-- 리뷰: 작성자 이름(author_name)은 트리거가, 작성일(created_at)은 기본값이 채웁니다.
grant insert (user_id, product_id, order_id, rating, content) on public.reviews to authenticated;
grant update (rating, content) on public.reviews to authenticated;
grant delete on public.reviews to authenticated;
grant insert, delete on public.review_likes, public.product_likes to authenticated;
