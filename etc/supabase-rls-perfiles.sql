-- Pegar en Supabase: SQL Editor → Run
-- Corrige 42P17 (recursión infinita en RLS de perfiles).
-- Alineado con: admin vincula, entrenador ve alumnos, alumno ve a su entrenador.

--#region Funciones sin RLS
create or replace function public.es_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.perfiles
    where id = auth.uid()
      and rol = 'admin'
  );
$$;

create or replace function public.mi_entrenador_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select entrenador_id
  from public.perfiles
  where id = auth.uid();
$$;

grant execute on function public.es_admin() to authenticated;
grant execute on function public.mi_entrenador_id() to authenticated;
--#endregion

--#region Limpiar políticas viejas de perfiles
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'perfiles'
  loop
    execute format('drop policy if exists %I on public.perfiles', pol.policyname);
  end loop;
end $$;
--#endregion

--#region Políticas de perfiles
alter table public.perfiles enable row level security;

-- Lectura: propio, entrenador de ese cliente, alumno lee a su entrenador, admin lee todo.
create policy "Lectura de perfiles autorizados"
  on public.perfiles
  for select
  to authenticated
  using (
    auth.uid() = id
    or auth.uid() = entrenador_id
    or id = public.mi_entrenador_id()
    or public.es_admin()
  );

-- Actualización: propio, o admin asignando entrenador_id a un cliente.
create policy "Actualizacion de perfiles autorizada"
  on public.perfiles
  for update
  to authenticated
  using (auth.uid() = id or public.es_admin())
  with check (auth.uid() = id or public.es_admin());

-- Inserción propia (el trigger de alta ya es SECURITY DEFINER; esto es respaldo).
create policy "Insercion de perfil propio"
  on public.perfiles
  for insert
  to authenticated
  with check (auth.uid() = id);
--#endregion
