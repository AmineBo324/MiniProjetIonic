import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileMedecinPage } from './profile-medecin.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileMedecinPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileMedecinPageRoutingModule {}
