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
      await this.showToast('Please fill all fields correctly');
      return;
    }

    this.isLoading = true;
    
    try {
      const response: any = await this.http.post('http://localhost:5000/medecin/login', {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      }).toPromise();

      // Store the token and user data (you might want to use a service for this)
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('medecin', JSON.stringify(response.medecin));

      await this.showToast('Login successful');
      this.router.navigate(['/accueil']);
      console.log(response) 
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.error?.error || 'Login failed. Please try again.';
      await this.showToast(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }

  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}