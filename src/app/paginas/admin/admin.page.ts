//#region Imports
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, ViewWillEnter } from '@ionic/angular';

import { AutenticacionServicio, Perfil } from '../../servicios/autenticacion.servicio';
import { RutinasServicio } from '../../servicios/rutinas.servicio';
//#endregion

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage implements ViewWillEnter {
  //#region Variables
  public readonly perfil = inject(AutenticacionServicio).perfil;
  public clientes: Perfil[] = [];
  public entrenadores: Perfil[] = [];
  public opcionesEntrenadores: { id: string; etiqueta: string }[] = [];
  public seleccion: Record<string, string> = {};
  public cargando = true;

  private readonly autenticacion = inject(AutenticacionServicio);
  private readonly rutinas = inject(RutinasServicio);
  private readonly enrutador = inject(Router);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);
  //#endregion

  //#region Methods
  public async ionViewWillEnter(): Promise<void> {
    await this.cargar();
  }

  //#region Listas
  public async cargar(): Promise<void> {
    this.cargando = true;
    try {
      const [clientes, entrenadores] = await Promise.all([
        this.rutinas.listarClientes(),
        this.rutinas.listarEntrenadores(),
      ]);
      this.clientes = clientes;
      this.entrenadores = entrenadores;
      this.opcionesEntrenadores = [
        { id: '', etiqueta: 'Sin entrenador' },
        ...entrenadores.map((entrenador) => ({
          id: entrenador.id,
          etiqueta: this.nombreVisible(entrenador),
        })),
      ];
      this.seleccion = {};
      for (const cliente of clientes) {
        this.seleccion[cliente.id] = cliente.entrenador_id ?? '';
      }
    } catch (error: unknown) {
      await this.mostrarToast(this.mensajeError(error));
    } finally {
      this.cargando = false;
    }
  }

  public async guardarAsignacion(clienteId: string): Promise<void> {
    const entrenadorId = this.seleccion[clienteId] || null;
    const carga = await this.loadingCtrl.create({ message: 'Guardando…' });
    await carga.present();
    try {
      await this.rutinas.asignarEntrenador(clienteId, entrenadorId);
      await this.mostrarToast('Asignación guardada.', 'success');
      await this.cargar();
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
