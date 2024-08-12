import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router, private cookieService: CookieService) {}

  dataDALength: any;
  dataITCMLength: any;
  dataBALength: any;
  // topcards: topcard[];
  dataListAllFormDA: any[] = [];
  dataListFormITCM: any[] = [];
  dataListAllBA: any[] = [];
p: any;
  // constructor() {
    
  // }

  ngOnInit(): void {
    this.fetchDataFormDA();
    this.fetchDataFormITCM();
    this.fetchAllDataBA();
  }

  fetchDataFormDA(): void {
    axios
      .get(`${environment.apiUrl2}/dampak/analisa`)
      .then((response) => {
        if (response.data) {
          this.dataListAllFormDA = response.data;
          console.log(response.data);
          this.dataDALength = this.dataListAllFormDA.length;
        } else {
          console.log('Data is null');
          this.dataDALength = 0;
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 500) {
            console.log(error.response.data.message);
          }
        } else {
          console.error(error);
        }
      });
  }

  fetchDataFormITCM(): void {
    axios
      .get(`${environment.apiUrl2}/form/itcm`)
      .then((response) => {
        if (response.data) {
          this.dataListFormITCM = response.data;
          console.log(response.data);
          this.dataITCMLength = this.dataListFormITCM.length;
        } else {
          console.log('Data is null');
          this.dataITCMLength = 0;
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 500) {
            console.log(error.response.data.message);
          } else if (error.response.status === 404) {
            console.log(error.response.data.message);
          }
        } else {
          console.error(error);
        }
      });
  }

  fetchAllDataBA(): void {
    axios
      .get(`${environment.apiUrl2}/form/ba`)
      .then((response) => {
        if (response.data) {
          this.dataListAllBA = response.data;
          console.log(response.data);
          this.dataBALength = this.dataListAllBA.length;
        } else {
          console.log('Data is null');
          this.dataBALength = 0;
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 500) {
            console.log(error.response.data.message);
          }
        } else {
          console.error(error);
        }
      });
  }

  clearToken() {
    // Hapus token dari localStorage atau cookies
    // this.cookieService.delete('accessToken'); // Jika menggunakan cookies
    // localStorage.removeItem('accessToken'); // Jika menggunakan localStorage
    const token = this.cookieService.get('userToken');
    console.log(token);
    this.cookieService.delete('userToken')
    
    // Arahkan pengguna ke halaman login setelah menghapus token
    // this.router.navigate(['/login']);
  }
}
