//#region Imports
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import {
  DiaEntrenamiento,
  PlanEntrenamiento,
  RutinasServicio,
} from '../../servicios/rutinas.servicio';
//#endregion

@Component({
  selector: 'app-alumno',
  templateUrl: './alumno.page.html',
  styleUrls: ['./alumno.page.scss'],
  standalone: false,
})
export class AlumnoPage implements OnInit {
  //#region Variables
  public readonly perfil = inject(AutenticacionServicio).perfil;
  public plan: PlanEntrenamiento | null = null;
  public diaActivo: DiaEntrenamiento | null = null;
  public cargando = true;
  public diaCompletado = false;

  private readonly autenticacion = inject(AutenticacionServicio);
  private readonly rutinas = inject(RutinasServicio);
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
      this.plan = await this.rutinas.obtenerPlanActivo(clienteId);
      this.diaActivo = this.plan?.dias[0] ?? null;
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      this.cargando = false;
    }
  }

  //#region Día
  public cambiarLetra(letra: string | number | undefined): void {
    if (!this.plan || typeof letra !== 'string') {
      return;
    }

    this.diaActivo = this.plan.dias.find((dia) => dia.letra_dia === letra) ?? null;
    this.diaCompletado = false;
  }

  public async completarDia(): Promise<void> {
    if (!this.diaActivo) {
      return;
    }

    const carga = await this.loadingCtrl.create({
      message: 'Marcando día…',
    });
    await carga.present();
    try {
      await this.rutinas.completarDia(this.diaActivo.id);
      this.diaCompletado = true;
      await this.mostrarToast('Día completado.', 'success');
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
