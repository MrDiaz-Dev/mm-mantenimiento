//#region Imports
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

import {
  AutenticacionServicio,
  RolPerfil,
} from '../../servicios/autenticacion.servicio';
//#endregion

//#region Constants
type ModoAcceso = 'entrar' | 'registrar';
//#endregion

@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.page.html',
  styleUrls: ['./iniciar-sesion.page.scss'],
  standalone: false,
})
export class IniciarSesionPage {
  //#region Variables
  public readonly nombreMarca = 'Training App';
  public modo: ModoAcceso = 'entrar';
  public correo = '';
  public contrasena = '';
  public nombreCompleto = '';
  public rol: RolPerfil = 'cliente';

  private readonly autenticacion = inject(AutenticacionServicio);
  private readonly enrutador = inject(Router);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);
  //#endregion

  //#region Methods
  //#region Modo del formulario
  public cambiarModo(modo: ModoAcceso): void {
    this.modo = modo;
  }
  //#endregion

  //#region Acceso
  public async enviar(): Promise<void> {
    if (!this.correo.trim() || !this.contrasena) {
      await this.mostrarToast('Introduce correo y contraseña.');
      return;
    }

    if (this.modo === 'registrar' && !this.nombreCompleto.trim()) {
      await this.mostrarToast('Introduce tu nombre completo.');
      return;
    }

    const carga = await this.loadingCtrl.create({
      message: this.modo === 'entrar' ? 'Entrando…' : 'Creando cuenta…',
    });
    await carga.present();

    try {
      if (this.modo === 'entrar') {
        await this.autenticacion.iniciarSesion(
          this.correo.trim(),
          this.contrasena
        );
      } else {
        await this.autenticacion.registrar(
          this.correo.trim(),
          this.contrasena,
          this.nombreCompleto.trim(),
          this.rol
        );

        if (!this.autenticacion.sesion()) {
          await this.mostrarToast(
            'Cuenta creada. Revisa tu correo para confirmar el acceso.',
            'success'
          );
          this.modo = 'entrar';
          return;
        }
      }

      const ruta = this.autenticacion.rutaSegunRol(
        this.autenticacion.perfil()?.rol
      );
      await this.enrutador.navigateByUrl(ruta);
    } catch (error: unknown) {
      const mensaje =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'No se pudo completar la operación.';
      await this.mostrarToast(mensaje);
    } finally {
      await carga.dismiss();
    }
  }
  //#endregion

  //#region Feedback
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
