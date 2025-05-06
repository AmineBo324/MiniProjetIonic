import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentRequestsPage } from './appointment-request.page';

const routes: Routes = [
  {
    path: '',
    component: AppointmentRequestsPage
  }
];

@NgModule({
  declarations: [AppointmentRequestsPage], // Declare the component
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes) // Import routing
  ],
  exports: [AppointmentRequestsPage] // Optional, only if the component is used elsewhere
})
export class AppointmentRequestPageModule {}