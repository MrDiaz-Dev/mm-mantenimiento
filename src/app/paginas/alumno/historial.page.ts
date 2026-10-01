//#region Imports
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, ViewWillEnter } from '@ionic/angular';

import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import {
  RegistroSesion,
  RutinasServicio,
} from '../../servicios/rutinas.servicio';
//#endregion

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: false,
})
export class HistorialPage implements ViewWillEnter {
  //#region Variables
  public historial: RegistroSesion[] = [];
  public cargando = true;

  private readonly autenticacion = inject(AutenticacionServicio);
  private readonly rutinas = inject(RutinasServicio);
  private readonly enrutador = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  //#endregion

  //#region Methods
  public async ionViewWillEnter(): Promise<void> {
    const clienteId = this.autenticacion.perfil()?.id;
    if (!clienteId) {
      this.cargando = false;
      this.historial = [];
      return;
    }

    this.cargando = true;
    try {
      this.historial = await this.rutinas.listarRegistros(clienteId);
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      this.cargando = false;
    }
  }

  public fechaVisible(iso: string): string {
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) {
      return iso;
    }
    return fecha.toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

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

  private async mostrarToast(mensaje: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3500,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }
  //#endregion
  //#endregion
}
