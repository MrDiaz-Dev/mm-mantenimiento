//#region Imports
import { Routes } from '@angular/router';

import { Alumnos } from './alumnos/alumnos';
import { EntrenamientoEditor } from './entrenamiento-editor/entrenamiento-editor';
import { Entrenamientos } from './entrenamientos/entrenamientos';
import { PestanasEntrenador } from './pestanas-entrenador/pestanas-entrenador';
import { PlanCliente } from './plan-cliente/plan-cliente';
//#endregion

//#region Constants
export const ENTRENADOR_ROUTES: Routes = [
  {
    path: '',
    component: PestanasEntrenador,
    children: [
      {
        path: 'alumnos',
        component: Alumnos,
      },
      {
        path: 'entrenamientos',
        component: Entrenamientos,
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
    component: PlanCliente,
  },
  {
    path: 'entrenamiento/nuevo',
    component: EntrenamientoEditor,
  },
  {
    path: 'entrenamiento/:id',
    component: EntrenamientoEditor,
  },
];
//#endregion
