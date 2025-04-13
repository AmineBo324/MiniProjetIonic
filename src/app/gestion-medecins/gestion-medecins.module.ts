import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule


import { GestionMedecinsPage } from './gestion-medecins.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    
    HttpClientModule,
  ],
  declarations: [GestionMedecinsPage]
})
export class GestionMedecinsPageModule {}
