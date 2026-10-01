-- Reestructura: entrenamientos por bloques (ficha Vitalia)
-- Origen: planes → días → ejercicios_dia
-- Destino: entrenamientos reutilizables → bloques → series → ejercicios_serie

--#region Enums
ALTER TYPE public.grupo_muscular ADD VALUE IF NOT EXISTS 'Core';
ALTER TYPE public.grupo_muscular ADD VALUE IF NOT EXISTS 'Cuerpo completo';
ALTER TYPE public.tipo_equipo ADD VALUE IF NOT EXISTS 'BEC';
ALTER TYPE public.tipo_equipo ADD VALUE IF NOT EXISTS 'Suspensión';

DO $$ BEGIN
  CREATE TYPE public.tipo_estructura AS ENUM (
    'serie_lineal',
    'superserie',
    'circuito',
    'tabata'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--#endregion

--#region Quitar modelo de días
DROP POLICY IF EXISTS "Acceso a los días de planes permitidos" ON public.dias_entrenamiento;
DROP POLICY IF EXISTS "Acceso a los ejercicios de días permitidos" ON public.ejercicios_dia;
DROP POLICY IF EXISTS "Clientes gestionan sus propios registros de entrenamiento" ON public.registros_entrenamiento;
DROP POLICY IF EXISTS "Entrenadores pueden consultar el historial de sus clientes" ON public.registros_entrenamiento;

ALTER TABLE public.registros_entrenamiento
  DROP CONSTRAINT IF EXISTS registros_entrenamiento_dia_entrenamiento_id_fkey;
ALTER TABLE public.registros_entrenamiento
  DROP COLUMN IF EXISTS dia_entrenamiento_id;

DROP TABLE IF EXISTS public.ejercicios_dia;
DROP TABLE IF EXISTS public.dias_entrenamiento;
--#endregion

--#region Catálogo y plan
ALTER TABLE public.ejercicios RENAME COLUMN equipo TO equipo_base;
ALTER TABLE public.ejercicios DROP COLUMN IF EXISTS url_inicio;
ALTER TABLE public.ejercicios DROP COLUMN IF EXISTS url_final;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS url_recurso text;
ALTER TABLE public.ejercicios ADD COLUMN IF NOT EXISTS descripcion text;

ALTER TABLE public.planes_entrenamiento
  DROP CONSTRAINT IF EXISTS planes_entrenamiento_dias_por_semana_check;
ALTER TABLE public.planes_entrenamiento
  DROP COLUMN IF EXISTS dias_por_semana;
--#endregion

--#region Tablas nuevas
CREATE TABLE IF NOT EXISTS public.entrenamientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entrenador_id uuid NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  creado_en timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  actualizado_en timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.bloques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entrenamiento_id uuid NOT NULL REFERENCES public.entrenamientos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  orden int NOT NULL DEFAULT 1,
  notas text
);

CREATE TABLE IF NOT EXISTS public.bloque_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bloque_id uuid NOT NULL REFERENCES public.bloques(id) ON DELETE CASCADE,
  orden int NOT NULL DEFAULT 1,
  tipo_estructura public.tipo_estructura NOT NULL DEFAULT 'circuito',
  cantidad_series int NOT NULL DEFAULT 1 CHECK (cantidad_series >= 1),
  descanso_post_serie_segundos int CHECK (descanso_post_serie_segundos >= 0)
);

CREATE TABLE IF NOT EXISTS public.ejercicios_serie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bloque_serie_id uuid NOT NULL REFERENCES public.bloque_series(id) ON DELETE CASCADE,
  ejercicio_id uuid NOT NULL REFERENCES public.ejercicios(id) ON DELETE RESTRICT,
  orden int NOT NULL DEFAULT 1,
  codigo_visible text,
  equipo public.tipo_equipo,
  repeticiones int CHECK (repeticiones > 0),
  tiempo_trabajo_segundos int CHECK (tiempo_trabajo_segundos > 0),
  tiempo_descanso_segundos int CHECK (tiempo_descanso_segundos >= 0),
  rpe numeric(3, 1) CHECK (rpe BETWEEN 1 AND 10),
  CHECK (repeticiones IS NOT NULL OR tiempo_trabajo_segundos IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.plan_entrenamientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.planes_entrenamiento(id) ON DELETE CASCADE,
  entrenamiento_id uuid NOT NULL REFERENCES public.entrenamientos(id) ON DELETE RESTRICT,
  orden int NOT NULL DEFAULT 1,
  UNIQUE (plan_id, entrenamiento_id)
);

