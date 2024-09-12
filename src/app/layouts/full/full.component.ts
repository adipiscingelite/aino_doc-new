import { Component, OnInit,Inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../navigations/sidebar/sidebar.component';
import { HeaderComponent } from '../../navigations/header/header.component';
import axios from 'axios';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [RouterLink, CommonModule,RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './full.component.html',
  styleUrl: './full.component.css'
})
export class FullComponent implements OnInit {
  
  constructor(private router: Router, private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string) {}
    

  tour: boolean = true; 

  ngOnInit(): void {
    this.fetchProfileData();
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
        this.tour = response.data.tour.toLowerCase() === 'true';
      console.log('tour:', this.tour);
      })
      .catch((error) => {
        if (error.response && error.response.status === 500) {
          console.log(error.response.data.message);
          
        }
      });
  }
}
