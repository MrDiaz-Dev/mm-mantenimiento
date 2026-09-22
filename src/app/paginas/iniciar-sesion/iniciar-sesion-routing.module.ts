//#region Imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IniciarSesionPage } from './iniciar-sesion.page';
//#endregion

//#region Constants
const routes: Routes = [
  {
    path: '',
    component: IniciarSesionPage,
  },
];
//#endregion

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IniciarSesionPageRoutingModule {}