ALTER TABLE public.registros_entrenamiento
  ADD COLUMN IF NOT EXISTS entrenamiento_id uuid REFERENCES public.entrenamientos(id) ON DELETE RESTRICT;
ALTER TABLE public.registros_entrenamiento
  ALTER COLUMN entrenamiento_id SET NOT NULL;
--#endregion

--#region Índices
CREATE INDEX IF NOT EXISTS entrenamientos_entrenador_id_idx
  ON public.entrenamientos (entrenador_id);
CREATE INDEX IF NOT EXISTS bloques_entrenamiento_id_idx
  ON public.bloques (entrenamiento_id);
CREATE INDEX IF NOT EXISTS bloque_series_bloque_id_idx
  ON public.bloque_series (bloque_id);
CREATE INDEX IF NOT EXISTS ejercicios_serie_bloque_serie_id_idx
  ON public.ejercicios_serie (bloque_serie_id);
CREATE INDEX IF NOT EXISTS ejercicios_serie_ejercicio_id_idx
  ON public.ejercicios_serie (ejercicio_id);
CREATE INDEX IF NOT EXISTS plan_entrenamientos_plan_id_idx
  ON public.plan_entrenamientos (plan_id);
CREATE INDEX IF NOT EXISTS plan_entrenamientos_entrenamiento_id_idx
  ON public.plan_entrenamientos (entrenamiento_id);
CREATE INDEX IF NOT EXISTS registros_entrenamiento_entrenamiento_id_idx
  ON public.registros_entrenamiento (entrenamiento_id);
CREATE INDEX IF NOT EXISTS registros_entrenamiento_cliente_id_idx
  ON public.registros_entrenamiento (cliente_id);
CREATE INDEX IF NOT EXISTS metricas_cliente_cliente_id_idx
  ON public.metricas_cliente (cliente_id);
CREATE INDEX IF NOT EXISTS planes_entrenamiento_cliente_id_idx
  ON public.planes_entrenamiento (cliente_id);
CREATE INDEX IF NOT EXISTS planes_entrenamiento_entrenador_id_idx
  ON public.planes_entrenamiento (entrenador_id);
CREATE INDEX IF NOT EXISTS perfiles_entrenador_id_idx
  ON public.perfiles (entrenador_id);
CREATE INDEX IF NOT EXISTS ejercicios_creado_por_idx
  ON public.ejercicios (creado_por);
--#endregion

--#region Permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entrenamientos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bloques TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bloque_series TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ejercicios_serie TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_entrenamientos TO authenticated;
GRANT ALL ON public.entrenamientos TO service_role;
GRANT ALL ON public.bloques TO service_role;
GRANT ALL ON public.bloque_series TO service_role;
GRANT ALL ON public.ejercicios_serie TO service_role;
GRANT ALL ON public.plan_entrenamientos TO service_role;
--#endregion

--#region RLS
ALTER TABLE public.entrenamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloque_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejercicios_serie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_entrenamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_entrenamiento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Entrenadores gestionan sus entrenamientos" ON public.entrenamientos;
CREATE POLICY "Entrenadores gestionan sus entrenamientos"
  ON public.entrenamientos FOR ALL TO authenticated
  USING (entrenador_id = (SELECT auth.uid()) OR (SELECT public.es_admin()))
  WITH CHECK (entrenador_id = (SELECT auth.uid()) OR (SELECT public.es_admin()));

DROP POLICY IF EXISTS "Alumnos leen entrenamientos de su plan" ON public.entrenamientos;
CREATE POLICY "Alumnos leen entrenamientos de su plan"
  ON public.entrenamientos FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.plan_entrenamientos pe
      JOIN public.planes_entrenamiento p ON p.id = pe.plan_id
      WHERE pe.entrenamiento_id = entrenamientos.id
        AND p.cliente_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Lectura de bloques visibles" ON public.bloques;
CREATE POLICY "Lectura de bloques visibles"
  ON public.bloques FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.entrenamientos e
      WHERE e.id = bloques.entrenamiento_id
    )
  );

DROP POLICY IF EXISTS "Entrenadores escriben bloques propios" ON public.bloques;
CREATE POLICY "Entrenadores escriben bloques propios"
  ON public.bloques FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.entrenamientos e
      WHERE e.id = bloques.entrenamiento_id
        AND (e.entrenador_id = (SELECT auth.uid()) OR (SELECT public.es_admin()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.entrenamientos e
      WHERE e.id = bloques.entrenamiento_id
        AND (e.entrenador_id = (SELECT auth.uid()) OR (SELECT public.es_admin()))
    )
  );

DROP POLICY IF EXISTS "Lectura de series visibles" ON public.bloque_series;
CREATE POLICY "Lectura de series visibles"
  ON public.bloque_series FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bloques b
      WHERE b.id = bloque_series.bloque_id
    )
  );

