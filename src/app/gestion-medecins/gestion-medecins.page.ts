import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
interface Doctor {
  _id?: string;
  name: string;
  email: string;
  specialty: string;
  created_at?: string;
}
@Component({
  selector: 'app-gestion-medecins',
  templateUrl: './gestion-medecins.page.html',
  styleUrls: ['./gestion-medecins.page.scss'],
  standalone: false,
})
export class GestionMedecinsPage implements OnInit {
  specialties: { name: string; doctors: Doctor[] }[] = [];
  slideOpts = {
    slidesPerView: 1.5,
    spaceBetween: 10,
    centeredSlides: true,
  };

  private apiUrl = 'http://localhost:5000'; // Update with your Flask API URL

  constructor(private http: HttpClient, private alertController: AlertController) {}

  ngOnInit() {
    this.loadDoctors();
  }

  // Fetch doctors from the API and group them by specialty
  loadDoctors() {
    console.log('Fetching doctors...'); 
    this.http.get<Doctor[]>(`${this.apiUrl}/doctors`).subscribe(
      (doctors: Doctor[]) => {
        console.log('Doctors fetched:', doctors);
        const groupedDoctors = this.groupDoctorsBySpecialty(doctors);
        this.specialties = groupedDoctors;
        console.log('Grouped doctors:', this.specialties);
      },
      (error) => {
        console.error('Error fetching doctors:', error);
      }
    );
  }

  // Group doctors by specialty
  groupDoctorsBySpecialty(doctors: Doctor[]): { name: string; doctors: Doctor[] }[] {
    const specialtiesMap = new Map<string, Doctor[]>();

    doctors.forEach((doctor) => {
      if (!specialtiesMap.has(doctor.specialty)) {
        specialtiesMap.set(doctor.specialty, []);
      }
      specialtiesMap.get(doctor.specialty)?.push(doctor);
    });

    return Array.from(specialtiesMap.entries()).map(([name, doctors]) => ({
      name,
      doctors,
    }));
  }

  // Add a new doctor
  async addDoctor(specialty: string) {
    const alert = await this.alertController.create({
      header: 'Ajouter un Médecin',
      inputs: [
        { name: 'name', placeholder: 'Nom', type: 'text' },
        { name: 'email', placeholder: 'Email', type: 'email' },
        { name: 'password', placeholder: 'Mot de passe', type: 'password' },
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Ajouter',
          handler: (data) => {
            const newDoctor = {
              name: data.name,
              email: data.email,
              password: data.password,
              specialty: specialty,
            };
            this.http.post(`${this.apiUrl}/doctor`, newDoctor).subscribe(() => {
              this.loadDoctors(); // Refresh the list
            });
          },
        },
      ],
    });

    await alert.present();
  }

  // Delete a doctor
  deleteDoctor(doctor: Doctor) {
    this.http.delete(`${this.apiUrl}/doctor/${doctor._id}`).subscribe(() => {
      this.loadDoctors(); // Refresh the list
    });
  }

}