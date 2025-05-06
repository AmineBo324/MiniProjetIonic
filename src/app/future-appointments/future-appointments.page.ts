import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-future-appointments',
  templateUrl: './future-appointments.page.html',
  styleUrls: ['./future-appointments.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class FutureAppointmentsPage implements OnInit {
  futureAppointments: any[] = [];
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
    await this.loadFutureAppointments();
  }

  async loadFutureAppointments() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Chargement des rendez-vous...',
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
        .get('http://localhost:5000/profile/appointments', { headers })
        .toPromise();

      const allAppointments = response?.appointments || [];
      const today = new Date().toISOString().split('T')[0];

      this.futureAppointments = allAppointments.filter((appt: any) => 
        appt.status === 'accepted' && appt.date >= today
      );
    } catch (error: any) {
      console.error('Erreur chargement rendez-vous:', error);
      await this.presentToast('Impossible de charger les rendez-vous', 'danger');
    } finally {
      this.isLoading = false;
      await loading.dismiss();
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