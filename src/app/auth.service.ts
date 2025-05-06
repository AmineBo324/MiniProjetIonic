import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000';
  private userType: string | null = null;
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string, userType: string): Observable<any> {
    const endpoint = userType === 'doctor' ? '/medecin/login' : '/patient/login';
    // Clear all user data before new login
    this.clearUserData();
    return this.http.post(`${this.apiUrl}${endpoint}`, { email, password }).pipe(
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Échec de la connexion'));
      })
    );
  }

  setUserType(userType: string) {
    this.userType = userType;
    localStorage.setItem('userType', userType);
  }

  getUserType(): string | null {
    return this.userType || localStorage.getItem('userType');
  }

  logout() {
    this.clearUserData();
    this.router.navigate(['/login']);
  }

  private clearUserData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userType');
    localStorage.removeItem('doctor');
    localStorage.removeItem('patient');
    this.userType = null;
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post(`${this.apiUrl}/refresh`, {}, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${refreshToken}`
      })
    }).pipe(
      switchMap((response: any) => {
        localStorage.setItem('auth_token', response.access_token);
        return of(response.access_token);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }

  handle401Error(request: any, next: any): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          request.headers = request.headers.set('Authorization', `Bearer ${token}`);
          return next.handle(request);
        }),
        catchError(error => {
          this.isRefreshing = false;
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          request.headers = request.headers.set('Authorization', `Bearer ${token}`);
          return next.handle(request);
        })
      );
    }
  }
}