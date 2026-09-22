//#region Imports
import { Component, inject } from '@angular/core';

import { AutenticacionServicio } from './servicios/autenticacion.servicio';
import { TemaServicio } from './servicios/tema.servicio';
//#endregion

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  //#region Variables
  private readonly temaServicio = inject(TemaServicio);
  /** Arranca getSession / onAuthStateChange al cargar la app. */
  private readonly autenticacionServicio = inject(AutenticacionServicio);
  public readonly modoOscuroActivo = this.temaServicio.modoOscuroActivo;
  //#endregion

  //#region Methods
  //#region Tema
  public async alternarTema(): Promise<void> {
    await this.temaServicio.alternarTema();
  }
  //#endregion
  //#endregion
}
