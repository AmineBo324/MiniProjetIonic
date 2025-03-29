import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface DaySlot {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  dateNumber: number;
  isAvailable: boolean;
}

interface TimeSlot {
  start: string;
  end: string;
  isAvailable: boolean;
}

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AppointmentPage implements OnInit {
  patientName: string = '';
  complaint: string = '';
  doctorEmail: string = '';
  doctor: any = {};
  availability: any = {};
  
  // Weekly calendar properties
  currentWeekStart = new Date();
  weekDays: DaySlot[] = [];
  selectedDate: string | null = null;
  
  // Time slots properties
  availableSlots: TimeSlot[] = [];
  selectedSlot: TimeSlot | null = null;
  workingHours = { start: '08:00', end: '18:00' }; // Default working hours
  slotDuration = 30; // minutes
  endTime: any;
  startTime: any;

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
    this.generateWeekDays();
  }

  generateWeekDays() {
    const startOfWeek = new Date(this.currentWeekStart);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start from Sunday
    
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayName = this.getDayName(date.getDay());
      const isAvailable = this.availability[dayName] && this.availability[dayName].length > 0;
      
      return {
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNumber: date.getDate(),
        isAvailable: isAvailable
      };
    });
  }

  previousWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.generateWeekDays();
    this.selectedDate = null;
    this.availableSlots = [];
  }

  nextWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.generateWeekDays();
    this.selectedDate = null;
    this.availableSlots = [];
  }

  async selectDate(date: string) {
    const dateObj = new Date(date);
    const dayName = this.getDayName(dateObj.getDay());
    
    if (!this.isDayAvailable(dayName)) {
      const alert = await this.alertCtrl.create({
        header: 'Not Available',
        message: 'The doctor is not available on this day',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    
    this.selectedDate = date;
    this.selectedSlot = null;
    
    // Get the doctor's working hours for this day
    const dayAvailability = this.availability[dayName][0];
    const [start, end] = dayAvailability.split('-').map((t: string) => t.trim());
    this.workingHours = { start, end };
    
    // Fetch existing appointments for this date
    this.fetchBookedAppointments(date);
  }

  fetchBookedAppointments(date: string) {
    this.http.get<any[]>(
      `http://localhost:5000/appointment/retrieve_appointment?doctor_email=${this.doctorEmail}&date=${date}`
    ).subscribe(
      (appointments) => {
        this.calculateAvailableSlots(appointments);
      },
      (error) => {
        console.error('Error fetching appointments:', error);
        this.availableSlots = [];
      }
    );
  }

  calculateAvailableSlots(bookedAppointments: any[]) {
    const slots: TimeSlot[] = [];
    const slotDurationMs = this.slotDuration * 60 * 1000;
    
    // Parse working hours
    const [startHour, startMinute] = this.workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = this.workingHours.end.split(':').map(Number);
    
    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);
    
    // Generate all possible slots
    let currentTime = new Date(startTime);
    
    while (currentTime.getTime() + slotDurationMs <= endTime.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + slotDurationMs);
      
      const slot: TimeSlot = {
        start: this.formatTime(currentTime),
        end: this.formatTime(slotEnd),
        isAvailable: true
      };
      
      // Check if slot is booked
      const isBooked = bookedAppointments.some(app => {
        const appStart = this.timeToMinutes(app.start_time);
        const appEnd = this.timeToMinutes(app.end_time);
        const slotStart = this.timeToMinutes(slot.start);
        const slotEnd = this.timeToMinutes(slot.end);
        
        return (slotStart >= appStart && slotStart < appEnd) || 
               (slotEnd > appStart && slotEnd <= appEnd) ||
               (slotStart <= appStart && slotEnd >= appEnd);
      });
      
      slot.isAvailable = !isBooked;
      slots.push(slot);
      
      currentTime = new Date(currentTime.getTime() + slotDurationMs);
    }
    
    this.availableSlots = slots;
  }

  selectSlot(slot: TimeSlot) {
    if (slot.isAvailable) {
      this.selectedSlot = slot;
      // Auto-fill the time inputs
      this.startTime = slot.start;
      this.endTime = slot.end;
    }
  }

  // Helper methods
  formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5);
  }

  timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getDayName(dayIndex: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  isDayAvailable(dayName: string): boolean {
    return !!this.availability[dayName]?.length;
  }

  loadDoctorDetails() {
    this.http.get(`http://localhost:5000/medecin/doctor-details/${this.doctorEmail}`)
      .subscribe((response: any) => {
        this.doctor = response;
        this.loadDoctorAvailability();
      }, error => {
        console.error('Error fetching doctor details:', error);
      });
  }

  loadDoctorAvailability() {
    this.http.get<any>(`http://localhost:5000/medecin/availability/${this.doctorEmail}`).subscribe(
      (response) => {
        this.availability = response.availability.reduce((acc: any, entry: string) => {
          const [dayName, time] = entry.split(' ');
          if (!acc[dayName]) {
            acc[dayName] = [];
          }
          acc[dayName].push(time);
          return acc;
        }, {});
  
        console.log('Disponibilités chargées:', this.availability);
        this.generateWeekDays();
      },
      (error) => {
        console.error('Erreur:', error);
      }
    );
  }

  async makeAppointment() {
    // First check if we have the minimum required data
    if (!this.selectedDate) {
        const alert = await this.alertCtrl.create({
            header: 'Error',
            message: 'Please select a date before making an appointment.',
            buttons: ['OK']
        });
        await alert.present();
        return;
    }

    // Then check if we have time information (either from slot selection or manual input)
    if (!this.startTime || !this.endTime) {
        const alert = await this.alertCtrl.create({
            header: 'Error',
            message: 'Please select a time slot or enter start/end times.',
            buttons: ['OK']
        });
        await alert.present();
        return;
    }

    const appointmentData = {
        patient_name: this.patientName,
        doctor_email: this.doctorEmail,
        date: this.selectedDate,
        start_time: this.startTime,
        end_time: this.endTime,
        complaint: this.complaint
    };

    console.log('Submitting appointment:', appointmentData); // Debug log

    this.http.post('http://localhost:5000/appointment/create_appointment', appointmentData).subscribe(
        async (response: any) => {
            const successAlert = await this.alertCtrl.create({
                header: 'Success',
                message: 'Your appointment has been successfully created.',
                buttons: ['OK']
            });
            await successAlert.present();
            
            // Reset form
            this.selectedSlot = null;
            this.startTime = '';
            this.endTime = '';
            
            // Refresh available slots
            this.fetchBookedAppointments(this.selectedDate!);
        },
        async (error) => {
            console.error('Appointment error:', error); // Debug log
            const errorAlert = await this.alertCtrl.create({
                header: 'Error',
                message: error.error?.message || 'Failed to create appointment. Please try again later.',
                buttons: ['OK']
            });
            await errorAlert.present();
        }
    );
}
}