//#region Imports
import { Component, inject } from '@angular/core';

import { TemaServicio } from '../../servicios/tema.servicio';
//#endregion

@Component({
  selector: 'app-boton-tema',
  templateUrl: './boton-tema.component.html',
  standalone: false,
})
export class BotonTemaComponent {
  //#region Variables
  public readonly modoOscuroActivo = inject(TemaServicio).modoOscuroActivo;
  private readonly temaServicio = inject(TemaServicio);
  //#endregion

  //#region Methods
  public async alternarTema(): Promise<void> {
    await this.temaServicio.alternarTema();
  }
  //#endregion
}
