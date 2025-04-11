import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import axios, { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private apiUrl: string;

  constructor(private router: Router, private cookieService: CookieService) {
    this.apiUrl = environment.apiUrl;
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const token = this.cookieService.get('userToken');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const response = await axios.get(`${this.apiUrl}/auth/my/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userDivision = response.data.division_code; // Ganti dari role_code ke division_code
      const allowedDivisions = ['GA', 'ITS']; // Hanya GA & ITS yang diizinkan

      if (!allowedDivisions.includes(userDivision)) {
        Swal.fire({
          title: 'Access Denied',
          text: 'You do not have permission to access this page.',
          icon: 'error',
          timer: 1500,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/dashboard']); // 🔹 Redirect ke /dashboard
        });
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        this.cookieService.deleteAll();
        Swal.fire({
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
          icon: 'warning',
          timer: 1000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/login']);
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'An unexpected error occurred. Please try again later.',
          icon: 'error',
          timer: 1000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      }
      return false;
    }
  }
}
