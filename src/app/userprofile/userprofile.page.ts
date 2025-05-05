import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.page.html',
  styleUrls: ['./userprofile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule]
})
export class UserprofilePage implements OnInit {

  user: any = null;
  appointments: any[] = [];
  isLoading = false;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfileFromStorage();
  }

  loadProfileFromStorage() {
    this.isLoading = true;
    
    try {
      const patientData = localStorage.getItem('patient');
      
      if (!patientData) {
        throw new Error('No patient data found');
      }

      this.user = JSON.parse(patientData);
      this.loadAppointments(this.user.email);
      this.isLoading = false;
      
    } catch (error) {
      this.isLoading = false;
      this.presentToast('Error loading profile data', 'danger');
      console.error('Error loading from localStorage:', error);
      this.router.navigate(['/login']);
    }
  }

  loadAppointments(patientEmail: string) {
    const url = `http://localhost:5000/appointment/patient_appointments?patient_email=${encodeURIComponent(patientEmail)}`;
    
    this.http.get<any[]>(url).subscribe({
      next: (appointments) => {
        console.log('Appointments received:', appointments);
        this.appointments = appointments.map(appointment => ({
          ...appointment,
          doctor_details: appointment.doctor_details || { nom: 'Unknown', prenom: '', email: appointment.doctor_email }
        }));
      },
      error: (err) => {
        this.presentToast('Failed to load appointments', 'danger');
        console.error('Error fetching appointments:', err.status, err.statusText, err.url);
      }
    });
  }

  getDocumentUrl(docPath: string): string {
    return `http://localhost:5000/${docPath.replace(/\\/g, '/')}`;
  }

  getDocumentName(docPath: string): string {
    return docPath.split('\\').pop() || 'Document';
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  goToPage(page: string) {
    this.router.navigateByUrl('/' + page);
  }
}