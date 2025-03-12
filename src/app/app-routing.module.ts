import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login.page';
import { AppointmentPage } from './appointment/appointment.page';
import {GestionMedecinsPage} from './gestion-medecins/gestion-medecins.page'
const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path : 'appointment',
    component : AppointmentPage
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  },

  {
    path: 'gestion-medecins',
    component : GestionMedecinsPage  
  },
  {
    path: 'gestion-patients',
    loadChildren: () => import('./gestion-patients/gestion-patients.module').then( m => m.GestionPatientsPageModule)
  },
 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
