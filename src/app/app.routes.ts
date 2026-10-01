//#region Imports
import { Routes } from '@angular/router';

import {
  guardiaAutenticacion,
  guardiaInvitado,
  guardiaSoloAdmin,
  guardiaSoloCliente,
  guardiaSoloEntrenador,
} from './autenticacion/autenticacion.guard';
//#endregion

//#region Constants
export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'iniciar-sesion',
    pathMatch: 'full',
  },
  {
    path: 'iniciar-sesion',
    canActivate: [guardiaInvitado],
    loadComponent: () =>
      import('./autenticacion/iniciar-sesion/iniciar-sesion').then(
        (m) => m.IniciarSesion
      ),
  },
  {
    path: 'admin',
    canActivate: [guardiaAutenticacion, guardiaSoloAdmin],
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'entrenador',
    canActivate: [guardiaAutenticacion, guardiaSoloEntrenador],
    loadChildren: () =>
      import('./entrenador/entrenador.routes').then((m) => m.ENTRENADOR_ROUTES),
  },
  {
    path: 'alumno',
    canActivate: [guardiaAutenticacion, guardiaSoloCliente],
    loadChildren: () =>
      import('./alumno/alumno.routes').then((m) => m.ALUMNO_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'iniciar-sesion',
  },
];
//#endregion
