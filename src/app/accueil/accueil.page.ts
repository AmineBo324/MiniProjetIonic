import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

interface Doctor {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  zone_geographique: string;
  email: string;
  image?: string;
  rating: number;
}


@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.page.html',
  styleUrls: ['./accueil.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})



export class AccueilPage implements OnInit {

  adImages: string[] = [
    'assets/ads/ad1.jpg',
    'assets/ads/ad2.jpg',
    'assets/ads/ad3.jpg'
  ];
  currentAdIndex: number = 0;

  specialties = [
    { name: 'Médecin généraliste', icon: 'medkit' },
    { name: 'Dentiste', icon: 'fitness' },
    { name: 'Pédiatrie', icon: 'happy' },
    { name: 'Cardiologie', icon: 'heart' },
    { name: 'Dermatologie', icon: 'body' },
    { name: 'Ophtalmologie', icon: 'eye' },
    { name: 'Orthopédie', icon: 'walk' },
    { name: 'Gynécologie', icon: 'female' }
  ];

  // Variables pour les médecins
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  searchType: string = 'specialite';
  searchTerm: string = '';
  searchSpecialite: string = '';
  searchZone: string = '';
  showFilters: boolean = false;
  isLoggedIn: boolean = false; 
  patientData: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.fetchDoctors();
    this.checkUserLoginStatus();
  }

  changeAdImage() {
    this.currentAdIndex = (this.currentAdIndex + 1) % this.adImages.length;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  fetchDoctors() {
    this.http.get<Doctor[]>('http://localhost:5000/medecin/recent')
      .subscribe((response) => {
        this.doctors = response;
        this.filteredDoctors = response;
      }, (error) => {
        console.error('Error fetching doctors:', error);
      });
  }

  searchDoctors() {
    // Vérifier le type de recherche sélectionné et assigner la valeur appropriée
    if (this.searchType === 'specialite') {
      this.searchSpecialite = this.searchTerm;
      this.searchZone = '';
    } else {
      this.searchZone = this.searchTerm;
      this.searchSpecialite = '';
    }
    
    let queryParams = [];
    if (this.searchSpecialite.trim()) {
      queryParams.push(`specialite=${this.searchSpecialite}`);
    }
    if (this.searchZone.trim()) {
      queryParams.push(`zone_geographique=${this.searchZone}`);
    }
    
    const queryString = queryParams.length ? '?' + queryParams.join('&') : '';
    
    this.http.get<Doctor[]>(`http://localhost:5000/medecin/search${queryString}`)
      .subscribe((response) => {
        this.filteredDoctors = response;
      }, (error) => {
        console.error('Error searching doctors:', error);
      });
    
    // Masquer les options de filtre après la recherche
    this.showFilters = false;
  }

  viewDoctorDetails(email: string) {
    this.router.navigate(['/appointment', email]);
  }

  showAllDoctors(){
    this.router.navigate(['/doctorlist']);
  }

  resetSearch() {
    this.searchTerm = '';
    this.searchSpecialite = '';
    this.searchZone = '';
    this.fetchDoctors();
  }

  checkUserLoginStatus() {
    const token = localStorage.getItem('auth_token');
    const patientData = localStorage.getItem('patient');
    
    if (token && patientData) {
      try {
        // Convertir les données JSON en objet
        this.patientData = JSON.parse(patientData);
        this.isLoggedIn = true;
        console.log('Utilisateur connecté :', this.patientData);
        console.log(this.isLoggedIn)
      } catch (error) {
        console.error('Erreur lors de la lecture des données patient :', error);
        this.logout(); // En cas d'erreur, déconnexion par précaution
      }
    } else {
      this.isLoggedIn = false;
      this.patientData = null;
    }
    
    return this.isLoggedIn;
  }

  logout() {
    // Supprimer le token et les données patient du localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('patient');
    
    // Réinitialiser les variables
    this.isLoggedIn = false;
    this.patientData = null;
    
    // Afficher un message de confirmation
    this.presentToast('Déconnexion réussie', 'success');
    
    // Rediriger vers la page d'accueil
    this.router.navigate(['/login']);
    console.log(this.isLoggedIn)
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration:500,
      color,
      position: 'top'
    });
    await toast.present();
  }

  goToPage(page: string) {
    this.router.navigateByUrl('/' + page);
  }

}
