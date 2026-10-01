//#region Imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';
import { PestanasAdminPage } from './pestanas-admin.page';
//#endregion

//#region Constants
const routes: Routes = [
  {
    path: '',
    component: PestanasAdminPage,
    children: [
      {
        path: 'alumnos',
        component: AdminPage,
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
