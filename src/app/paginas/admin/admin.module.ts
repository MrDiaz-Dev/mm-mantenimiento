//#region Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Select } from 'primeng/select';

import { BotonTemaModule } from '../../componentes/boton-tema/boton-tema.module';
import { CerrarOverlayAlDeslizarDirective } from '../../directivas/cerrar-overlay-al-deslizar.directiva';
import { AdminPageRoutingModule } from './admin-routing.module';
import { AdminPage } from './admin.page';
import { PestanasAdminPage } from './pestanas-admin.page';
//#endregion

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Select,
    CerrarOverlayAlDeslizarDirective,
    BotonTemaModule,
    AdminPageRoutingModule,
  ],
  declarations: [PestanasAdminPage, AdminPage],
})
export class AdminPageModule {}
