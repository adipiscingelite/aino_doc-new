import { Component, Inject } from '@angular/core';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
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

  onLogin() {
    console.log(this.loginData);
    console.log(this.apiUrl);

    axios
      .post(`${this.apiUrl}/login`, this.loginData)
      .then((response) => {
        console.log(response.data.message);
        this.cookieService.set('userToken', response.data.token);
        this.router.navigateByUrl('/dashboard');
      })
      .catch((error) => {
        if (error.response.status === 401) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
          });
        } else if (error.response.status === 500) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
          });
        }
      });
  }
}
