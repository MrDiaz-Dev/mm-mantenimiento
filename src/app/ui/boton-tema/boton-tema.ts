//#region Imports
import { Component, inject } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

import { Tema } from '../../core/tema';
//#endregion

@Component({
  selector: 'app-boton-tema',
  template: `
    <ion-button
      (click)="alternarTema()"
      [attr.aria-label]="
        modoOscuroActivo() ? 'Activar modo claro' : 'Activar modo oscuro'
      "
    >
      <ion-icon
        slot="icon-only"
        [name]="modoOscuroActivo() ? 'sunny-outline' : 'moon-outline'"
      ></ion-icon>
    </ion-button>
  `,
  imports: [IonButton, IonIcon],
})
export class BotonTema {
  //#region Variables
  public readonly modoOscuroActivo = inject(Tema).modoOscuroActivo;
  private readonly tema = inject(Tema);
  //#endregion

  //#region Methods
  public async alternarTema(): Promise<void> {
    await this.tema.alternarTema();
  }
  //#endregion
}
