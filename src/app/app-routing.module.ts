//#region Imports
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import {
  guardiaAutenticacion,
  guardiaInvitado,
  guardiaSoloAdmin,
  guardiaSoloCliente,
  guardiaSoloEntrenador,
} from './guardianes/autenticacion.guardia';
//#endregion

//#region Constants
const routes: Routes = [
  {
    path: '',
    redirectTo: 'iniciar-sesion',
    pathMatch: 'full',
  },
  {
    path: 'iniciar-sesion',
    canActivate: [guardiaInvitado],
    loadChildren: () =>
      import('./paginas/iniciar-sesion/iniciar-sesion.module').then(
        (m) => m.IniciarSesionPageModule
      ),
  },
  {
    path: 'admin',
    canActivate: [guardiaAutenticacion, guardiaSoloAdmin],
    loadChildren: () =>
      import('./paginas/admin/admin.module').then((m) => m.AdminPageModule),
  },
  {
    path: 'entrenador',
    canActivate: [guardiaAutenticacion, guardiaSoloEntrenador],
    loadChildren: () =>
      import('./paginas/entrenador/entrenador.module').then(
        (m) => m.EntrenadorPageModule
      ),
  },
  {
    path: 'alumno',
    canActivate: [guardiaAutenticacion, guardiaSoloCliente],
    loadChildren: () =>
      import('./paginas/alumno/alumno.module').then((m) => m.AlumnoPageModule),
  },
  {
    path: '**',
    redirectTo: 'iniciar-sesion',
  },
];
//#endregion

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
