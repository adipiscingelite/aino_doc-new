import { Component,Inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';
import { ShepherdService } from '../../services/shepherd/shepherd.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent implements OnInit { 
  role_code = '';

  private apiUrl: string;

  constructor(
    private cookieService: CookieService,
    private shepherdService: ShepherdService,
    @Inject('apiUrl') apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit() {
    // this.initSidebarTour()

    this.fetchProfileData();    
  } 

  // initSidebarTour() {
  //   this.shepherdService.createTour('sidebarTour');

  //   this.shepherdService.addStep('sidebarTour', {
  //     id: 'sidebarIntro',
  //     text: 'This is the sidebar. Here you can navigate through different sections.',
  //     attachTo: { element: '#sidebar', on: 'right' },
  //     buttons: [
  //       {
  //         text: 'Next',
  //         action: this.shepherdService['tours']['sidebarTour'].next
  //       }
  //     ]
  //   });

  //   this.shepherdService.addStep('sidebarTour', {
  //     id: 'dashboardLink',
  //     text: 'Click here to go to the dashboard.',
  //     attachTo: { element: '#dashboardLink', on: 'right' },
  //     buttons: [
  //       {
  //         text: 'Done',
  //         action: () => {
  //           this.shepherdService.completeTour('sidebarTour');
  //           // Mulai tur di dashboard setelah tur sidebar selesai
  //           this.shepherdService.startTour('dashboardTour');
  //         }
  //       }
  //     ]
  //   });
  // }

  fetchProfileData(): void {
    const token = this.cookieService.get('userToken');

    axios
      .get(`${this.apiUrl}/auth/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        this.role_code = response.data.role_code;
        // console.log(this.role_code);
        
      })
      .catch((error) => {
        console.log(error);
      });
  }
} 
