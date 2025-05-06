import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ProfileMedecinPage } from './profile-medecin/profile-medecin.page';

import { LoginPage } from './login/login.page';
import { AppointmentPage } from './appointment/appointment.page';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)

  },
  {
    path: 'appointment/:email',
    component : AppointmentPage
  },
  {
    path: 'doctorlist',
    loadChildren: () => import('./doctorlist/doctorlist.module').then( m => m.DoctorlistPageModule)
  },
  {
    path: 'accueil',
    loadChildren: () => import('./accueil/accueil.module').then( m => m.AccueilPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'userprofile',
    loadChildren: () => import('./userprofile/userprofile.module').then( m => m.UserprofilePageModule)
  }
,
{ path: 'profile-medecin', component: ProfileMedecinPage },  {
    path: 'appointment-request',
    loadChildren: () => import('./appointment-request/appointment-request.module').then( m => m.AppointmentRequestPageModule)
  },
  {
    path: 'future-appointments',
    loadChildren: () => import('./future-appointments/future-appointments.module').then( m => m.FutureAppointmentsPageModule)
  },
  {
    path: 'consultations-history',
    loadChildren: () => import('./consultations-history/consultations-history.module').then( m => m.ConsultationsHistoryPageModule)
  },





]
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
