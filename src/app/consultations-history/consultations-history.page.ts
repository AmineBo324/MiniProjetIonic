import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-consultations-history',
  templateUrl: './consultations-history.page.html',
  styleUrls: ['./consultations-history.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ConsultationsHistoryPage implements OnInit {
  consultations: any[] = [];
  documents: any[] = [];
  isLoading = true;

  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    if (this.authService.getUserType() !== 'doctor') {
      await this.presentToast('Accès réservé aux médecins', 'danger');
      return;
    }
    await this.loadConsultations();
  }

  async loadConsultations() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Chargement des consultations...',
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
  
      const consultationsResponse: any = await this.http
        .get('http://localhost:5000/profile/consultations', { headers })
        .toPromise();
  
      this.consultations = consultationsResponse?.consultations || [];
  
      // Fetch all documents for the doctor
      const documentsResponse: any = await this.http
        .get('http://localhost:5000/profile/documents', { headers })
        .toPromise();
      this.documents = documentsResponse?.documents || [];
  
      // Filter documents by consultation document_ids
      this.consultations.forEach(consultation => {
        consultation.documents = this.documents.filter(doc => 
          (consultation.document_ids || []).includes(doc._id)
        );
      });
    } catch (error: any) {
      console.error('Erreur chargement consultations:', error);
      await this.presentToast(`Impossible de charger les consultations: ${error.message || 'Erreur serveur'}`, 'danger');
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  getDocumentName(docId: string): string {
    const doc = this.documents.find(d => d._id === docId);
    return doc ? doc.name : 'Document non trouvé';
  }

  getDocumentAnnotations(docId: string): string[] {
    const doc = this.documents.find(d => d._id === docId);
    return doc ? doc.annotations || [] : [];
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
      this.loadConsultations();
    } catch (error: any) {
      await this.presentToast(`Échec de l’ajout de l’annotation: ${error.message || 'Erreur serveur'}`, 'danger');
    }
  }

  async addDocumentToConsultation(consultationId: string) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    
    fileInput.addEventListener('change', async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const token = localStorage.getItem('auth_token');
          const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
          });

          const url = `http://localhost:5000/profile/consultations/${consultationId}/add-document`;
          await this.http.post(url, formData, { headers }).toPromise();
          
          await this.presentToast('Document ajouté avec succès', 'success');
          this.loadConsultations();
        } catch (error: any) {
          await this.presentToast(`Échec de l’ajout du document: ${error.message || 'Erreur serveur'}`, 'danger');
        }
      }
    });
    
    fileInput.click();
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