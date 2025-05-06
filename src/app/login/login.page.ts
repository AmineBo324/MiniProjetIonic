import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule]
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading = false;
  userType: string = 'doctor'; // Default to doctor

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
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
      await this.presentToast('Veuillez remplir tous les champs correctement', 'danger');
      return;
    }

    this.isLoading = true;

    try {
      const response = await firstValueFrom(
        this.authService.login(
          this.loginForm.value.email,
          this.loginForm.value.password,
          this.userType
        )
      );

      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token || '');
      this.authService.setUserType(this.userType);

      await this.presentToast('Connexion réussie', 'success');

      if (this.userType === 'doctor') {
        this.router.navigate(['/profile-medecin']);
      } else {
        this.router.navigate(['/userprofile']);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.error?.error || 'Échec de la connexion. Vérifiez vos identifiants.';
      await this.presentToast(errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  goToPage(page: string) {
    this.router.navigateByUrl('/' + page);
  }
}