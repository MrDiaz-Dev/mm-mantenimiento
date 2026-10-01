//#region Imports
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';

import {
  AutenticacionSesion,
  Perfil,
} from '../../autenticacion/autenticacion-sesion';
import { RutinasApi } from '../../rutinas/rutinas-api';
import {
  Entrenamiento,
  formatearEjercicio,
  formatearPieSerie,
  MetricaCliente,
  PlanEntrenamiento,
} from '../../rutinas/rutinas-types';
import { BotonTema } from '../../ui/boton-tema/boton-tema';
//#endregion

@Component({
  selector: 'app-alumno',
  templateUrl: './ficha.html',
  styleUrl: './ficha.scss',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    BotonTema,
  ],
  host: { class: 'ion-page' },
})
export class Ficha implements OnInit {
  //#region Variables
  public readonly perfil = inject(AutenticacionSesion).perfil;
  public readonly formatearEjercicio = formatearEjercicio;
  public readonly formatearPieSerie = formatearPieSerie;
  public plan: PlanEntrenamiento | null = null;
  public activo: Entrenamiento | null = null;
  public metrica: MetricaCliente | null = null;
  public entrenador: Perfil | null = null;
  public cargando = true;
  public completado = false;

  private readonly autenticacion = inject(AutenticacionSesion);
  private readonly rutinas = inject(RutinasApi);
  private readonly enrutador = inject(Router);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);
  //#endregion

  //#region Methods
  public async ngOnInit(): Promise<void> {
    const clienteId = this.perfil()?.id;
    if (!clienteId) {
      this.cargando = false;
      return;
    }

    try {
      const [plan, metrica] = await Promise.all([
        this.rutinas.obtenerPlanActivo(clienteId),
        this.rutinas.obtenerUltimaMetrica(clienteId),
      ]);
      this.plan = plan;
      this.metrica = metrica;
      this.activo = plan?.entrenamientos[0] ?? null;

      const entrenadorId = this.perfil()?.entrenador_id;
      if (entrenadorId) {
        this.entrenador = await this.rutinas.obtenerCliente(entrenadorId);
      }
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      this.cargando = false;
    }
  }

  //#region Ficha
  public cambiarEntrenamiento(id: string | number | undefined): void {
    if (!this.plan || typeof id !== 'string') {
      return;
    }
    if (this.activo?.id === id) {
      return;
    }
    this.activo =
      this.plan.entrenamientos.find((item) => item.id === id) ?? null;
    this.completado = false;
  }

  public async completar(): Promise<void> {
    if (!this.activo) {
      return;
    }

    const carga = await this.loadingCtrl.create({
      message: 'Marcando entrenamiento…',
    });
    await carga.present();
    try {
      await this.rutinas.completarEntrenamiento(this.activo.id);
      this.completado = true;
      await this.mostrarToast('Entrenamiento completado.', 'success');
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      await carga.dismiss();
    }
  }
  //#endregion

  //#region Sesión
  public async cerrarSesion(): Promise<void> {
    await this.autenticacion.cerrarSesion();
    await this.enrutador.navigateByUrl('/iniciar-sesion');
  }
  //#endregion

  //#region Feedback
  public nombreVisible(perfil: Perfil | null): string {
    if (!perfil) {
      return 'Sin asignar';
    }
    return perfil.nombre_completo?.trim() || perfil.email || 'Sin nombre';
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
