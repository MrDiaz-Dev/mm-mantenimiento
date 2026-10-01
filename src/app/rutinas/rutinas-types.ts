//#region Constants
export const TIPOS_EQUIPO = [
  'Barra',
  'Mancuernas',
  'Máquina',
  'Polea',
  'Peso corporal',
  'BEC',
  'Suspensión',
] as const;

export const TIPOS_ESTRUCTURA = [
  'serie_lineal',
  'superserie',
  'circuito',
  'tabata',
] as const;

export type TipoEquipo = (typeof TIPOS_EQUIPO)[number];
export type TipoEstructura = (typeof TIPOS_ESTRUCTURA)[number];

export const ETIQUETAS_ESTRUCTURA: Record<TipoEstructura, string> = {
  serie_lineal: 'Serie lineal',
  superserie: 'Superserie',
  circuito: 'Circuito',
  tabata: 'Tabata',
};

export const SELECT_ARBOL_ENTRENAMIENTO = `
  id, nombre, descripcion,
  bloques (
    id, nombre, orden, notas,
    bloque_series (
      id, orden, tipo_estructura, cantidad_series, descanso_post_serie_segundos,
      ejercicios_serie (
        id, ejercicio_id, orden, codigo_visible, equipo,
        repeticiones, tiempo_trabajo_segundos, tiempo_descanso_segundos, rpe,
        ejercicios (id, nombre, grupo_muscular, equipo_base, url_recurso, descripcion)
      )
    )
  )
`;

export interface EjercicioCatalogo {
  id: string;
  nombre: string;
  grupo_muscular: string | null;
  equipo_base: string | null;
  url_recurso: string | null;
  descripcion: string | null;
}

export interface EjercicioSerie {
  id?: string;
  ejercicio_id: string;
  orden: number;
  codigo_visible: string | null;
  equipo: string | null;
  repeticiones: number | null;
  tiempo_trabajo_segundos: number | null;
  tiempo_descanso_segundos: number | null;
  rpe: number | null;
  ejercicio: EjercicioCatalogo | null;
}

export interface BloqueSerie {
  id?: string;
  orden: number;
  tipo_estructura: TipoEstructura;
  cantidad_series: number;
  descanso_post_serie_segundos: number | null;
  ejercicios: EjercicioSerie[];
}

export interface Bloque {
  id?: string;
  nombre: string;
  orden: number;
  notas: string | null;
  series: BloqueSerie[];
}

export interface Entrenamiento {
  id: string;
  nombre: string;
  descripcion: string | null;
  bloques: Bloque[];
}

export interface EntrenamientoResumen {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface PlanEntrenamiento {
  id: string;
  titulo: string;
  objetivo: string | null;
  entrenamientos: Entrenamiento[];
}

export interface MetricaCliente {
  peso_kg: number | null;
  altura_m: number | null;
  registrado_en?: string;
}

export interface RegistroSesion {
  id: string;
  completado_en: string;
  nombre_entrenamiento: string | null;
}

/**
 * Arma la línea de la ficha (A1. Press de banca c/Barra x5reps @RPE 8).
 */
export function formatearEjercicio(linea: EjercicioSerie): string {
  const codigo = linea.codigo_visible?.trim();
  const nombre = linea.ejercicio?.nombre ?? 'Ejercicio';
  const cabeza = codigo ? `${codigo}. ${nombre}` : nombre;
  const equipo = linea.equipo?.trim();
  const conEquipo =
    equipo && equipo !== 'Peso corporal' ? `${cabeza} c/${equipo}` : cabeza;

  if (linea.tiempo_trabajo_segundos != null) {
    const descanso =
      linea.tiempo_descanso_segundos != null
        ? ` x${linea.tiempo_descanso_segundos}"`
        : '';
    const rpe = linea.rpe != null ? ` @RPE ${linea.rpe}` : '';
    return `${conEquipo} ${linea.tiempo_trabajo_segundos}"${descanso}${rpe}`;
  }

  const reps =
    linea.repeticiones != null ? ` x${linea.repeticiones}reps` : '';
  const rpe = linea.rpe != null ? ` @RPE ${linea.rpe}` : '';
  return `${conEquipo}${reps}${rpe}`;
}

export function formatearPieSerie(serie: BloqueSerie): string {
  const pie = `${serie.cantidad_series} series`;
  if (serie.tipo_estructura === 'serie_lineal') {
    return pie;
  }
  return `${pie} · ${ETIQUETAS_ESTRUCTURA[serie.tipo_estructura]}`;
}
//#endregion

