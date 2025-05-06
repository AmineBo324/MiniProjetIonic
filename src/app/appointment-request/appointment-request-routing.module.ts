import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppointmentRequestsPage } from './appointment-request.page';

const routes: Routes = [
  {
    path: '',
    component: AppointmentRequestsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentRequestPageRoutingModule {}