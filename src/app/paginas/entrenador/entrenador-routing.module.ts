//#region Imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EntrenadorPage } from './entrenador.page';
import { PlanClientePage } from './plan-cliente.page';
//#endregion

//#region Constants
const routes: Routes = [
  {
    path: '',
    component: EntrenadorPage,
  },
  {
    path: 'cliente/:id',
    component: PlanClientePage,
  },
];
//#endregion

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntrenadorPageRoutingModule {}
