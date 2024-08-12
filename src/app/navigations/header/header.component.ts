import { Component, Inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, SidebarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  user_uuid = '';
  user_name = '';
  role_code = '';

  today: Date = new Date();
  day: string;
  date: string;

  isProfileDropdownOpen: boolean = false;
  public showSearch = false;

  private apiUrl: string;

  constructor(
    private cookieService: CookieService,
    private router: Router,
    @Inject('apiUrl') apiUrl: string
  ) {
    this.apiUrl = apiUrl;
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.isProfileDropdownOpen = false;
      }
    });
    const today = new Date();

    // Format untuk hari dalam minggu
    this.day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today);

    // Format untuk tanggal
    this.date = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(today);
  }

  ngOnInit() {
    this.fetchProfileData();
  }

  fetchProfileData() {
    const token = this.cookieService.get('userToken');

    axios
      .get(`${this.apiUrl}/auth/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        this.user_uuid = response.data.user_uuid;
        this.user_name = response.data.user_name;
        this.role_code = response.data.role_code;
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  onLogout() {
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performLogout();
      }
    });
  }

  performLogout() {
    const token = this.cookieService.get('userToken');
    axios
      .post(
        `${this.apiUrl}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        this.cookieService.delete('userToken');
        console.log(response.data.message);
        Swal.fire({
          title: 'Success',
          text: 'Logout Berhasil',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        this.router.navigateByUrl('/login');
      })
      .catch((error) => {
        if (error.response.status === 401) {
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
