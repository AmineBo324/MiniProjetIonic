import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../auth.service'; // Import AuthService

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
    private router: Router,
    private sanitizer: DomSanitizer,
    private authService: AuthService // Add AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  async loadProfile() {
    this.isLoading = true;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const response: any = await this.http
        .get('http://localhost:5000/patient/patient-details', { headers })
        .toPromise();

      this.user = response;
      this.loadAppointments(this.user.email);
    } catch (error: any) {
      this.presentToast(`Error loading profile: ${error.message || 'Server error'}`, 'danger');
      console.error('Error loading profile from API:', error);
      this.authService.logout(); // Use AuthService to clear tokens and navigate
    } finally {
      this.isLoading = false;
    }
  }

  loadAppointments(patientEmail: string) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const url = `http://localhost: Search for code5000/appointment/patient_appointments?patient_email=${encodeURIComponent(patientEmail)}`;

    this.http.get<any[]>(url, { headers }).subscribe({
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

  viewDocument(appointmentId: string, docIndex: number, filename: string) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const url = `http://localhost:5000/appointment/get_document/${appointmentId}/${docIndex}`;

    this.http.get<any>(url, { headers }).subscribe({
      next: (doc) => {
        if (doc && doc.content) {
          const linkSource = `data:${doc.mimetype};base64,${doc.content}`;
          const downloadLink = document.createElement('a');
          downloadLink.href = linkSource;
          downloadLink.download = filename;
          downloadLink.click();
        } else {
          this.presentToast('Document content is empty or invalid', 'warning');
        }
      },
      error: (err) => {
        this.presentToast('Failed to download document', 'danger');
        console.error('Error fetching document:', err);
      }
    });
  }

  hasDocuments(appointment: any): boolean {
    return appointment.documents && appointment.documents.length > 0;
  }

  getDocumentName(doc: any): string {
    return doc.filename || 'Document';
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