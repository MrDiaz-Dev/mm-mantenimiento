-- Pegar en Supabase: SQL Editor → Run
-- Tres roles: admin, entrenador, cliente.

do $$
declare
  tipo_rol text;
  es_enum boolean;
begin
  select t.typname, (t.typtype = 'e')
  into tipo_rol, es_enum
  from pg_attribute a
  join pg_class c on a.attrelid = c.oid
  join pg_namespace n on c.relnamespace = n.oid
  join pg_type t on a.atttypid = t.oid
  where n.nspname = 'public'
    and c.relname = 'perfiles'
    and a.attname = 'rol'
    and a.attnum > 0
    and not a.attisdropped;

  if es_enum then
    begin
      execute format('alter type %I add value if not exists %L', tipo_rol, 'entrenador');
    exception
      when duplicate_object then null;
    end;
  else
    alter table public.perfiles drop constraint if exists perfiles_rol_check;
    alter table public.perfiles
      add constraint perfiles_rol_check
      check (rol in ('admin', 'entrenador', 'cliente'));
  end if;
end $$;

-- Si un usuario actual es admin pero debe armar planes, descomenta y pon su correo:
-- update public.perfiles
-- set rol = 'entrenador'
-- where email = 'correo-del-entrenador@ejemplo.com'
--   and rol = 'admin';
