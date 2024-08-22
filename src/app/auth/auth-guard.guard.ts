// // src/app/guards/auth.guard.ts
// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// import { CookieService } from 'ngx-cookie-service';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard implements CanActivate {
//   token: any;
  
// p: any;
//   constructor(private router: Router, private cookieService: CookieService) {}

//   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
//     if (this.cookieService.get('userToken')) {
      
//       this.token = this.cookieService.get('userToken');
//       console.log('wirrrrrrrrrr',this.token);
      
//       return true;
//     } else {
//       this.router.navigate(['/login']);
//       return false;
//     }
//   }

//   clearToken() {
//     // Hapus token dari localStorage atau cookies
//     // this.cookieService.delete('accessToken'); // Jika menggunakan cookies
//     // localStorage.removeItem('accessToken'); // Jika menggunakan localStorage
//     const token = this.cookieService.get('userToken');
//     console.log(token);
//     // this.cookieService.delete('userToken')
//     // this.cookieService.delete('userToken')
//     // this.cookieService.delete('userToken')
    
//     // Arahkan pengguna ke halaman login setelah menghapus token
//     // this.router.navigate(['/login']);
//   }
// }

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
    this.apiUrl = environment.apiUrl 
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
      // Tidak ada token, akan diarahkan ke halaman login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
