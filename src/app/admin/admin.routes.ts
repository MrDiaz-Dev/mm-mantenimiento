//#region Imports
import { Routes } from '@angular/router';

import { Alumnos } from './alumnos/alumnos';
import { PestanasAdmin } from './pestanas-admin/pestanas-admin';
//#endregion

//#region Constants
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: PestanasAdmin,
    children: [
      {
        path: 'alumnos',
        component: Alumnos,
      },
      {
        path: '',
        redirectTo: 'alumnos',
        pathMatch: 'full',
      },
    ],
  },
];
//#endregion
