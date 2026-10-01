//#region Imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlumnoPage } from './alumno.page';
import { HistorialPage } from './historial.page';
import { PestanasAlumnoPage } from './pestanas-alumno.page';
//#endregion

//#region Constants
const routes: Routes = [
  {
    path: '',
    component: PestanasAlumnoPage,
    children: [
      {
        path: 'ficha',
        component: AlumnoPage,
      },
      {
        path: 'historial',
        component: HistorialPage,
      },
      {
        path: '',
        redirectTo: 'ficha',
        pathMatch: 'full',
      },
    ],
  },
];
//#endregion

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlumnoPageRoutingModule {}
