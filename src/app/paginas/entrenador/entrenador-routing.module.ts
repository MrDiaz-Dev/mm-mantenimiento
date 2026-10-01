//#region Imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EntrenadorPage } from './entrenador.page';
import { EntrenamientoEditorPage } from './entrenamiento-editor.page';
import { EntrenamientosPage } from './entrenamientos.page';
import { PestanasEntrenadorPage } from './pestanas-entrenador.page';
import { PlanClientePage } from './plan-cliente.page';
//#endregion

//#region Constants
const routes: Routes = [
  {
    path: '',
    component: PestanasEntrenadorPage,
    children: [
      {
        path: 'alumnos',
        component: EntrenadorPage,
      },
      {
        path: 'entrenamientos',
        component: EntrenamientosPage,
      },
      {
        path: '',
        redirectTo: 'alumnos',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'cliente/:id',
    component: PlanClientePage,
  },
  {
    path: 'entrenamiento/nuevo',
    component: EntrenamientoEditorPage,
  },
  {
    path: 'entrenamiento/:id',
    component: EntrenamientoEditorPage,
  },
];
//#endregion

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntrenadorPageRoutingModule {}
