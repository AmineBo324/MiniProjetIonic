import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, HttpClientModule]
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading = false;
  isLoggedIn = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async login() {
    if (this.loginForm.invalid) {
      await this.presentToast('Please fill all fields correctly','danger');
      return;
    }

    this.isLoading = true;
    
    try {
      const response: any = await this.http.post('http://localhost:5000/patient/login', {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      }).toPromise();
      this.isLoggedIn = true;

      // Store the token and user data (you might want to use a service for this)
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('patient', JSON.stringify(response.patient));
      console.log('Utilisateur connecté :', response);
      console.log(this.isLoggedIn)
      await this.presentToast('Connexion réussie','success');
      this.router.navigate(['/accueil']);
      
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.error?.error || 'Connexion échouée.';
      await this.presentToast(errorMessage,'danger');
    } finally {
      this.isLoading = false;
    }
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