import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

interface Doctor {
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  zone_geographique: string,
  rating: string,
  image: string
}

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctorlist.page.html',
  styleUrls: ['./doctorlist.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class DoctorlistPage implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  
  // Nouvelles propriétés pour la recherche unifiée
  searchTerm: string = '';
  searchType: string = 'specialite'; // Valeur par défaut
  showFilters: boolean = false;
  
  // Maintenir les anciennes propriétés pour compatibilité
  searchSpecialite: string = '';
  searchZone: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchDoctors();
  }

  fetchDoctors() {
    this.http.get<Doctor[]>('http://localhost:5000/medecin/all')
      .subscribe((response) => {
        this.doctors = response;
        this.filteredDoctors = response;
      }, (error) => {
        console.error('Error fetching doctors:', error);
      });
  }

  // Méthode pour basculer l'affichage des options de filtre
  toggleFilterOptions() {
    this.showFilters = !this.showFilters;
  }

  // Méthode de recherche mise à jour
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

  goToPage(page: string) {
    this.router.navigateByUrl('/' + page);
  }
}