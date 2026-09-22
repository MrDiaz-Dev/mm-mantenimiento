//#region Imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlumnoPage } from './alumno.page';
//#endregion

//#region Constants
const routes: Routes = [
  {
    path: '',
    component: AlumnoPage,
  },
];
//#endregion

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlumnoPageRoutingModule {}
