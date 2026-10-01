//#region Imports
import { inject, Injectable } from '@angular/core';

import { AutenticacionSesion, Perfil } from '../autenticacion/autenticacion-sesion';
import {
  EjercicioCatalogo,
  Entrenamiento,
  EntrenamientoResumen,
  MetricaCliente,
  PlanEntrenamiento,
  RegistroSesion,
  SELECT_ARBOL_ENTRENAMIENTO,
  TipoEstructura,
} from './rutinas-types';
//#endregion

@Injectable({
  providedIn: 'root',
})
export class RutinasApi {
  //#region Variables
  private readonly autenticacion = inject(AutenticacionSesion);
  //#endregion

  //#region Methods
  //#region Clientes
  public async listarClientesVinculados(): Promise<Perfil[]> {
    const entrenadorId = this.autenticacion.perfil()?.id;
    if (!entrenadorId) {
      return [];
    }

    const { data, error } = await this.autenticacion.cliente
      .from('perfiles')
      .select('id, rol, nombre_completo, email, url_avatar, entrenador_id')
      .eq('rol', 'cliente')
      .eq('entrenador_id', entrenadorId)
      .order('nombre_completo');

    if (error) {
      throw error;
    }

    return (data as Perfil[]) ?? [];
  }

  public async listarClientes(): Promise<Perfil[]> {
    const { data, error } = await this.autenticacion.cliente
      .from('perfiles')
      .select('id, rol, nombre_completo, email, url_avatar, entrenador_id')
      .eq('rol', 'cliente')
      .order('nombre_completo');

    if (error) {
      throw error;
    }

    return (data as Perfil[]) ?? [];
  }

  public async listarEntrenadores(): Promise<Perfil[]> {
    const { data, error } = await this.autenticacion.cliente
      .from('perfiles')
      .select('id, rol, nombre_completo, email, url_avatar, entrenador_id')
      .eq('rol', 'entrenador')
      .order('nombre_completo');

    if (error) {
      throw error;
    }

    return (data as Perfil[]) ?? [];
  }

  public async asignarEntrenador(
    clienteId: string,
    entrenadorId: string | null
  ): Promise<void> {
    const { error } = await this.autenticacion.cliente
      .from('perfiles')
      .update({ entrenador_id: entrenadorId })
      .eq('id', clienteId);

    if (error) {
      throw error;
    }
  }

  public async obtenerCliente(clienteId: string): Promise<Perfil | null> {
    const { data, error } = await this.autenticacion.cliente
      .from('perfiles')
      .select('id, rol, nombre_completo, email, url_avatar, entrenador_id')
      .eq('id', clienteId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as Perfil | null) ?? null;
  }
  //#endregion

  //#region Catálogo
  public async listarEjercicios(): Promise<EjercicioCatalogo[]> {
    const { data, error } = await this.autenticacion.cliente
      .from('ejercicios')
      .select(
        'id, nombre, grupo_muscular, equipo_base, url_recurso, descripcion'
      )
      .order('nombre');

    if (error) {
      throw error;
    }

    return (data as EjercicioCatalogo[]) ?? [];
  }
  //#endregion

  //#region Biblioteca de entrenamientos
  public async listarEntrenamientos(): Promise<EntrenamientoResumen[]> {
    const { data, error } = await this.autenticacion.cliente
      .from('entrenamientos')
      .select('id, nombre, descripcion')
      .order('nombre');

    if (error) {
      throw error;
    }

    return (data as EntrenamientoResumen[]) ?? [];
  }

  public async obtenerEntrenamiento(
    id: string
  ): Promise<Entrenamiento | null> {
    const { data, error } = await this.autenticacion.cliente
      .from('entrenamientos')
      .select(SELECT_ARBOL_ENTRENAMIENTO)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return this.mapearEntrenamiento(data as RegistroEntrenamientoAnidado);
  }

  public async guardarEntrenamiento(
    entrenamiento: Entrenamiento
  ): Promise<string> {
    const { data, error } = await this.autenticacion.cliente.rpc(
      'guardar_entrenamiento',
      { p: this.payloadEntrenamiento(entrenamiento) }
    );

    if (error) {
      throw error;
    }

    return data as string;
  }
  //#endregion

