//#region Imports
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import { Perfil } from '../../servicios/autenticacion.servicio';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import {
  DiaEntrenamiento,
  Ejercicio,
  LETRAS_DIA,
  LetraDia,
  LineaEjercicioBorrador,
  RutinasServicio,
} from '../../servicios/rutinas.servicio';
//#endregion

//#region Constants
interface LineaFormulario extends LineaEjercicioBorrador {
  clave: string;
}
//#endregion

@Component({
  selector: 'app-cliente-plan',
  templateUrl: './cliente-plan.page.html',
  styleUrls: ['./cliente-plan.page.scss'],
  standalone: false,
})
export class ClientePlanPage {
  //#region Variables
  public readonly letrasDia = LETRAS_DIA;
  public cliente: Perfil | null = null;
  public ejerciciosCatalogo: Ejercicio[] = [];
  public titulo = '';
  public objetivo = '';
  public letraDiaActiva: LetraDia = 'A';
  public lineas: LineaFormulario[] = [];

  private readonly autenticacion = inject(AutenticacionServicio);
  private readonly rutinas = inject(RutinasServicio);
  private readonly ruta = inject(ActivatedRoute);
  private readonly enrutador = inject(Router);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);

  private clienteId = '';
  private diasPorLetra = new Map<string, DiaEntrenamiento>();
  //#endregion

  //#region Methods
  ionViewWillEnter(): void {
    this.clienteId = this.ruta.snapshot.paramMap.get('id') ?? '';
    void this.cargar();
  }

  //#region Carga
  public async cargar(): Promise<void> {
    if (!this.clienteId) {
      return;
    }

    const carga = await this.loadingCtrl.create({ message: 'Cargando…' });
    await carga.present();

    try {
      this.cliente = await this.rutinas.obtenerCliente(this.clienteId);
      this.ejerciciosCatalogo = await this.rutinas.listarEjercicios();

      const rutina = await this.rutinas.obtenerPlanActivoCliente(this.clienteId);
      if (rutina) {
        this.titulo = rutina.plan.titulo;
        this.objetivo = rutina.plan.objetivo ?? '';
        this.diasPorLetra = new Map(
          rutina.dias.map((dia) => [dia.letra_dia, dia])
        );
      }

      await this.cargarLineasDia(this.letraDiaActiva);
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      await carga.dismiss();
    }
  }

  public async cambiarDia(letra: LetraDia): Promise<void> {
    this.letraDiaActiva = letra;
    await this.cargarLineasDia(letra);
  }

  private async cargarLineasDia(letra: LetraDia): Promise<void> {
    const dia = this.diasPorLetra.get(letra);
    if (!dia) {
      this.lineas = [];
      return;
    }

    const detalle = await this.rutinas.listarEjerciciosDelDia(dia.id);
    this.lineas = detalle.map((fila) => ({
      clave: fila.id,
      ejercicioId: fila.ejercicio_id,
      series: fila.series ?? 3,
      repeticiones: fila.repeticiones ?? '10',
      cargaKg: fila.carga_kg,
      descansoSegundos: fila.descanso_segundos ?? 60,
    }));
  }
  //#endregion

  //#region Formulario
  public agregarLinea(): void {
    const primerEjercicio = this.ejerciciosCatalogo[0]?.id ?? '';
    this.lineas = [
      ...this.lineas,
      {
        clave: `nueva-${Date.now()}`,
        ejercicioId: primerEjercicio,
        series: 3,
        repeticiones: '10',
        cargaKg: null,
        descansoSegundos: 60,
      },
    ];
  }

  public quitarLinea(indice: number): void {
    this.lineas = this.lineas.filter((_, i) => i !== indice);
  }

  public async guardar(): Promise<void> {
    const entrenadorId = this.autenticacion.perfil()?.id;
    if (!entrenadorId || !this.clienteId) {
      return;
    }

    if (!this.titulo.trim()) {
      await this.mostrarToast('Introduce un título para el plan.');
      return;
    }

    const lineasInvalidas = this.lineas.some((l) => !l.ejercicioId);
    if (lineasInvalidas) {
      await this.mostrarToast('Selecciona un ejercicio en cada línea.');
      return;
    }

    const carga = await this.loadingCtrl.create({ message: 'Guardando…' });
    await carga.present();

    try {
      await this.rutinas.guardarDiaPlan(
        entrenadorId,
        this.clienteId,
        this.titulo.trim(),
        this.objetivo.trim(),
        this.letraDiaActiva,
        this.lineas.map(({ clave: _c, ...linea }) => linea)
      );

      const rutina = await this.rutinas.obtenerPlanActivoCliente(this.clienteId);
      if (rutina) {
        this.diasPorLetra = new Map(
          rutina.dias.map((dia) => [dia.letra_dia, dia])
        );
      }

      await this.mostrarToast('Plan guardado.', 'success');
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      await carga.dismiss();
    }
  }
  //#endregion

  //#region Navegación
  public volver(): void {
    void this.enrutador.navigate(['/entrenador']);
  }
  //#endregion

  //#region Feedback
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
