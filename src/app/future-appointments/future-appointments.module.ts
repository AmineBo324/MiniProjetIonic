import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FutureAppointmentsPageRoutingModule } from './future-appointments-routing.module';
import { FutureAppointmentsPage } from './future-appointments.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FutureAppointmentsPageRoutingModule,
    FutureAppointmentsPage
  ]
})
export class FutureAppointmentsPageModule {}