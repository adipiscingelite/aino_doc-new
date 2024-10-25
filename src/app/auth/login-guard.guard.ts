import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  private apiUrl: string;

  constructor(private router: Router, private cookieService: CookieService) {
    this.apiUrl = environment.apiUrl;
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const token = this.cookieService.get('userToken');

    if (token) {
      try {
        const response = await axios.get(`${this.apiUrl}/auth/my/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Jika responsenya 200, redirect ke dashboard
        if (response.status === 200) {
          this.router.navigate(['/dashboard']);
          return false; // Mencegah akses ke route yang dijaga
        }
      } catch (error) {
        // Tangani error jika permintaan gagal
        console.error('Error fetching profile:', error);
      }
    }

    return true; 
  }
}
