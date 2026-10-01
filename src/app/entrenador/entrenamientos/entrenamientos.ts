//#region Imports
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ToastController,
  ViewWillEnter,
} from '@ionic/angular/standalone';

import { AutenticacionSesion } from '../../autenticacion/autenticacion-sesion';
import { RutinasApi } from '../../rutinas/rutinas-api';
import { EntrenamientoResumen } from '../../rutinas/rutinas-types';
import { BotonTema } from '../../ui/boton-tema/boton-tema';
//#endregion

@Component({
  selector: 'app-entrenamientos',
  templateUrl: './entrenamientos.html',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonFab,
    IonFabButton,
    BotonTema,
  ],
  host: { class: 'ion-page' },
})
export class Entrenamientos implements ViewWillEnter {
  //#region Variables
  public biblioteca: EntrenamientoResumen[] = [];
  public cargando = true;

  private readonly autenticacion = inject(AutenticacionSesion);
  private readonly rutinas = inject(RutinasApi);
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
