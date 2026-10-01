//#region Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';

import { BotonTemaModule } from '../../componentes/boton-tema/boton-tema.module';
import { IniciarSesionPageRoutingModule } from './iniciar-sesion-routing.module';
import { IniciarSesionPage } from './iniciar-sesion.page';
//#endregion

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InputText,
    Password,
    BotonTemaModule,
    IniciarSesionPageRoutingModule,
  ],
  declarations: [IniciarSesionPage],
})
export class IniciarSesionPageModule {}
