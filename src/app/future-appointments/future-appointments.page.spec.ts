import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FutureAppointmentsPage } from './future-appointments.page';

describe('FutureAppointmentsPage', () => {
  let component: FutureAppointmentsPage;
  let fixture: ComponentFixture<FutureAppointmentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureAppointmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
