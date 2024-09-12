import { Component, Inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  user: any = {};

  constructor(
    private cookieService: CookieService,
    // private router: Router,
    @Inject('apiUrl') private apiUrl: string
  ) {}

  ngOnInit(): void {
    this.fetchProfileData();
    console.log('ngOnInit executed');
  }
  fetchProfileData() {
    const token = this.cookieService.get('userToken');
    console.log('Token:', token);

    axios
      .get(`${this.apiUrl}/auth/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const profileData = response.data;
        const userUuid = profileData.user_uuid;
        this.fetchUserData(userUuid, token);
        console.log('my profile', response);
        
      })
      .catch((error) => {
        if (error.response && error.response.status === 500) {
          console.log(error.response.data.message);
          
        }
      });
  }

  fetchUserData(userUuid: string, token: string) {
    axios
      .get(`${this.apiUrl}/user/${userUuid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        this.user = response.data;
        console.log('pppka',this.user);
      })
      .catch((error) => {
        if (error.response && error.response.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }
}
