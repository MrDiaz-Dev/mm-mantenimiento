# Contexto del Proyecto: App de Entrenamiento Personalizado (Entrenador - Clientes)

## 1. Descripción General
Estamos desarrollando una aplicación móvil y web construida sobre **Ionic + Angular (Standalone Components) con Capacitor**, conectada directamente a **Supabase** como Backend-as-a-Service (PostgreSQL, Auth y Row Level Security). 

La app gestiona la relación entre entrenadores (`admin`) y sus alumnos (`cliente`), permitiendo estructurar planes semanales por bloques (Entrenamiento A, B, C... G), consultar ejercicios con imágenes demostrativas de postura inicial/final y registrar la ejecución de los entrenamientos.

Ya contamos con la base limpia del proyecto Ionic configurada; vamos a construir los servicios, flujos de autenticación y vistas directamente sobre esta base.

---

## 2. Configuración de Backend (Supabase)
* **Supabase URL:** `https://qhogyytjirzcxyzmnmvs.supabase.co` *(usar la base sin `/rest/v1/` para el cliente de supabase-js)*
* **Supabase Anon Key:** `[REEMPLAZAR_CON_TU_ANON_KEY]`
* **Librería de conexión:** `@supabase/supabase-js`

---

## 3. Esquema de Base de Datos Implementado (PostgreSQL / Supabase)
Todas las tablas cuentan con Row Level Security (RLS) activo y están en español:

* **`perfiles`**: Extensión de `auth.users`. Contiene `id` (UUID), `rol` (`admin` | `cliente`), `nombre_completo`, `email`, `url_avatar` y `entrenador_id` (vincula clientes con su entrenador).
* **`metricas_cliente`**: Historial antropométrico (`peso_kg`, `altura_m`, `notas`, `registrado_en`).
* **`ejercicios`**: Catálogo maestro (`nombre`, `grupo_muscular`, `equipo`, `url_inicio`, `url_final`, `es_personalizado`, `creado_por`).
* **`planes_entrenamiento`**: Cabecera del programa (`entrenador_id`, `cliente_id`, `titulo`, `objetivo`, `dias_por_semana`, `fecha_inicio`, `fecha_fin`, `esta_activo`).
* **`dias_entrenamiento`**: Bloques de la rutina (`plan_id`, `letra_dia` ['A' a 'G'], `nombre`, `enfoque`, `orden`).
* **`ejercicios_dia`**: Detalle del ejercicio en el día (`dia_entrenamiento_id`, `ejercicio_id`, `series`, `repeticiones`, `carga_kg`, `descanso_segundos`, `observaciones`, `orden`).
* **`registros_entrenamiento`**: Sesiones completadas por el alumno (`cliente_id`, `dia_entrenamiento_id`, `completado_en`, `duracion_minutos`, `comentarios`).

---

## 4. Qué debemos implementar a continuación (Siguiente Fase)

Ayúdame a implementar de forma limpia y modular los siguientes componentes:

1. **Servicio Central de Supabase y Autenticación (`AuthService`):**
   * Inicialización del cliente `@supabase/supabase-js` con las variables de `environment`.
   * Manejo de sesión persistente y estado reactivo del usuario/perfil actual (usando Angular Signals).
   * Métodos: `iniciarSesion()`, `registrar()` (pasando metadatos para que el trigger SQL cree el perfil), `cerrarSesion()` y `obtenerPerfil()`.

2. **Protección de Rutas (`Guards` funcionales):**
   * `authGuard`: Verifica sesión activa; si no existe, redirige a `/login`.
   * `rolGuard` / `soloEntrenadorGuard`: Redirige al panel del entrenador si es `admin` o a la vista de rutinas si es `cliente`.

3. **Página de Autenticación (`/login`):**
   * Formulario con switch entre Iniciar Sesión y Registro (con selector de rol: Entrenador o Cliente).
   * Manejo de feedback con `ion-loading` e `ion-toast`.

4. **Estructura base de Vistas y Rutas:**
   * **Flujo Entrenador (`/trainer`):**
     * Vista de clientes vinculados.
     * Creador/asignador de planes y días de entrenamiento con selector de ejercicios.
   * **Flujo Alumno (`/client`):**
     * Vista de la rutina activa dividida por bloques (Día A, B, C...).
     * Tarjetas de ejercicios con imágenes de inicio y fin (`url_inicio`, `url_final`).
     * Acción para marcar entrenamiento completado.

Por favor, revisa el proyecto y comencemos con el paso 1 (instalación del cliente, variables de entorno y `AuthService`).