import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentUpdatedSource = new Subject<void>();
  appointmentUpdated = this.appointmentUpdatedSource.asObservable();

  notifyAppointmentUpdate() {
    this.appointmentUpdatedSource.next();
  }
}