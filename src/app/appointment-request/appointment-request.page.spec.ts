import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentRequestsPage } from './appointment-request.page';

describe('AppointmentRequestPage', () => {
  let component: AppointmentRequestsPage;
  let fixture: ComponentFixture<AppointmentRequestsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentRequestsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
