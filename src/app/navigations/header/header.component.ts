import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import axios, { all } from 'axios';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { environment } from '../../../environments/environment';

interface Notification {
  is_sign: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, SidebarComponent, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  isSidebarVisible: boolean = false;

  @Output() sidebarVisibilityChange = new EventEmitter<boolean>();

  isSidebarOpen = false;
  isMenuOpen: boolean = false;

  user_uuid = '';
  user_name = '';
  role_code = '';
  division_code = '';

  notifications: Notification[] = [];
  allSigned: boolean = true;

  today: Date = new Date();
  day: string;
  date: string;

  is_guest: boolean = false;
  isProfileDropdownOpen = false;

  public showSearch = false;

  private apiUrl: string;

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject('apiUrl') apiUrl: string
  ) {
    this.apiUrl = apiUrl;
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.isProfileDropdownOpen = false;
      }
    });
    const today = new Date();

    this.day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
      today
    );

    this.date = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(today);
  }

  ngOnInit() {
    this.fetchProfileData();
    if (this.role_code != 'SA') {
      this.fetchNotification();
    }
    this.checkIfGuest();

    setInterval(() => {
      this.fetchNotification();
    }, 30000);
  }

  openSidebar() {
    this.isSidebarVisible = true;
    this.sidebarVisibilityChange.emit(this.isSidebarVisible);
  }

  checkIfGuest(): void {
    const url = this.route.snapshot.url.join('/');
    this.is_guest = url.includes('guest');
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
        this.division_code = response.data.division_code;
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  fetchNotification() {
    const token = this.cookieService.get('userToken');
    axios
      .get(`${environment.apiUrl2}/api/my/notif`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const notifications = response.data as Notification[];
        this.notifications = notifications;

        this.allSigned = this.notifications.every(
          (notification) => notification.is_sign === true
        );

        // if (this.allSigned) {
        //   console.log('All signed');
        // } else {
        //   console.log('Not all signed');
        // }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 500) {
            console.log(error.response.data);
          } else {
            console.log(error.response.data);
          }
        }
      });
  }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
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
