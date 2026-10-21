-- 배송지를 받지 않던 옛 create_order(text, text)를 지웁니다.
-- 새 프런트(배송지 6인자 버전)가 배포된 뒤라 더 이상 쓰이지 않습니다.
drop function if exists public.create_order(text, text);
