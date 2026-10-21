-- 배송지: 주문마다 받는 분·연락처·주소·메모를 저장하고, 마지막 배송지를 프로필에 남겨 다음 구매 때 채워 넣습니다.

alter table public.orders
  add column ship_name text,
  add column ship_phone text,
  add column ship_address text,
  add column ship_memo text;

alter table public.profiles add column address text;
grant update (name, phone, address) on public.profiles to authenticated;

-- 배송지를 받는 새 create_order. 기존 2인자 버전은 배포 전 클라이언트가 쓰므로
-- 새 프런트가 배포된 뒤 다음 마이그레이션에서 지웁니다.
create function public.create_order(
  p_product_id text, p_size text,
  p_ship_name text, p_ship_phone text, p_ship_address text, p_ship_memo text default ''
)
returns table(order_id text, amount int, order_name text)
language plpgsql security definer set search_path = '' as $$
declare
  p public.products;
  v_id text;
  v_amount int;
  v_name text := btrim(coalesce(p_ship_name, ''));
  v_phone text := regexp_replace(coalesce(p_ship_phone, ''), '[^0-9]', '', 'g');
  v_addr text := btrim(coalesce(p_ship_address, ''));
  v_memo text := btrim(coalesce(p_ship_memo, ''));
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  select * into p from public.products where id = p_product_id;
  if not found then raise exception 'unknown product'; end if;
  if not (p_size = any(p.sizes)) then raise exception 'invalid size'; end if;
  if char_length(v_name) not between 1 and 30 then raise exception 'invalid ship_name'; end if;
  if v_phone !~ '^0[0-9]{8,10}$' then raise exception 'invalid ship_phone'; end if;
  if char_length(v_addr) not between 5 and 200 then raise exception 'invalid ship_address'; end if;
  if char_length(v_memo) > 100 then raise exception 'invalid ship_memo'; end if;

  v_amount := floor((p.price * (100 - p.off))::numeric / 100 / 100)::int * 100;
  v_id := 'ORD-' || replace(gen_random_uuid()::text, '-', '');
  insert into public.orders(id, user_id, product_id, size, amount, ship_name, ship_phone, ship_address, ship_memo)
  values (v_id, auth.uid(), p.id, p_size, v_amount, v_name, v_phone, v_addr, nullif(v_memo, ''));
  -- 다음 구매 때 채워 넣을 기본 배송지
  update public.profiles set phone = v_phone, address = v_addr where id = auth.uid();
  return query select v_id, v_amount, p.brand || ' ' || p.name || ' (' || p_size || ')';
end $$;
revoke all on function public.create_order(text, text, text, text, text, text) from public, anon;
grant execute on function public.create_order(text, text, text, text, text, text) to authenticated;
