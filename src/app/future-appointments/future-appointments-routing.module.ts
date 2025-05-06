import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FutureAppointmentsPage } from './future-appointments.page';

const routes: Routes = [
  {
    path: '',
    component: FutureAppointmentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FutureAppointmentsPageRoutingModule {}
