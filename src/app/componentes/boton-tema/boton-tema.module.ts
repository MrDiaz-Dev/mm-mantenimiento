//#region Imports
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { BotonTemaComponent } from './boton-tema.component';
//#endregion

@NgModule({
  imports: [IonicModule],
  declarations: [BotonTemaComponent],
  exports: [BotonTemaComponent],
})
export class BotonTemaModule {}
