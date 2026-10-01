-- Pegar en Supabase: SQL Editor → Run
-- Crea un usuario admin (auth + perfil).
-- 1. Cambia admin_email y admin_password abajo.
-- 2. Ejecuta supabase-roles.sql y supabase-trigger-perfil.sql antes, si no lo hiciste.

create extension if not exists pgcrypto;

do $$
declare
  admin_id uuid := gen_random_uuid();
  admin_email text := 'admin@training.app';
  admin_password text := 'CambiaEstaClave123!';
  admin_nombre text := 'Administrador';
begin
  if exists (select 1 from auth.users where email = admin_email) then
    raise exception 'Ya existe un usuario con el correo %', admin_email;
  end if;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nombre_completo', admin_nombre),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    admin_id,
    jsonb_build_object('sub', admin_id::text, 'email', admin_email),
    'email',
    admin_id::text,
    now(),
    now(),
    now()
  );

  -- El trigger crea el perfil como cliente; lo promovemos a admin.
  update public.perfiles
  set
    rol = 'admin',
    nombre_completo = admin_nombre,
    email = admin_email
  where id = admin_id;

  if not found then
    insert into public.perfiles (id, email, rol, nombre_completo)
    values (admin_id, admin_email, 'admin', admin_nombre);
  end if;

  raise notice 'Admin creado: % (contraseña la que definiste en admin_password)', admin_email;
end $$;
