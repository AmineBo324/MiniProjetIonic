import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface HighlightedDate {
  date: string;          // Format: 'YYYY-MM-DD'
  textColor: string;     // Color of the text (e.g., '#ffffff')
  backgroundColor: string;  // Background color (e.g., '#2dd36f')
}

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})

export class AppointmentPage implements OnInit {
  patientName: string = '';
  startTime: string = '';
  endTime: string = '';
  complaint: string = '';
  selectedDates: string[] = [];
  doctorEmail: string = '';
  doctor: any = {};
  availability: any = {}; // Store available times by date
  availableDates: string[] = [];
  selectedDate: any = ''; // Store selected date

  minDate = new Date().toISOString().split('T')[0]; // Today
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.doctorEmail = params.get('email')!;
      this.loadDoctorDetails();
    });
  }

  loadDoctorDetails() {
    // Fetch doctor's full details using the email
    this.http.get(`http://localhost:5000/medecin/doctor-details/${this.doctorEmail}`)
      .subscribe((response: any) => {
        this.doctor = response;  // Store the fetched doctor details
        this.loadDoctorAvailability(); // Fetch doctor availability after details are loaded
      }, error => {
        console.error('Error fetching doctor details:', error);
      });
  }

  loadDoctorAvailability() {
    // Fetch doctor's availability from the backend
    this.http.get<any>(`http://localhost:5000/medecin/availability/${this.doctorEmail}`).subscribe(
      (response) => {
        // Map each date to its available times
        this.availability = response.availability.reduce((acc: any, entry: string) => {
          const [date, time] = entry.split(' ');
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(time); // Add the time to the list for that date
          return acc;
        }, {});

        console.log(this.availability); // Example format: { '2025-03-10': ['10:00', '14:00'], ... }
        this.availableDates = Object.keys(this.availability); // Store the list of available dates
      },
      (error) => {
        console.error('Error fetching doctor availability', error);
      }
    );
  }

  highlightDates(): HighlightedDate[] {
    const today = new Date();
    const month = today.getMonth();  // Current month
    const year = today.getFullYear();  // Current year

    const highlightedDates: HighlightedDate[] = [];

    // Assume 'availableDays' is already fetched (e.g., ['Monday', 'Wednesday'])
    const availableDays = this.availableDates;  // Or fetch from server as needed

    // Loop through the doctor's available days
    availableDays.forEach(day => {
      const dayIndex = this.getDayIndex(day) + 1;  // Get the index for the specified day (e.g., 1 for Monday)
      const firstDayOfMonth = new Date(year, month, 1);  // Start from the first day of the current month
      const lastDayOfMonth = new Date(year, month + 1, 0);  // Get the last day of the current month

      // Find the first occurrence of the specified day in the current month
      let currentDay = new Date(firstDayOfMonth);
      currentDay.setDate(firstDayOfMonth.getDate() + ((dayIndex - currentDay.getDay() + 7) % 7));

      // Loop through the month to find all occurrences of the given day
      while (currentDay <= lastDayOfMonth) {
        const dateString = new Date(currentDay).toISOString().split('T')[0];  // Convert to 'YYYY-MM-DD'
        highlightedDates.push({
          date: dateString,
          textColor: '#ffffff',
          backgroundColor: '#2dd36f'  // Green background for available days
        });

        // Move to the next occurrence of the same day in the next week
        currentDay.setDate(currentDay.getDate() + 7);
      }
    });

    return highlightedDates;
  }

  // Helper function to convert day name to an index
  getDayIndex(day: string): number {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(day);
  }

  // Disable unavailable dates
  isDateDisabled(date: string): boolean {
    return !this.availableDates.includes(date);
  }

  dateSelected(event: any) {
    // Parse the selected date into a JavaScript Date object
    this.selectedDate = new Date(event.detail.value);
    console.log(this.selectedDate);
    
    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const day = this.selectedDate.getDay();
    
    // Get the day name (e.g., "Monday", "Tuesday")
    const dayName = this.getDayName(day);
    console.log('Selected Day:', dayName);
    
    // Check if the doctor has availability on the selected day
    const availableTimes = this.availability[dayName];
    console.log(availableTimes)
    
    if (availableTimes && availableTimes.length > 0) {
      // Doctor is available on this day, adjust start and end times
      
      // Assuming times are in the format "HH:MM-HH:MM"
      const timeRange = availableTimes[0]; // For simplicity, let's use the first available time range
      const [start, end] = timeRange.split('-');  // Split into start time and end time
      
      this.startTime = start;  // Set start time to the first part of the time range
      this.endTime = end;      // Set end time to the second part of the time range
      console.log(this.startTime),
      console.log(this.endTime)
    } else {
      // Doctor is not available on this day, reset times
      this.startTime = '';
      this.endTime = '';
    }
  
    // Reset complaint and other necessary fields
    this.complaint = '';  // Reset complaint as needed
  }
  
  
  
  // Helper function to convert the numeric day index into a string day name
  getDayName(dayIndex: number): string {
    const daysOfWeek = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    return daysOfWeek[dayIndex];
  }
  

  async makeAppointment() {
    if (!this.selectedDates.length) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Please select at least one date before making an appointment.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const appointmentData = {
      patient_name: this.patientName,
      doctor_email: this.doctorEmail, 
      date: this.selectedDates[0], 
      start_time: this.startTime,
      end_time: this.endTime,
      complaint: this.complaint
    };

    this.http.post('http://localhost:5000/appointment/create_appointment', appointmentData).subscribe(
    async (response: any) => {
      const successAlert = await this.alertCtrl.create({
        header: 'Success',
        message: 'Your appointment has been successfully created.',
        buttons: ['OK']
      });
      await successAlert.present();
    },
    async (error) => {
      const errorAlert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Failed to create appointment. Please try again later.',
        buttons: ['OK']
      });
      await errorAlert.present();
    }
  );
}
}
