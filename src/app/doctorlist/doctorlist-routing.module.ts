import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DoctorlistPage } from './doctorlist.page';

const routes: Routes = [
  {
    path: '',
    component: DoctorlistPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorlistPageRoutingModule {}
