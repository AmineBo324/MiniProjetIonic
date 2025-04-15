import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { LoginPage } from './login/login.page';
import { AppointmentPage } from './appointment/appointment.page';


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
    path: 'appointment/:email',
    component : AppointmentPage
  },
  {
    path: 'doctorlist',
    loadChildren: () => import('./doctorlist/doctorlist.module').then( m => m.DoctorlistPageModule)
  },  {
    path: 'accueil',
    loadChildren: () => import('./accueil/accueil.module').then( m => m.AccueilPageModule)
  }


]
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