DROP POLICY IF EXISTS "Entrenadores escriben series propias" ON public.bloque_series;
CREATE POLICY "Entrenadores escriben series propias"
  ON public.bloque_series FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.bloques b
      JOIN public.entrenamientos e ON e.id = b.entrenamiento_id
      WHERE b.id = bloque_series.bloque_id
        AND (e.entrenador_id = (SELECT auth.uid()) OR (SELECT public.es_admin()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.bloques b
      JOIN public.entrenamientos e ON e.id = b.entrenamiento_id
      WHERE b.id = bloque_series.bloque_id
        AND (e.entrenador_id = (SELECT auth.uid()) OR (SELECT public.es_admin()))
    )
  );

DROP POLICY IF EXISTS "Lectura de ejercicios de serie visibles" ON public.ejercicios_serie;
CREATE POLICY "Lectura de ejercicios de serie visibles"
  ON public.ejercicios_serie FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bloque_series s
      WHERE s.id = ejercicios_serie.bloque_serie_id
    )
  );

DROP POLICY IF EXISTS "Entrenadores escriben ejercicios de serie propios" ON public.ejercicios_serie;
CREATE POLICY "Entrenadores escriben ejercicios de serie propios"
  ON public.ejercicios_serie FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.bloque_series s
      JOIN public.bloques b ON b.id = s.bloque_id
      JOIN public.entrenamientos e ON e.id = b.entrenamiento_id
      WHERE s.id = ejercicios_serie.bloque_serie_id
        AND (e.entrenador_id = (SELECT auth.uid()) OR (SELECT public.es_admin()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.bloque_series s
      JOIN public.bloques b ON b.id = s.bloque_id
      JOIN public.entrenamientos e ON e.id = b.entrenamiento_id
      WHERE s.id = ejercicios_serie.bloque_serie_id
        AND (e.entrenador_id = (SELECT auth.uid()) OR (SELECT public.es_admin()))
    )
  );

DROP POLICY IF EXISTS "Lectura de asignaciones de plan" ON public.plan_entrenamientos;
CREATE POLICY "Lectura de asignaciones de plan"
  ON public.plan_entrenamientos FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.planes_entrenamiento p
      WHERE p.id = plan_entrenamientos.plan_id
    )
  );

DROP POLICY IF EXISTS "Entrenadores asignan entrenamientos a sus planes" ON public.plan_entrenamientos;
CREATE POLICY "Entrenadores asignan entrenamientos a sus planes"
  ON public.plan_entrenamientos FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.planes_entrenamiento p
      WHERE p.id = plan_entrenamientos.plan_id
        AND (p.entrenador_id = (SELECT auth.uid()) OR (SELECT public.es_admin()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.planes_entrenamiento p
      WHERE p.id = plan_entrenamientos.plan_id
        AND (p.entrenador_id = (SELECT auth.uid()) OR (SELECT public.es_admin()))
    )
  );

DROP POLICY IF EXISTS "Clientes gestionan sus propios registros de entrenamiento" ON public.registros_entrenamiento;
CREATE POLICY "Clientes gestionan sus propios registros de entrenamiento"
  ON public.registros_entrenamiento FOR ALL TO authenticated
  USING (cliente_id = (SELECT auth.uid()))
  WITH CHECK (
    cliente_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.plan_entrenamientos pe
      JOIN public.planes_entrenamiento p ON p.id = pe.plan_id
      WHERE pe.entrenamiento_id = registros_entrenamiento.entrenamiento_id
        AND p.cliente_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Entrenadores pueden consultar el historial de sus clientes" ON public.registros_entrenamiento;
CREATE POLICY "Entrenadores pueden consultar el historial de sus clientes"
  ON public.registros_entrenamiento FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles pf
      WHERE pf.id = registros_entrenamiento.cliente_id
        AND pf.entrenador_id = (SELECT auth.uid())
    )
  );
--#endregion

