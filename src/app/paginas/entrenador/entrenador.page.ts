//#region Imports
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, ViewWillEnter } from '@ionic/angular';

import { AutenticacionServicio, Perfil } from '../../servicios/autenticacion.servicio';
import { RutinasServicio } from '../../servicios/rutinas.servicio';
//#endregion

@Component({
  selector: 'app-entrenador',
  templateUrl: './entrenador.page.html',
  styleUrls: ['./entrenador.page.scss'],
  standalone: false,
})
export class EntrenadorPage implements ViewWillEnter {
  //#region Variables
  public readonly perfil = inject(AutenticacionServicio).perfil;
  public vinculados: Perfil[] = [];
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
