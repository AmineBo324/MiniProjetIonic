import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonDatetime, IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, HttpClientModule]
})
export class SignupPage implements OnInit {

  signupForm: FormGroup;
  isLoading = false;
  private apiUrl = 'http://localhost:5000/patient/register'; // Replace with your Flask server URL

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router

  ) {
    this.signupForm = this.formBuilder.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      date_naissance: ['', Validators.required],
      genre: ['', Validators.required],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
    });
  }

  ngOnInit() {}

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  signup() {
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    const formValue = this.signupForm.value;

    // Ensure date_naissance is in YYYY-MM-DD format
    const dateNaissance = formValue.date_naissance
      ? new Date(formValue.date_naissance).toISOString().split('T')[0]
      : '';

    const payload = {
      ...formValue,
      date_naissance: dateNaissance
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.presentToast('Inscription réussie !', 'success');
        this.signupForm.reset();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.error || 'Erreur lors de l\'inscription';
        this.presentToast(errorMessage, 'danger');
      }
    });
  }


  goToPage(page: string) {
    this.router.navigateByUrl('/' + page);
  }

  
}