//#region Imports
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  ToastController,
  ViewWillEnter,
} from '@ionic/angular/standalone';

import { AutenticacionSesion } from '../../autenticacion/autenticacion-sesion';
import { RutinasApi } from '../../rutinas/rutinas-api';
import { RegistroSesion } from '../../rutinas/rutinas-types';
import { BotonTema } from '../../ui/boton-tema/boton-tema';
//#endregion

@Component({
  selector: 'app-historial',
  templateUrl: './historial.html',
  styleUrl: './historial.scss',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    BotonTema,
  ],
  host: { class: 'ion-page' },
})
export class Historial implements ViewWillEnter {
  //#region Variables
  public historial: RegistroSesion[] = [];
  public cargando = true;

  private readonly autenticacion = inject(AutenticacionSesion);
  private readonly rutinas = inject(RutinasApi);
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
