import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionPatientsPage } from './gestion-patients.page';

const routes: Routes = [
  {
    path: '',
    component: GestionPatientsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionPatientsPageRoutingModule {}
