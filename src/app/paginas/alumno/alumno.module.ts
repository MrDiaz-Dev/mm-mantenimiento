//#region Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AlumnoPageRoutingModule } from './alumno-routing.module';
import { AlumnoPage } from './alumno.page';
//#endregion

@NgModule({
  imports: [CommonModule, IonicModule, AlumnoPageRoutingModule],
  declarations: [AlumnoPage],
})
export class AlumnoPageModule {}
