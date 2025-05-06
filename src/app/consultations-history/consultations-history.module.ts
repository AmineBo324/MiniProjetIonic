import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ConsultationsHistoryPageRoutingModule } from './consultations-history-routing.module';
import { ConsultationsHistoryPage } from './consultations-history.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ConsultationsHistoryPageRoutingModule,
    ConsultationsHistoryPage
  ]
})
export class ConsultationsHistoryPageModule {}