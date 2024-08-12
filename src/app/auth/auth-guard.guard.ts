// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  token: any;
  
p: any;
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.cookieService.get('userToken')) {
      
      this.token = this.cookieService.get('userToken');
      console.log('wirrrrrrrrrr',this.token);
      
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  clearToken() {
    // Hapus token dari localStorage atau cookies
    // this.cookieService.delete('accessToken'); // Jika menggunakan cookies
    // localStorage.removeItem('accessToken'); // Jika menggunakan localStorage
    const token = this.cookieService.get('userToken');
    console.log(token);
    this.cookieService.delete('userToken')
    this.cookieService.delete('userToken')
    this.cookieService.delete('userToken')
    
    // Arahkan pengguna ke halaman login setelah menghapus token
    // this.router.navigate(['/login']);
  }
}
