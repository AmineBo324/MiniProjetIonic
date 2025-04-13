import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionMedecinsPage } from './gestion-medecins.page';

describe('GestionMedecinsPage', () => {
  let component: GestionMedecinsPage;
  let fixture: ComponentFixture<GestionMedecinsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionMedecinsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