--#region RPC
CREATE OR REPLACE FUNCTION public.guardar_entrenamiento(p jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_uid uuid := auth.uid();
  v_bloque jsonb;
  v_serie jsonb;
  v_ej jsonb;
  v_bloque_id uuid;
  v_serie_id uuid;
  v_orden_b int := 0;
  v_orden_s int;
  v_orden_e int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  IF COALESCE(p->>'nombre', '') = '' THEN
    RAISE EXCEPTION 'El entrenamiento necesita un nombre';
  END IF;

  v_id := NULLIF(p->>'id', '')::uuid;

  IF v_id IS NULL THEN
    INSERT INTO public.entrenamientos (entrenador_id, nombre, descripcion)
    VALUES (v_uid, p->>'nombre', NULLIF(p->>'descripcion', ''))
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.entrenamientos
    SET nombre = p->>'nombre',
        descripcion = NULLIF(p->>'descripcion', ''),
        actualizado_en = timezone('utc', now())
    WHERE id = v_id
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
      RAISE EXCEPTION 'No se encontró el entrenamiento';
    END IF;
  END IF;

  DELETE FROM public.bloques WHERE entrenamiento_id = v_id;

  FOR v_bloque IN
    SELECT value FROM jsonb_array_elements(COALESCE(p->'bloques', '[]'::jsonb))
  LOOP
    v_orden_b := v_orden_b + 1;
    INSERT INTO public.bloques (entrenamiento_id, nombre, orden, notas)
    VALUES (
      v_id,
      COALESCE(NULLIF(v_bloque->>'nombre', ''), 'Bloque'),
      COALESCE((v_bloque->>'orden')::int, v_orden_b),
      NULLIF(v_bloque->>'notas', '')
    )
    RETURNING id INTO v_bloque_id;

    v_orden_s := 0;
    FOR v_serie IN
      SELECT value FROM jsonb_array_elements(COALESCE(v_bloque->'series', '[]'::jsonb))
    LOOP
      v_orden_s := v_orden_s + 1;
      INSERT INTO public.bloque_series (
        bloque_id, orden, tipo_estructura, cantidad_series, descanso_post_serie_segundos
      ) VALUES (
        v_bloque_id,
        COALESCE((v_serie->>'orden')::int, v_orden_s),
        COALESCE((v_serie->>'tipo_estructura')::public.tipo_estructura, 'circuito'),
        COALESCE((v_serie->>'cantidad_series')::int, 1),
        NULLIF(v_serie->>'descanso_post_serie_segundos', '')::int
      )
      RETURNING id INTO v_serie_id;

      v_orden_e := 0;
      FOR v_ej IN
        SELECT value FROM jsonb_array_elements(COALESCE(v_serie->'ejercicios', '[]'::jsonb))
      LOOP
        IF NULLIF(v_ej->>'ejercicio_id', '') IS NULL THEN
          CONTINUE;
        END IF;
        v_orden_e := v_orden_e + 1;
        INSERT INTO public.ejercicios_serie (
          bloque_serie_id, ejercicio_id, orden, codigo_visible, equipo,
          repeticiones, tiempo_trabajo_segundos, tiempo_descanso_segundos, rpe
        ) VALUES (
          v_serie_id,
          (v_ej->>'ejercicio_id')::uuid,
          COALESCE((v_ej->>'orden')::int, v_orden_e),
          NULLIF(v_ej->>'codigo_visible', ''),
          NULLIF(v_ej->>'equipo', '')::public.tipo_equipo,
          NULLIF(v_ej->>'repeticiones', '')::int,
          NULLIF(v_ej->>'tiempo_trabajo_segundos', '')::int,
          NULLIF(v_ej->>'tiempo_descanso_segundos', '')::int,
          NULLIF(v_ej->>'rpe', '')::numeric
        );
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.guardar_entrenamiento(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.guardar_entrenamiento(jsonb) TO service_role;
--#endregion

--#region Semilla de la ficha
INSERT INTO public.ejercicios (nombre, grupo_muscular, equipo_base, es_personalizado)
SELECT v.nombre, v.grupo::public.grupo_muscular, v.equipo::public.tipo_equipo, false
FROM (
  VALUES
    ('Movilidad de tronco', 'Core', 'Peso corporal'),
    ('Movilidad de hombros', 'Hombros', 'Peso corporal'),
    ('Press de banca', 'Pecho', 'Barra'),
    ('Push up resistido', 'Pecho', 'BEC'),
    ('ABS twist ruso', 'Abdomen', 'Peso corporal'),
    ('Aperturas inclinadas', 'Pecho', 'Mancuernas'),
    ('Floor press', 'Pecho', 'Mancuernas'),
    ('Push up declinado', 'Pecho', 'Peso corporal'),
    ('Tríceps tipo copa', 'Tríceps', 'Mancuernas'),
    ('Extensiones de codos', 'Tríceps', 'BEC'),
    ('Tríceps en suspensión', 'Tríceps', 'Suspensión'),
    ('Repiqueteo y escaladores', 'Cuerpo completo', 'Peso corporal')
) AS v(nombre, grupo, equipo)
WHERE NOT EXISTS (
  SELECT 1 FROM public.ejercicios e WHERE e.nombre = v.nombre
);
--#endregion
