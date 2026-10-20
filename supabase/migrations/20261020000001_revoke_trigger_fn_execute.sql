-- 트리거 전용 함수는 API(RPC)로 직접 호출되지 않도록 실행 권한을 회수합니다.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_review_author() from public, anon, authenticated;
