import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminPageRoutingModule } from './admin-routing.module';

import { AdminPage } from './admin.page';

@NgModule({
  declarations: [AdminPage], // Declare AdminPage here

  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminPageRoutingModule,

  ],
  
})
export class AdminPageModule {}