  //#region Plan
  public async obtenerPlanActivo(
    clienteId: string
  ): Promise<PlanEntrenamiento | null> {
    const { data, error } = await this.autenticacion.cliente
      .from('planes_entrenamiento')
      .select(
        `
        id, titulo, objetivo,
        plan_entrenamientos (
          orden,
          entrenamientos (${SELECT_ARBOL_ENTRENAMIENTO})
        )
      `
      )
      .eq('cliente_id', clienteId)
      .eq('esta_activo', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return this.mapearPlan(data as RegistroPlanAnidado);
  }

  public async guardarPlan(
    clienteId: string,
    titulo: string,
    objetivo: string,
    entrenamientoIds: string[],
    metrica?: MetricaCliente
  ): Promise<void> {
    const entrenadorId = this.autenticacion.perfil()?.id;
    if (!entrenadorId) {
      throw new Error('No hay sesión de entrenador.');
    }

    const supabase = this.autenticacion.cliente;

    const { error: errorDesactivar } = await supabase
      .from('planes_entrenamiento')
      .update({ esta_activo: false })
      .eq('cliente_id', clienteId)
      .eq('esta_activo', true);

    if (errorDesactivar) {
      throw errorDesactivar;
    }

    const { data: plan, error: errorPlan } = await supabase
      .from('planes_entrenamiento')
      .insert({
        entrenador_id: entrenadorId,
        cliente_id: clienteId,
        titulo,
        objetivo: objetivo || null,
        fecha_inicio: new Date().toISOString().slice(0, 10),
        esta_activo: true,
      })
      .select('id')
      .single();

    if (errorPlan) {
      throw errorPlan;
    }

    const asignaciones = entrenamientoIds.map((entrenamientoId, indice) => ({
      plan_id: plan.id,
      entrenamiento_id: entrenamientoId,
      orden: indice + 1,
    }));

    if (asignaciones.length > 0) {
      const { error: errorAsignar } = await supabase
        .from('plan_entrenamientos')
        .insert(asignaciones);

      if (errorAsignar) {
        throw errorAsignar;
      }
    }

    if (metrica && (metrica.peso_kg != null || metrica.altura_m != null)) {
      await this.guardarMetrica(clienteId, metrica);
    }
  }
  //#endregion

  //#region Registro
  public async completarEntrenamiento(
    entrenamientoId: string
  ): Promise<void> {
    const clienteId = this.autenticacion.perfil()?.id;
    if (!clienteId) {
      throw new Error('No hay sesión de alumno.');
    }

    const { error } = await this.autenticacion.cliente
      .from('registros_entrenamiento')
      .insert({
        cliente_id: clienteId,
        entrenamiento_id: entrenamientoId,
        completado_en: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }
  }

  public async listarRegistros(clienteId: string): Promise<RegistroSesion[]> {
    const { data, error } = await this.autenticacion.cliente
      .from('registros_entrenamiento')
      .select(
        `
        id, completado_en,
        entrenamientos (nombre)
      `
      )
      .eq('cliente_id', clienteId)
      .order('completado_en', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data as RegistroFilaAnidada[] | null) ?? []).map((fila) => {
      const entrenamiento = uno(fila.entrenamientos);
      return {
        id: fila.id,
        completado_en: fila.completado_en,
        nombre_entrenamiento: entrenamiento?.nombre ?? null,
      };
    });
  }
  //#endregion

  //#region Métricas
  public async obtenerUltimaMetrica(
    clienteId: string
  ): Promise<MetricaCliente | null> {
    const { data, error } = await this.autenticacion.cliente
      .from('metricas_cliente')
      .select('peso_kg, altura_m, registrado_en')
      .eq('cliente_id', clienteId)
      .order('registrado_en', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as MetricaCliente | null) ?? null;
  }

  public async guardarMetrica(
    clienteId: string,
    metrica: MetricaCliente
  ): Promise<void> {
    const { error } = await this.autenticacion.cliente
      .from('metricas_cliente')
      .insert({
        cliente_id: clienteId,
        peso_kg: metrica.peso_kg,
        altura_m: metrica.altura_m,
        registrado_en: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }
  }
  //#endregion

  //#region Mapeo
  private mapearPlan(registro: RegistroPlanAnidado): PlanEntrenamiento {
    const asignaciones = [...(registro.plan_entrenamientos ?? [])].sort(
      (a, b) => a.orden - b.orden
    );

    return {
      id: registro.id,
      titulo: registro.titulo,
      objetivo: registro.objetivo,
      entrenamientos: asignaciones
        .map((asignacion) => uno(asignacion.entrenamientos))
        .filter((item): item is RegistroEntrenamientoAnidado => item != null)
        .map((item) => this.mapearEntrenamiento(item)),
    };
  }

  private mapearEntrenamiento(
    registro: RegistroEntrenamientoAnidado
  ): Entrenamiento {
    const bloques = [...(registro.bloques ?? [])].sort(
      (a, b) => a.orden - b.orden
    );

    return {
      id: registro.id,
      nombre: registro.nombre,
      descripcion: registro.descripcion,
      bloques: bloques.map((bloque) => ({
        id: bloque.id,
        nombre: bloque.nombre,
        orden: bloque.orden,
        notas: bloque.notas,
        series: [...(bloque.bloque_series ?? [])]
          .sort((a, b) => a.orden - b.orden)
          .map((serie) => ({
            id: serie.id,
            orden: serie.orden,
            tipo_estructura: serie.tipo_estructura,
            cantidad_series: serie.cantidad_series,
            descanso_post_serie_segundos: serie.descanso_post_serie_segundos,
            ejercicios: [...(serie.ejercicios_serie ?? [])]
              .sort((a, b) => a.orden - b.orden)
              .map((linea) => {
                const ejercicio = uno(linea.ejercicios);
                return {
                  id: linea.id,
                  ejercicio_id: linea.ejercicio_id,
                  orden: linea.orden,
                  codigo_visible: linea.codigo_visible,
                  equipo: linea.equipo,
                  repeticiones: linea.repeticiones,
                  tiempo_trabajo_segundos: linea.tiempo_trabajo_segundos,
                  tiempo_descanso_segundos: linea.tiempo_descanso_segundos,
                  rpe: linea.rpe == null ? null : Number(linea.rpe),
                  ejercicio,
                };
              }),
          })),
      })),
    };
  }

  private payloadEntrenamiento(entrenamiento: Entrenamiento): object {
    return {
      id: entrenamiento.id || null,
      nombre: entrenamiento.nombre,
      descripcion: entrenamiento.descripcion,
      bloques: entrenamiento.bloques.map((bloque, indiceBloque) => ({
        nombre: bloque.nombre,
        orden: indiceBloque + 1,
        notas: bloque.notas,
        series: bloque.series.map((serie, indiceSerie) => ({
          orden: indiceSerie + 1,
          tipo_estructura: serie.tipo_estructura,
          cantidad_series: serie.cantidad_series,
          descanso_post_serie_segundos: serie.descanso_post_serie_segundos,
          ejercicios: serie.ejercicios
            .filter((linea) => linea.ejercicio_id)
            .map((linea, indiceLinea) => ({
              ejercicio_id: linea.ejercicio_id,
              orden: indiceLinea + 1,
              codigo_visible: linea.codigo_visible,
              equipo: linea.equipo,
              repeticiones: linea.repeticiones,
              tiempo_trabajo_segundos: linea.tiempo_trabajo_segundos,
              tiempo_descanso_segundos: linea.tiempo_descanso_segundos,
              rpe: linea.rpe,
            })),
        })),
      })),
    };
  }
  //#endregion
  //#endregion
}

//#region Tipos de filas anidadas
function uno<T>(valor: T | T[] | null | undefined): T | null {
  if (valor == null) {
    return null;
  }
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

interface RegistroEjercicioSerieAnidado {
  id: string;
  ejercicio_id: string;
  orden: number;
  codigo_visible: string | null;
  equipo: string | null;
  repeticiones: number | null;
  tiempo_trabajo_segundos: number | null;
  tiempo_descanso_segundos: number | null;
  rpe: number | string | null;
  ejercicios: EjercicioCatalogo | EjercicioCatalogo[] | null;
}

interface RegistroBloqueSerieAnidado {
  id: string;
  orden: number;
  tipo_estructura: TipoEstructura;
  cantidad_series: number;
  descanso_post_serie_segundos: number | null;
  ejercicios_serie: RegistroEjercicioSerieAnidado[] | null;
}

interface RegistroBloqueAnidado {
  id: string;
  nombre: string;
  orden: number;
  notas: string | null;
  bloque_series: RegistroBloqueSerieAnidado[] | null;
}

interface RegistroEntrenamientoAnidado {
  id: string;
  nombre: string;
  descripcion: string | null;
  bloques: RegistroBloqueAnidado[] | null;
}

interface RegistroPlanAnidado {
  id: string;
  titulo: string;
  objetivo: string | null;
  plan_entrenamientos:
    | {
        orden: number;
        entrenamientos:
          | RegistroEntrenamientoAnidado
          | RegistroEntrenamientoAnidado[]
          | null;
      }[]
    | null;
}

interface RegistroFilaAnidada {
  id: string;
  completado_en: string;
  entrenamientos:
    | { nombre: string | null }
    | { nombre: string | null }[]
    | null;
}
//#endregion
