import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionPatientsPage } from './gestion-patients.page';

describe('GestionPatientsPage', () => {
  let component: GestionPatientsPage;
  let fixture: ComponentFixture<GestionPatientsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionPatientsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
