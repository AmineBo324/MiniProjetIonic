import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
<<<<<<< HEAD
import { LoginPage } from './login/login.page';
import { AppointmentPage } from './appointment/appointment.page';
=======
>>>>>>> b2981863ac3f6ab189283967a5a86dcacaf06ac5

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
<<<<<<< HEAD
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
  }
=======
>>>>>>> b2981863ac3f6ab189283967a5a86dcacaf06ac5
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
