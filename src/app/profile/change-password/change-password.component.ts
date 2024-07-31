import { Component, Inject } from '@angular/core';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  old_password: string = '';
  new_password: string = '';
  confirm_password: string = '';
  showPassword: boolean = false;

  private apiUrl: string;

  constructor(
    private cookieService: CookieService,
    private router: Router,
    @Inject('apiUrl') apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  onChangePassword() {
    if (this.new_password !== this.confirm_password) {
      Swal.fire({
        title: 'Error',
        text: 'New Password and Confirm Password do not match',
        icon: 'error',
        timer: 2000,
        timerProgressBar: true,
        showCancelButton: false,
        showConfirmButton: false,
      });
      return;
    }  

    const token = this.cookieService.get('userToken');

    axios
      .put(
        `${this.apiUrl}/auth/change/password`,
        {
          old_password: this.old_password,
          new_password: this.new_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        // alert('Password berhasil diubah. Silakan login kembali.');
        this.cookieService.delete('userToken');
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        } else if (error.response.status === 401) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        } else if (error.response.status === 422) {
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
