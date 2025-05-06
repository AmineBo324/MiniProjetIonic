import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-appointment-requests',
  templateUrl: './appointment-request.page.html', // Updated to singular
  styleUrls: ['./appointment-request.page.scss'],
  standalone: false // Set to false since it's now part of a module
})
export class AppointmentRequestsPage implements OnInit {
  pendingAppointments: any[] = [];
  isLoading = true;

  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    if (this.authService.getUserType() !== 'doctor') {
      await this.presentToast('Accès réservé aux médecins', 'danger');
      return;
    }
    await this.loadPendingAppointments();
  }

  async loadPendingAppointments() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Chargement des demandes de rendez-vous...',
    });
    await loading.present();

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Aucun jeton d’authentification disponible');
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const response: any = await this.http
        .get('http://localhost:5000/profile/appointments?status=pending', { headers })
        .toPromise();

      this.pendingAppointments = response?.appointments || [];
    } catch (error: any) {
      console.error('Erreur chargement demandes de rendez-vous:', error);
      await this.presentToast(`Impossible de charger les demandes: ${error.message || 'Erreur serveur'}`, 'danger');
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  async acceptAppointment(appointmentId: string) {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      await this.http
        .put(`http://localhost:5000/profile/appointments/${appointmentId}/accept`, {}, { headers })
        .toPromise();

      await this.presentToast('Rendez-vous accepté', 'success');
      await this.loadPendingAppointments();
    } catch (error: any) {
      await this.presentToast(`Échec de l’acceptation: ${error.message || 'Erreur serveur'}`, 'danger');
    }
  }

  async rejectAppointment(appointmentId: string) {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      await this.http
        .put(`http://localhost:5000/profile/appointments/${appointmentId}/reject`, {}, { headers })
        .toPromise();

      await this.presentToast('Rendez-vous rejeté', 'success');
      await this.loadPendingAppointments();
    } catch (error: any) {
      await this.presentToast(`Échec du rejet: ${error.message || 'Erreur serveur'}`, 'danger');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}