import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  async login(credentials: { email: string; password: string }) {
    console.log('Attempting login with credentials:', credentials.email);

    // Try patient login
    try {
      console.log('Trying patient login at', `${this.apiUrl}/patient/login`);
      const patientResponse: any = await this.http
        .post(`${this.apiUrl}/patient/login`, credentials)
        .toPromise();
      console.log('Patient login response:', patientResponse);
      if (patientResponse.access_token) {
        localStorage.setItem('auth_token', patientResponse.access_token);
        localStorage.setItem('patient', JSON.stringify(patientResponse.patient));
        localStorage.setItem('userType', 'patient');
        console.log('Patient token stored:', patientResponse.access_token);
        return { success: true, userType: 'patient' };
      }
    } catch (patientError: any) {
      console.error('Patient login failed:', patientError.message, patientError.status);
    }

    // Try doctor login
    try {
      console.log('Trying doctor login at', `${this.apiUrl}/medecin/login`);
      const doctorResponse: any = await this.http
        .post(`${this.apiUrl}/medecin/login`, credentials)
        .toPromise();
      console.log('Doctor login response:', doctorResponse);
      if (doctorResponse.access_token) {
        localStorage.setItem('auth_token', doctorResponse.access_token);
        localStorage.setItem('doctor', JSON.stringify(doctorResponse.doctor));
        localStorage.setItem('userType', 'doctor');
        console.log('Doctor token stored:', doctorResponse.access_token);
        return { success: true, userType: 'doctor' };
      }
    } catch (doctorError: any) {
      console.error('Doctor login failed:', doctorError.message, doctorError.status);
      throw doctorError;
    }

    console.log('Both login attempts failed');
    return { success: false };
  }

  getUserType(): string | null {
    return localStorage.getItem('userType');
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('patient');
    localStorage.removeItem('doctor');
    localStorage.removeItem('userType');
  }
}