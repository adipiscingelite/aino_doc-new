import { Component, Inject } from '@angular/core';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginData = {
    user_email: '',
    user_password: '12345678',
  };

  private apiUrl: string;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    @Inject('apiUrl') apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }
  redirectUrl: any = localStorage.getItem('redirectUrl');

  onLogin() {
    axios
      .post(`${this.apiUrl}/login`, this.loginData)
      .then((response) => {
        this.cookieService.set('userToken', response.data.token);

        if (this.redirectUrl) {
          this.router.navigateByUrl(this.redirectUrl);
          localStorage.removeItem('redirectUrl');
        } else {
          this.router.navigateByUrl('/dashboard');
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        } else if (error.response.status === 500) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      });
  }

  forgor() {
    Swal.fire({
      title: 'Info',
      text: 'Fitur masih dalam pengembangan',
      icon: 'info',
      timer: 2000,
      timerProgressBar: true,
      showCancelButton: false,
      showConfirmButton: false,
    });
  }
}
