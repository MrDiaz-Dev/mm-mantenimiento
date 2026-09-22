//#region Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EntrenadorPageRoutingModule } from './entrenador-routing.module';
import { EntrenadorPage } from './entrenador.page';
import { PlanClientePage } from './plan-cliente.page';
//#endregion

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EntrenadorPageRoutingModule,
  ],
  declarations: [EntrenadorPage, PlanClientePage],
})
export class EntrenadorPageModule {}
