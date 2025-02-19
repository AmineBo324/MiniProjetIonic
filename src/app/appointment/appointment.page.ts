import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
  imports : [CommonModule, IonicModule, FormsModule]
})
export class AppointmentPage {
  patientName: string = '';
  startTime: string = '';
  endTime: string = '';
  complaint: string = '';
  
  doctorAvailability = [
    { day: 'Monday', hours: '9:00 AM - 12:00 PM' },
    { day: 'Tuesday', hours: '2:00 PM - 5:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM - 12:00 PM' },
    { day: 'Thursday', hours: '2:00 PM - 5:00 PM' },
    { day: 'Friday', hours: '9:00 AM - 12:00 PM' },
  ];

  // Date selection for the appointment
  dates = [
    { day: 'MON', number: 12, selected: false },
    { day: 'TUE', number: 13, selected: false },
    { day: 'WED', number: 14, selected: true }, // Default selected
    { day: 'THU', number: 15, selected: false },
    { day: 'FRI', number: 16, selected: false },
    { day: 'SAT', number: 17, selected: false },
  ];

  constructor(private alertCtrl: AlertController) {}

  // Handle date selection
  selectDate(selectedDate: { selected: boolean; }) {
    this.dates.forEach(date => date.selected = false);
    selectedDate.selected = true;
  }

  // Handle appointment submission
  async makeAppointment() {
    const selectedDate = this.dates.find(d => d.selected);
    
    if (!selectedDate) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Please select a date before making an appointment.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Appointment Confirmed',
      message: `Patient: ${this.patientName} <br> 
                Date: ${selectedDate.number} <br>
                Time: ${this.startTime || 'N/A'} - ${this.endTime || 'N/A'} <br>
                Complaint: ${this.complaint || 'N/A'}`,
      buttons: ['OK']
    });
    await alert.present();
  }
}
