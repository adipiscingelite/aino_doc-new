import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import axios, { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private apiUrl: string;

  constructor(private router: Router, private cookieService: CookieService) {
    this.apiUrl = environment.apiUrl;
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const token = this.cookieService.get('userToken');
    console.log('Token mentah:', token);

    if (token) {
      try {
        // Verifikasi token dengan melakukan request ke endpoint validasi
        const response = await axios.get(`${this.apiUrl}/auth/my/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Jika request berhasil, berarti token valid
        console.log('Token valid:', response.data);
        return true;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          // Token tidak valid, hapus semua cookies dan arahkan ke halaman login
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
            localStorage.setItem('redirectUrl', state.url); // Simpan URL yang diminta sebelum login
            this.router.navigate(['/login']);
          });
        } else {
          // Tangani error lainnya
          console.error('Error during token validation:', error);
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
    } else {
      // Tidak ada token, simpan URL dan arahkan ke halaman login
      localStorage.setItem('redirectUrl', state.url); // Simpan URL yang diminta sebelum login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
