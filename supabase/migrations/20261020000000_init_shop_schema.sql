-- STYLE STORE 스키마: 회원·상품·주문·리뷰·좋아요 + RLS
-- (Supabase 프로젝트 tosspayments-shop에 이미 적용된 내용과 같습니다)

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text,
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  brand text not null,
  name text not null,
  price int not null check (price > 0),
  off int not null default 0 check (off between 0 and 100),
  sizes text[] not null
);

create table public.orders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id),
  size text not null,
  amount int not null,
  status text not null default 'pending' check (status in ('pending','paid','canceled','failed')),
  payment_key text,
  paid_at timestamptz,
  canceled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id, created_at desc);

create table public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id),
  order_id text not null unique references public.orders(id),
  author_name text not null default '',
  rating int not null check (rating between 1 and 5),
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index reviews_product_idx on public.reviews(product_id, created_at desc);

create table public.review_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  review_id bigint not null references public.reviews(id) on delete cascade,
  primary key (user_id, review_id)
);

create table public.product_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id),
  primary key (user_id, product_id)
);

-- 가입 시 프로필 자동 생성
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''), new.raw_user_meta_data->>'phone');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 리뷰 작성자 이름 자동 채우기
create function public.set_review_author() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  select name into new.author_name from public.profiles where id = new.user_id;
  return new;
end $$;
create trigger reviews_set_author before insert on public.reviews
  for each row execute function public.set_review_author();

-- 주문 생성: 금액은 DB 가격으로 서버에서 계산 (js/data.js의 salePrice()와 같은 식)
create function public.create_order(p_product_id text, p_size text)
returns table(order_id text, amount int, order_name text)
language plpgsql security definer set search_path = '' as $$
declare
  p public.products;
  v_id text;
  v_amount int;
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  select * into p from public.products where id = p_product_id;
  if not found then raise exception 'unknown product'; end if;
  if not (p_size = any(p.sizes)) then raise exception 'invalid size'; end if;
  v_amount := floor((p.price * (100 - p.off))::numeric / 100 / 100)::int * 100;
  v_id := 'ORD-' || replace(gen_random_uuid()::text, '-', '');
  insert into public.orders(id, user_id, product_id, size, amount)
  values (v_id, auth.uid(), p.id, p_size, v_amount);
  return query select v_id, v_amount, p.brand || ' ' || p.name || ' (' || p_size || ')';
end $$;
revoke all on function public.create_order(text, text) from public, anon;
grant execute on function public.create_order(text, text) to authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.review_likes enable row level security;
alter table public.product_likes enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "products_select_all" on public.products for select to anon, authenticated using (true);

-- 주문: 본인 조회만. 쓰기는 RPC/서버(service role)만.
create policy "orders_select_own" on public.orders for select to authenticated using (user_id = (select auth.uid()));

-- 리뷰: 누구나 읽기, 결제 완료 주문에 한해 본인만 작성
create policy "reviews_select_all" on public.reviews for select to anon, authenticated using (true);
create policy "reviews_insert_paid" on public.reviews for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = (select auth.uid())
        and o.product_id = reviews.product_id and o.status = 'paid'
    )
  );
create policy "reviews_update_own" on public.reviews for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "reviews_delete_own" on public.reviews for delete to authenticated using (user_id = (select auth.uid()));

create policy "review_likes_select_all" on public.review_likes for select to anon, authenticated using (true);
create policy "review_likes_insert_own" on public.review_likes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "review_likes_delete_own" on public.review_likes for delete to authenticated using (user_id = (select auth.uid()));

create policy "product_likes_select_own" on public.product_likes for select to authenticated using (user_id = (select auth.uid()));
create policy "product_likes_insert_own" on public.product_likes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "product_likes_delete_own" on public.product_likes for delete to authenticated using (user_id = (select auth.uid()));

-- 리뷰는 별점·후기만, 프로필은 이름·연락처만 수정 가능
revoke update on public.reviews from authenticated;
grant update (rating, content) on public.reviews to authenticated;
revoke update on public.profiles from authenticated;
grant update (name, phone) on public.profiles to authenticated;

-- 상품 시드: js/data.js와 동일하게 유지해야 합니다 (금액 검증용)
insert into public.products(id, brand, name, price, off, sizes) values
('c1','ARCHIVE','오버사이즈 코튼 반팔 티셔츠',39000,20,'{S,M,L,XL}'),
('c2','NOWHERE','와이드 후드 집업',89000,30,'{M,L,XL}'),
('c3','URBAN LAB','레귤러핏 옥스포드 셔츠',59000,15,'{S,M,L}'),
('c4','ARCHIVE','헤비웨이트 스웨트셔츠',69000,25,'{M,L,XL}'),
('c5','MONO','싱글 코트 울 블렌드',189000,35,'{M,L}'),
('c6','NOWHERE','나일론 바람막이 자켓',79000,10,'{S,M,L,XL}'),
('c7','MONO','카라 니트 가디건',64000,18,'{S,M,L}'),
('c8','URBAN LAB','데일리 크루넥 긴팔 티',29000,12,'{S,M,L,XL}'),
('s1','STRIDE','클래식 레더 스니커즈',98000,20,'{250,260,270,280}'),
('s2','STRIDE','러닝 메쉬 워커',119000,25,'{250,260,270,280}'),
('s3','TREK','미드컷 캔버스 하이탑',62000,10,'{240,250,260,270}'),
('s4','TREK','아웃도어 트레킹 부츠',159000,30,'{260,270,280}'),
('s5','LOAFER CO','페니 로퍼 가죽',139000,15,'{250,260,270}'),
('s6','STRIDE','청키 솔 데일리 슬립온',74000,22,'{240,250,260,270}'),
('s7','SLIDE','쿠션 슬라이드 샌들',35000,8,'{250,260,270,280}'),
('s8','LOAFER CO','더비 슈즈 블랙',129000,28,'{250,260,270}'),
('p1','DENIMARK','와이드 데님 팬츠',69000,20,'{28,30,32,34}'),
('p2','DENIMARK','스트레이트 생지 진',79000,15,'{28,30,32,34}'),
('p3','MONO','핀턱 와이드 슬랙스',58000,25,'{28,30,32}'),
('p4','NOWHERE','카고 팬츠 코튼',72000,18,'{30,32,34,36}'),
('p5','ARCHIVE','스웨트 조거 팬츠',45000,12,'{S,M,L,XL}'),
('p6','URBAN LAB','밴딩 치노 팬츠',49000,30,'{28,30,32,34}'),
('p7','NOWHERE','나일론 트랙 팬츠',52000,10,'{S,M,L}'),
('p8','MONO','코듀로이 와이드 팬츠',63000,22,'{28,30,32,34}');
