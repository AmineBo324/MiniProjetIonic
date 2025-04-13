import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionPatientsPageRoutingModule } from './gestion-patients-routing.module';

import { GestionPatientsPage } from './gestion-patients.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionPatientsPageRoutingModule
    
  ],
  declarations: [GestionPatientsPage]
})
export class GestionPatientsPageModule {}
