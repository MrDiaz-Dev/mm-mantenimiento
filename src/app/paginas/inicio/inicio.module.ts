//#region Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { InicioPageRoutingModule } from './inicio-routing.module';
import { InicioPage } from './inicio.page';
//#endregion

@NgModule({
  imports: [CommonModule, IonicModule, InicioPageRoutingModule],
  declarations: [InicioPage],
})
export class InicioPageModule {}
