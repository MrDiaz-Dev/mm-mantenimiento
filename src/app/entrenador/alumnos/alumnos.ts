//#region Imports
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ToastController,
  ViewWillEnter,
} from '@ionic/angular/standalone';

import { AutenticacionSesion, Perfil } from '../../autenticacion/autenticacion-sesion';
import { RutinasApi } from '../../rutinas/rutinas-api';
import { BotonTema } from '../../ui/boton-tema/boton-tema';
//#endregion

@Component({
  selector: 'app-entrenador',
  templateUrl: './alumnos.html',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    BotonTema,
  ],
  host: { class: 'ion-page' },
})
export class Alumnos implements ViewWillEnter {
  //#region Variables
  public readonly perfil = inject(AutenticacionSesion).perfil;
  public vinculados: Perfil[] = [];
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
      this.vinculados = await this.rutinas.listarClientesVinculados();
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      this.cargando = false;
    }
  }

  //#region Listas
  public irAlPlan(clienteId: string): void {
    void this.enrutador.navigate(['/entrenador', 'cliente', clienteId]);
  }
  //#endregion

  //#region Sesión
  public async cerrarSesion(): Promise<void> {
    await this.autenticacion.cerrarSesion();
    await this.enrutador.navigateByUrl('/iniciar-sesion');
  }
  //#endregion

  //#region Feedback
  public nombreVisible(perfil: Perfil): string {
    return perfil.nombre_completo?.trim() || perfil.email || 'Sin nombre';
  }

  public iniciales(perfil: Perfil): string {
    const fuente = perfil.nombre_completo?.trim() || perfil.email || '?';
    return fuente
      .split(/[\s@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0))
      .join('')
      .toUpperCase();
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
  //#endregion
}
