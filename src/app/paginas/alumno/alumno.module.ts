//#region Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { BotonTemaModule } from '../../componentes/boton-tema/boton-tema.module';
import { AlumnoPageRoutingModule } from './alumno-routing.module';
import { AlumnoPage } from './alumno.page';
import { HistorialPage } from './historial.page';
import { PestanasAlumnoPage } from './pestanas-alumno.page';
//#endregion

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    BotonTemaModule,
    AlumnoPageRoutingModule,
  ],
  declarations: [PestanasAlumnoPage, AlumnoPage, HistorialPage],
})
export class AlumnoPageModule {}
