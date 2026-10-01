//#region Imports
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, ViewWillEnter } from '@ionic/angular';

import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import {
  EntrenamientoResumen,
  RutinasServicio,
} from '../../servicios/rutinas.servicio';
//#endregion

@Component({
  selector: 'app-entrenamientos',
  templateUrl: './entrenamientos.page.html',
  styleUrls: ['./entrenamientos.page.scss'],
  standalone: false,
})
export class EntrenamientosPage implements ViewWillEnter {
  //#region Variables
  public biblioteca: EntrenamientoResumen[] = [];
  public cargando = true;

  private readonly autenticacion = inject(AutenticacionServicio);
  private readonly rutinas = inject(RutinasServicio);
  private readonly enrutador = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  //#endregion

  //#region Methods
  public async ionViewWillEnter(): Promise<void> {
    this.cargando = true;
    try {
      this.biblioteca = await this.rutinas.listarEntrenamientos();
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      this.cargando = false;
    }
  }

  public irANuevo(): void {
    void this.enrutador.navigateByUrl('/entrenador/entrenamiento/nuevo');
  }

  public irAEditar(id: string): void {
    void this.enrutador.navigateByUrl(`/entrenador/entrenamiento/${id}`);
  }

  public async cerrarSesion(): Promise<void> {
    await this.autenticacion.cerrarSesion();
    await this.enrutador.navigateByUrl('/iniciar-sesion');
  }

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
}
