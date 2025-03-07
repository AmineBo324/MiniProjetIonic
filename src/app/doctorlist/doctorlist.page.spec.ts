import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorlistPage } from './doctorlist.page';

describe('DoctorlistPage', () => {
  let component: DoctorlistPage;
  let fixture: ComponentFixture<DoctorlistPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorlistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
