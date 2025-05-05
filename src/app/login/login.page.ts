import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../auth.service';
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

    private authService: AuthService,

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
      await this.presentToast('Veuillez remplir tous les champs correctement', 'danger');



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

    try {
      const response: any = await this.http.post('http://localhost:5000/patient/login', {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      }).toPromise();

      // Store the token and user data (you might want to use a service for this)
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('patient', JSON.stringify(response.patient));
      console.log(response)

      await this.presentToast('Login successful','success');
      this.router.navigate(['/accueil']);
      
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.error?.error || 'Login failed. Please try again.';
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
}}}