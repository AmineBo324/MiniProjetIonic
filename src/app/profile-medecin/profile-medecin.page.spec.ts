import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileMedecinPage } from './profile-medecin.page';

describe('ProfileMedecinPage', () => {
  let component: ProfileMedecinPage;
  let fixture: ComponentFixture<ProfileMedecinPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileMedecinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
