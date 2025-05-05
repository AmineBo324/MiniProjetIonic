import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading = false;

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
      const result = await this.authService.login({
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      });  

      if (result.success) {
        await this.presentToast('Connexion réussie', 'success');
        if (result.userType === 'doctor') {
          this.router.navigate(['/profile-medecin']);
        } else if (result.userType === 'patient') {
          this.router.navigate(['/userprofile']);
        }
      } else {
        await this.presentToast('Échec de la connexion. Vérifiez vos identifiants.', 'danger');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.error?.error || 'Échec de la connexion. Veuillez réessayer.';
      await this.presentToast(errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  goToPage(page: string) {
    this.router.navigateByUrl('/' + page);
  }
}