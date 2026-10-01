//#region Imports
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import {
  Bloque,
  BloqueSerie,
  EjercicioCatalogo,
  EjercicioSerie,
  Entrenamiento,
  ETIQUETAS_ESTRUCTURA,
  formatearEjercicio,
  formatearPieSerie,
  RutinasServicio,
  TIPOS_EQUIPO,
  TIPOS_ESTRUCTURA,
  TipoEstructura,
} from '../../servicios/rutinas.servicio';
//#endregion

@Component({
  selector: 'app-entrenamiento-editor',
  templateUrl: './entrenamiento-editor.page.html',
  styleUrls: ['./entrenamiento-editor.page.scss'],
  standalone: false,
})
export class EntrenamientoEditorPage implements OnInit {
  //#region Variables
  public readonly tiposEquipo: string[] = [...TIPOS_EQUIPO];
  public readonly opcionesEstructura = TIPOS_ESTRUCTURA.map((tipo) => ({
    valor: tipo,
    etiqueta: ETIQUETAS_ESTRUCTURA[tipo],
  }));
  public readonly etiquetasEstructura = ETIQUETAS_ESTRUCTURA;
  public readonly formatearEjercicio = formatearEjercicio;
  public readonly formatearPieSerie = formatearPieSerie;

  public catalogo: EjercicioCatalogo[] = [];
  public entrenamiento: Entrenamiento = this.entrenamientoVacio();
  public cargando = true;
  public esNuevo = true;

  private readonly ruta = inject(ActivatedRoute);
  private readonly enrutador = inject(Router);
  private readonly rutinas = inject(RutinasServicio);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);
  //#endregion

  //#region Methods
  public async ngOnInit(): Promise<void> {
    const id = this.ruta.snapshot.paramMap.get('id');
    this.esNuevo = !id || id === 'nuevo';

    try {
      this.catalogo = await this.rutinas.listarEjercicios();
      if (!this.esNuevo && id) {
        const cargado = await this.rutinas.obtenerEntrenamiento(id);
        if (!cargado) {
          await this.mostrarToast('No se encontró el entrenamiento.');
          await this.enrutador.navigateByUrl('/entrenador/entrenamientos');
          return;
        }
        this.entrenamiento = cargado;
      }
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      this.cargando = false;
    }
  }

  //#region Bloques
  public quitarBloqueDesdeCabecera(evento: Event, indice: number): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.quitarBloque(indice);
  }

  public anadirBloque(): void {
    this.entrenamiento.bloques.push({
      nombre: '',
      orden: this.entrenamiento.bloques.length + 1,
      notas: null,
      series: [this.serieVacia(1)],
    });
  }

  public quitarBloque(indice: number): void {
    this.entrenamiento.bloques.splice(indice, 1);
  }
  //#endregion

  //#region Series
  public anadirSerie(bloque: Bloque): void {
    bloque.series.push(this.serieVacia(bloque.series.length + 1));
  }

  public quitarSerie(bloque: Bloque, indice: number): void {
    bloque.series.splice(indice, 1);
  }
  //#endregion

  //#region Ejercicios
  public anadirEjercicio(serie: BloqueSerie): void {
    const primero = this.catalogo[0];
    if (!primero) {
      void this.mostrarToast('No hay ejercicios en el catálogo.');
      return;
    }
    serie.ejercicios.push(this.lineaVacia(primero, serie.ejercicios.length + 1));
  }

  public quitarEjercicio(serie: BloqueSerie, indice: number): void {
    serie.ejercicios.splice(indice, 1);
  }

  public alCambiarEjercicio(linea: EjercicioSerie): void {
    const elegido =
      this.catalogo.find((item) => item.id === linea.ejercicio_id) ?? null;
    linea.ejercicio = elegido;
    if (elegido?.equipo_base && !linea.equipo) {
      linea.equipo = elegido.equipo_base;
    }
  }

  public esPorTiempo(linea: EjercicioSerie): boolean {
    return linea.tiempo_trabajo_segundos != null;
  }

  public cambiarModo(linea: EjercicioSerie, porTiempo: boolean): void {
    if (porTiempo) {
      linea.repeticiones = null;
      linea.tiempo_trabajo_segundos = linea.tiempo_trabajo_segundos ?? 20;
      linea.tiempo_descanso_segundos = linea.tiempo_descanso_segundos ?? 10;
      return;
    }
    linea.tiempo_trabajo_segundos = null;
    linea.tiempo_descanso_segundos = null;
    linea.repeticiones = linea.repeticiones ?? 10;
  }

  public alCambiarModo(linea: EjercicioSerie, valor: string | undefined): void {
    const porTiempo = valor === 'tiempo';
    if (this.esPorTiempo(linea) === porTiempo) {
      return;
    }
    this.cambiarModo(linea, porTiempo);
  }
  //#endregion

  //#region Guardado
  public async guardar(): Promise<void> {
    if (!this.entrenamiento.nombre.trim()) {
      await this.mostrarToast('Introduce un nombre para el entrenamiento.');
      return;
    }

    const carga = await this.loadingCtrl.create({
      message: 'Guardando entrenamiento…',
    });
    await carga.present();
    try {
      const id = await this.rutinas.guardarEntrenamiento({
        ...this.entrenamiento,
        nombre: this.entrenamiento.nombre.trim(),
        descripcion: this.entrenamiento.descripcion?.trim() || null,
      });
      this.entrenamiento.id = id;
      this.esNuevo = false;
      await this.mostrarToast('Entrenamiento guardado.', 'success');
      await this.enrutador.navigateByUrl('/entrenador/entrenamientos');
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      await carga.dismiss();
    }
  }
  //#endregion

  //#region Auxiliares
  private entrenamientoVacio(): Entrenamiento {
    return {
      id: '',
      nombre: '',
      descripcion: null,
      bloques: [],
    };
  }

  private serieVacia(orden: number): BloqueSerie {
    return {
      orden,
      tipo_estructura: 'circuito',
      cantidad_series: 3,
      descanso_post_serie_segundos: null,
      ejercicios: [],
    };
  }

  private lineaVacia(
    ejercicio: EjercicioCatalogo,
    orden: number
  ): EjercicioSerie {
    return {
      ejercicio_id: ejercicio.id,
      orden,
      codigo_visible: '',
      equipo: ejercicio.equipo_base,
      repeticiones: 10,
      tiempo_trabajo_segundos: null,
      tiempo_descanso_segundos: null,
      rpe: null,
      ejercicio,
    };
  }

  public etiquetaEstructura(valor: TipoEstructura): string {
    return this.etiquetasEstructura[valor];
  }

  private mensajeError(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: string }).message);
    }
    return 'No se pudo completar la operación.';
  }

  private async mostrarToast(
    mensaje: string,
    color: 'danger' | 'success' = 'danger'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3500,
      color,
      position: 'top',
    });
    await toast.present();
  }
  //#endregion
  //#endregion
}
