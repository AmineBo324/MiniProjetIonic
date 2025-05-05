import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CalendarModule } from '@syncfusion/ej2-angular-calendars';
import { ProfileMedecinPage } from './profile-medecin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarModule,
    ProfileMedecinPage // Import standalone component
  ],
  declarations: [] // Remove ProfileMedecinPage from declarations
})
export class ProfileMedecinPageModule {}