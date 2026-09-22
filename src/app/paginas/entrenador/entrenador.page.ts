//#region Imports
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, ViewWillEnter } from '@ionic/angular';

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
  public sinVincular: Perfil[] = [];
  public cargando = true;

  private readonly autenticacion = inject(AutenticacionServicio);
  private readonly rutinas = inject(RutinasServicio);
  private readonly enrutador = inject(Router);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);
  //#endregion

  //#region Methods
  public async ionViewWillEnter(): Promise<void> {
    await this.cargarListas();
  }

  //#region Listas
  public async cargarListas(): Promise<void> {
    this.cargando = true;
    try {
      const [vinculados, sinVincular] = await Promise.all([
        this.rutinas.listarClientesVinculados(),
        this.rutinas.listarClientesSinEntrenador(),
      ]);
      this.vinculados = vinculados;
      this.sinVincular = sinVincular;
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      this.cargando = false;
    }
  }

  public irAlPlan(clienteId: string): void {
    void this.enrutador.navigate(['/entrenador', 'cliente', clienteId]);
  }

  public async vincular(clienteId: string): Promise<void> {
    const carga = await this.loadingCtrl.create({ message: 'Vinculando…' });
    await carga.present();
    try {
      await this.rutinas.vincularCliente(clienteId);
      await this.cargarListas();
      await this.mostrarToast('Cliente vinculado.', 'success');
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
  public nombreVisible(perfil: Perfil): string {
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
