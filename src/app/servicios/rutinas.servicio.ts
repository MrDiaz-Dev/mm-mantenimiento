//#region Imports
import { inject, Injectable } from '@angular/core';

import { AutenticacionServicio, Perfil } from './autenticacion.servicio';
//#endregion

//#region Constants
export const LETRAS_DIA = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
export type LetraDia = (typeof LETRAS_DIA)[number];

export interface EjercicioCatalogo {
  id: string;
  nombre: string;
  grupo_muscular: string | null;
  equipo: string | null;
  url_inicio: string | null;
  url_final: string | null;
}

export interface LineaEjercicio {
  ejercicio_id: string;
  series: number | null;
  repeticiones: number | null;
  carga_kg: number | null;
  descanso_segundos: number | null;
  observaciones: string | null;
  orden: number;
  ejercicio: EjercicioCatalogo | null;
}

export interface DiaEntrenamiento {
  id: string;
  letra_dia: LetraDia;
  nombre: string | null;
  enfoque: string | null;
  orden: number;
  ejercicios: LineaEjercicio[];
}

export interface PlanEntrenamiento {
  id: string;
  titulo: string;
  objetivo: string | null;
  dias: DiaEntrenamiento[];
}

export interface DiaEditable {
  letra_dia: LetraDia;
  nombre: string;
  enfoque: string;
  ejercicios: LineaEjercicio[];
}
//#endregion

@Injectable({
  providedIn: 'root',
})
export class RutinasServicio {
  //#region Variables
  private readonly autenticacion = inject(AutenticacionServicio);
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

  public async listarClientesSinEntrenador(): Promise<Perfil[]> {
    const { data, error } = await this.autenticacion.cliente
      .from('perfiles')
      .select('id, rol, nombre_completo, email, url_avatar, entrenador_id')
      .eq('rol', 'cliente')
      .is('entrenador_id', null)
      .order('nombre_completo');

    if (error) {
      throw error;
    }

    return (data as Perfil[]) ?? [];
  }

  public async vincularCliente(clienteId: string): Promise<void> {
    const entrenadorId = this.autenticacion.perfil()?.id;
    if (!entrenadorId) {
      throw new Error('No hay sesión de entrenador.');
    }

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
      .select('id, nombre, grupo_muscular, equipo, url_inicio, url_final')
      .order('nombre');

    if (error) {
      throw error;
    }

    return (data as EjercicioCatalogo[]) ?? [];
  }
  //#endregion

  //#region Plan
  public async obtenerPlanActivo(clienteId: string): Promise<PlanEntrenamiento | null> {
    const { data, error } = await this.autenticacion.cliente
      .from('planes_entrenamiento')
      .select(
        `
        id, titulo, objetivo,
        dias_entrenamiento (
          id, letra_dia, nombre, enfoque, orden,
          ejercicios_dia (
            ejercicio_id, series, repeticiones, carga_kg, descanso_segundos, observaciones, orden,
            ejercicios (id, nombre, grupo_muscular, equipo, url_inicio, url_final)
          )
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
    dias: DiaEditable[]
  ): Promise<void> {
    const entrenadorId = this.autenticacion.perfil()?.id;
    if (!entrenadorId) {
      throw new Error('No hay sesión de entrenador.');
    }

    const diasConEjercicios = dias.filter((dia) => dia.ejercicios.length > 0);
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
        dias_por_semana: diasConEjercicios.length,
        fecha_inicio: new Date().toISOString().slice(0, 10),
        esta_activo: true,
      })
      .select('id')
      .single();

    if (errorPlan) {
      throw errorPlan;
    }

    for (const [indice, dia] of diasConEjercicios.entries()) {
      const { data: diaGuardado, error: errorDia } = await supabase
        .from('dias_entrenamiento')
        .insert({
          plan_id: plan.id,
          letra_dia: dia.letra_dia,
          nombre: dia.nombre || `Entrenamiento ${dia.letra_dia}`,
          enfoque: dia.enfoque || null,
          orden: indice + 1,
        })
        .select('id')
        .single();

      if (errorDia) {
        throw errorDia;
      }

      const lineas = dia.ejercicios
        .filter((linea) => linea.ejercicio_id)
        .map((linea, orden) => ({
          dia_entrenamiento_id: diaGuardado.id,
          ejercicio_id: linea.ejercicio_id,
          series: linea.series,
          repeticiones: linea.repeticiones,
          carga_kg: linea.carga_kg,
          descanso_segundos: linea.descanso_segundos,
          observaciones: linea.observaciones,
          orden: orden + 1,
        }));

      if (lineas.length === 0) {
        continue;
      }

      const { error: errorLineas } = await supabase
        .from('ejercicios_dia')
        .insert(lineas);

      if (errorLineas) {
        throw errorLineas;
      }
    }
  }
  //#endregion

  //#region Registro
  public async completarDia(diaEntrenamientoId: string): Promise<void> {
    const clienteId = this.autenticacion.perfil()?.id;
    if (!clienteId) {
      throw new Error('No hay sesión de alumno.');
    }

    const { error } = await this.autenticacion.cliente
      .from('registros_entrenamiento')
      .insert({
        cliente_id: clienteId,
        dia_entrenamiento_id: diaEntrenamientoId,
        completado_en: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }
  }
  //#endregion

  //#region Mapeo
  private mapearPlan(registro: RegistroPlanAnidado): PlanEntrenamiento {
    const dias = [...(registro.dias_entrenamiento ?? [])].sort(
      (a, b) => a.orden - b.orden
    );

    return {
      id: registro.id,
      titulo: registro.titulo,
      objetivo: registro.objetivo,
      dias: dias.map((dia) => ({
        id: dia.id,
        letra_dia: dia.letra_dia,
        nombre: dia.nombre,
        enfoque: dia.enfoque,
        orden: dia.orden,
        ejercicios: [...(dia.ejercicios_dia ?? [])]
          .sort((a, b) => a.orden - b.orden)
          .map((linea) => ({
            ejercicio_id: linea.ejercicio_id,
            series: linea.series,
            repeticiones: linea.repeticiones,
            carga_kg: linea.carga_kg,
            descanso_segundos: linea.descanso_segundos,
            observaciones: linea.observaciones,
            orden: linea.orden,
            ejercicio: Array.isArray(linea.ejercicios)
              ? (linea.ejercicios[0] ?? null)
              : (linea.ejercicios ?? null),
          })),
      })),
    };
  }
  //#endregion
  //#endregion
}

//#region Tipos de filas anidadas
interface RegistroLineaAnidada {
  ejercicio_id: string;
  series: number | null;
  repeticiones: number | null;
  carga_kg: number | null;
  descanso_segundos: number | null;
  observaciones: string | null;
  orden: number;
  ejercicios: EjercicioCatalogo | EjercicioCatalogo[] | null;
}

interface RegistroDiaAnidado {
  id: string;
  letra_dia: LetraDia;
  nombre: string | null;
  enfoque: string | null;
  orden: number;
  ejercicios_dia: RegistroLineaAnidada[] | null;
}

interface RegistroPlanAnidado {
  id: string;
  titulo: string;
  objetivo: string | null;
  dias_entrenamiento: RegistroDiaAnidado[] | null;
}
//#endregion
