import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionMedecinsPage } from './gestion-medecins.page';

const routes: Routes = [
  {
    path: '',
    component: GestionMedecinsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionMedecinsPageRoutingModule {}
