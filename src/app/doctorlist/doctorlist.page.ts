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
  zone_geographique : string,
  rating : string,
  image : string
}

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctorlist.page.html',
  styleUrls: ['./doctorlist.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class DoctorlistPage implements OnInit {
  doctors: Doctor[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<Doctor[]>('http://localhost:5000/medecin/all')  
      .subscribe((response) => {
        this.doctors = response;
      }, (error) => {
        console.error('Error fetching doctors:', error);
      });
  }

  viewDoctorDetails(email: string) {
    this.router.navigate(['/appointment', email]);  
  }
}
