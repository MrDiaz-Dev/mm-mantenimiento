-- Pegar en Supabase: SQL Editor → Run
-- Crea el perfil al registrar. Roles públicos: cliente | entrenador.

create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rol_nuevo text;
begin
  rol_nuevo := coalesce(nullif(new.raw_user_meta_data->>'rol', ''), 'cliente');

  if rol_nuevo not in ('cliente', 'entrenador') then
    rol_nuevo := 'cliente';
  end if;

  insert into public.perfiles (id, email, rol, nombre_completo)
  values (
    new.id,
    new.email,
    rol_nuevo,
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
