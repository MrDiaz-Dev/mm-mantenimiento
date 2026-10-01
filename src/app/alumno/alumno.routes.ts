//#region Imports
import { Routes } from '@angular/router';

import { Ficha } from './ficha/ficha';
import { Historial } from './historial/historial';
import { PestanasAlumno } from './pestanas-alumno/pestanas-alumno';
//#endregion

//#region Constants
export const ALUMNO_ROUTES: Routes = [
  {
    path: '',
    component: PestanasAlumno,
    children: [
      {
        path: 'ficha',
        component: Ficha,
      },
      {
        path: 'historial',
        component: Historial,
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
