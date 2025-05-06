import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-profile-medecin',
  templateUrl: './profile-medecin.page.html',
  styleUrls: ['./profile-medecin.page.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, IonicModule]
})
export class ProfileMedecinPage implements OnInit {
  doctor: any = null;
  originalData: any = null;
  editMode = false;
  isLoading = true;
  defaultImage = '/assets/images/default-doctor.png';
  placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  appointments: any[] = [];
  pendingAppointments: any[] = [];
  acceptedAppointments: any[] = [];
  documents: any[] = [];
  consultations: any[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  currentView: string = 'profile'; // profile, consultations, requests, upcoming
  private validImages: Set<string> = new Set();

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    if (this.authService.getUserType() !== 'doctor') {
      await this.showAlert('Erreur', 'Accès réservé aux médecins');
      this.router.navigate(['/login']);
      return;
    }
    await this.loadProfile();
    await this.loadAppointments();
    await this.loadDocuments();
    await this.loadConsultations();
  }

  async loadProfile() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Chargement du profil...',
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
        .get('http://localhost:5000/profile/', { headers }) // Corrected endpoint
        .toPromise();
  
      if (!response || !response.doctor) {
        throw new Error('Profil médecin non trouvé');
      }
  
      this.doctor = response.doctor; // Adjust to match backend response structure
      this.originalData = { ...response.doctor };
      await this.validateImage(this.doctor.image);
      localStorage.setItem('doctor', JSON.stringify(this.doctor));
    } catch (error: any) {
      console.error('Erreur chargement profil:', error);
      await this.presentToast(`Impossible de charger le profil: ${error.message || 'Erreur serveur'}`, 'danger');
      this.authService.logout();
      this.router.navigate(['/login']);
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }
  async validateImage(image: string | undefined) {
    if (!image || image === '' || this.validImages.has(image)) {
      return;
    }
    const imageUrl = `/assets/images/${image}`;
    try {
      await this.http.head(imageUrl).toPromise();
      this.validImages.add(image);
    } catch (error) {
      console.warn(`Image not found: ${imageUrl}`);
      if (this.doctor && this.doctor.image === image) {
        this.doctor.image = '';
      }
    }
  }

  async loadAppointments() {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      // Load pending appointments
      const pendingResponse: any = await this.http
        .get('http://localhost:5000/profile/appointments?status=pending', { headers })
        .toPromise();
      this.pendingAppointments = pendingResponse?.appointments || [];

      // Load accepted appointments
      const acceptedResponse: any = await this.http
        .get('http://localhost:5000/profile/appointments?status=accepted', { headers })
        .toPromise();
      this.acceptedAppointments = acceptedResponse?.appointments || [];

      // All appointments for profile view
      const allResponse: any = await this.http
        .get('http://localhost:5000/profile/appointments', { headers })
        .toPromise();
      this.appointments = allResponse?.appointments || [];
    } catch (error: any) {
      console.error('Erreur chargement rendez-vous:', error);
      await this.presentToast('Impossible de charger les rendez-vous', 'danger');
    }
  }

  async loadDocuments() {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const response: any = await this.http
        .get('http://localhost:5000/profile/documents', { headers })
        .toPromise();

      this.documents = response?.documents || [];
    } catch (error: any) {
      console.error('Erreur chargement documents:', error);
      await this.presentToast('Impossible de charger les documents', 'danger');
    }
  }

  async loadConsultations() {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const response: any = await this.http
        .get('http://localhost:5000/profile/consultations', { headers })
        .toPromise();

      this.consultations = response?.consultations || [];
    } catch (error: any) {
      console.error('Erreur chargement consultations:', error);
      await this.presentToast('Impossible de charger les consultations', 'danger');
    }
  }

  getProfileImage(image: string | undefined): string {
    if (image && image !== '' && this.validImages.has(image)) {
      return `/assets/images/${image}`;
    }
    return this.defaultImage;
  }

  handleImageError(event: any) {
    if (event.target.src !== this.placeholderImage) {
      console.warn('Image load failed, using placeholder:', event.target.src);
      event.target.src = this.placeholderImage;
    }
  }

  switchView(view: string) {
    this.currentView = view;
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    if (!this.editMode && this.originalData) {
      this.doctor = { ...this.originalData };
    }
  }

  async saveProfile() {
    if (!this.doctor) return;

    const loading = await this.loadingCtrl.create({
      message: 'Mise à jour du profil...',
    });
    await loading.present();

    try {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const updateData: any = {
        nom: this.doctor.nom,
        prenom: this.doctor.prenom,
        specialite: this.doctor.specialite,
        zone_geographique: this.doctor.zone_geographique,
        image: this.doctor.image
      };

      await this.http
        .put('http://localhost:5000/profile/update', updateData, { headers })
        .toPromise();

      this.editMode = false;
      this.originalData = { ...this.doctor };
      await this.validateImage(this.doctor.image);
      localStorage.setItem('doctor', JSON.stringify(this.doctor));
      await this.presentToast('Profil mis à jour avec succès', 'success');
    } catch (error: any) {
      await this.presentToast(`Échec de la mise à jour: ${error.message || 'Erreur serveur'}`, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async updateAvailability() {
    if (!this.doctor) return;

    try {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      await this.http
        .put(
          'http://localhost:5000/profile/availability',
          { availability: this.doctor.availability || [] },
          { headers }
        )
        .toPromise();

      localStorage.setItem('doctor', JSON.stringify(this.doctor));
      await this.presentToast('Disponibilités mises à jour avec succès', 'success');
    } catch (error: any) {
      await this.presentToast(`Échec de la mise à jour des disponibilités: ${error.message || 'Erreur serveur'}`, 'danger');
    }
  }

  addAvailability(date: string, start: string, end: string) {
    if (!this.doctor) return;
    this.doctor.availability = this.doctor.availability || [];
    this.doctor.availability.push({
      date,
      start,
      end
    });
  }

  removeAvailability(index: number) {
    if (!this.doctor) return;
    this.doctor.availability.splice(index, 1);
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
      await this.loadAppointments();
    } catch (error: any) {
      await this.presentToast(`Échec de l’acceptation du rendez-vous: ${error.message || 'Erreur serveur'}`, 'danger');
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
      await this.loadAppointments();
    } catch (error: any) {
      await this.presentToast(`Échec du rejet du rendez-vous: ${error.message || 'Erreur serveur'}`, 'danger');
    }
  }

  async cancelAppointment(appointmentId: string) {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      await this.http
        .delete(`http://localhost:5000/profile/appointments/${appointmentId}`, { headers })
        .toPromise();

      await this.presentToast('Rendez-vous annulé', 'success');
      await this.loadAppointments();
    } catch (error: any) {
      await this.presentToast(`Échec de l’annulation du rendez-vous: ${error.message || 'Erreur serveur'}`, 'danger');
    }
  }

  async uploadDocument(consultationId: string, patientEmail: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_email', patientEmail);
    formData.append('consultation_id', consultationId);

    try {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      const response: any = await this.http
        .post('http://localhost:5000/profile/documents/upload', formData, { headers })
        .toPromise();

      await this.presentToast('Document téléversé avec succès', 'success');
      await this.loadDocuments();
      await this.loadConsultations();
    } catch (error: any) {
      await this.presentToast(`Échec du téléversement: ${error.message || 'Erreur serveur'}`, 'danger');
    }
  }

  async openAnnotationPrompt(documentId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Ajouter une annotation',
      inputs: [
        {
          name: 'annotation',
          type: 'text',
          placeholder: 'Entrez votre annotation',
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Confirmer',
          handler: (data) => {
            if (data.annotation) {
              this.annotateDocument(documentId, data.annotation);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async annotateDocument(documentId: string, annotation: string) {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      await this.http
        .put(
          `http://localhost:5000/profile/documents/${documentId}/annotate`,
          { annotation },
          { headers }
        )
        .toPromise();

      await this.presentToast('Annotation ajoutée avec succès', 'success');
      await this.loadDocuments();
    } catch (error: any) {
      await this.presentToast(`Échec de l’ajout de l’annotation: ${error.message || 'Erreur serveur'}`, 'danger');
    }
  }

  async saveConsultation(appointmentId: string, patientEmail: string, diagnosis: string, prescription: string, documents: string[]) {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      await this.http
        .post(
          'http://localhost:5000/profile/consultations',
          { appointmentId, patient_email: patientEmail, diagnosis, prescription, documents },
          { headers }
        )
        .toPromise();

      await this.presentToast('Consultation enregistrée avec succès', 'success');
      await this.loadConsultations();
    } catch (error: any) {
      await this.presentToast(`Échec de l’enregistrement de la consultation: ${error.message || 'Erreur serveur'}`, 'danger');
    }
  }

  private async showAlert(title: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  logout() {
    this.authService.logout();
  }
  goToPage(page: string) {
    this.router.navigateByUrl('/' + page);
  }
}
