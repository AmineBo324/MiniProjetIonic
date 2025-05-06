import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConsultationsHistoryPage } from './consultations-history.page';

const routes: Routes = [
  {
    path: '',
    component: ConsultationsHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultationsHistoryPageRoutingModule {}
