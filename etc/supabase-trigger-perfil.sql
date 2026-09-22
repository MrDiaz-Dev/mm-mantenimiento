-- Pegar en Supabase: SQL Editor → Run
-- Corrige "Database error saving new user" al registrar desde la app.

create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, email, rol, nombre_completo)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'rol', ''), 'cliente'),
    coalesce(
      nullif(new.raw_user_meta_data->>'nombre_completo', ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
exception
  when unique_violation then
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.manejar_nuevo_usuario();

grant execute on function public.manejar_nuevo_usuario() to supabase_auth_admin;
grant execute on function public.manejar_nuevo_usuario() to postgres;
