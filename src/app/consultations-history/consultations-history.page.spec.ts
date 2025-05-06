import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultationsHistoryPage } from './consultations-history.page';

describe('ConsultationsHistoryPage', () => {
  let component: ConsultationsHistoryPage;
  let fixture: ComponentFixture<ConsultationsHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationsHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
