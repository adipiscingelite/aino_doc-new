import { Component, OnInit, Inject } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { TourGuideService } from '../services/shepherd/shepherd.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  
  constructor(
    private router: Router,
    private cookieService: CookieService,
    // private tourGuideService: TourGuideService, 
    @Inject('apiUrl') private apiUrl: string
  ) {}

  user: any = {};
  // private tour: any;

  // user
  dataDALength: any;
  dataITCMLength: any;
  dataBALength: any;
  dataHALength: any;

  dataSignatureITCMLength: any;
  dataSignatureDALength: any;
  dataSignatureBALength: any;
  dataSignatureHALength: any;

  dataListAllFormDA: any[] = [];
  dataListFormITCM: any[] = [];
  dataListAllBA: any[] = [];
  dataListAllHA: any[] = [];

  dataListSignatureITCM: any[] = [];
  dataListSignatureDA: any[] = [];
  dataListSignatureBA: any[] = [];
  dataListSignatureHA: any[] = [];
  p: any;

  ngOnInit(): void {
    
    this.fetchDataFormDA();
    this.fetchDataFormITCM();
    this.fetchAllDataBA();
    this.fetchAllDataHA();

    this.fetchITCMSignature();
    this.fetchDASignature();
    this.fetchBASignature();
    this.fetchHASignature();
  }

  // startTour() {
  //   this.tourGuideService.startTour(); // Mulai tur saat tombol diklik
  // }

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
        console.log('tour, ', response.data.tour);
      })
      .catch((error) => {
        if (error.response && error.response.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  fetchDataFormDA(): void {
    axios
      .get(`${environment.apiUrl2}/api/my/form/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
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
      .get(`${environment.apiUrl2}/api/my/form/itcm`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
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
      .get(`${environment.apiUrl2}/api/my/form/ba`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
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

  fetchAllDataHA(): void {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ha`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListAllHA = response.data;
          console.log('respoon ha', response);

          console.log(response.data);
          this.dataHALength = this.dataListAllHA.length;
        } else {
          console.log('Data is null');
          this.dataHALength = 0;
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

  fetchITCMSignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/itcm`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListSignatureITCM = response.data.filter(
            (item: any) => item.form_status === 'Published'
          );
          this.dataSignatureITCMLength = this.dataListSignatureITCM.length;
        } else {
          console.log('Data ITCM is null');
          this.dataSignatureITCMLength = 0;
        }
      })
      .catch((error) => {
        console.log('Error fetching ITCM signatures:', error);
        this.dataSignatureITCMLength = 0;
      });
  }

  fetchDASignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListSignatureDA = response.data.filter(
            (item: any) => item.form_status === 'Published'
          );
          this.dataSignatureDALength = this.dataListSignatureDA.length;
        } else {
          console.log('Data DA is null');
          this.dataSignatureDALength = 0;
        }
      })
      .catch((error) => {
        console.log('Error fetching DA signatures:', error);
        this.dataSignatureDALength = 0;
      });
  }

  fetchBASignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/ba`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListSignatureBA = response.data.filter(
            (item: any) => item.form_status === 'Published'
          );
          this.dataSignatureBALength = this.dataListSignatureBA.length;
        } else {
          console.log('Data BA is null');
          this.dataSignatureBALength = 0;
        }
      })
      .catch((error) => {
        console.log('Error fetching BA signatures:', error);
        this.dataSignatureBALength = 0;
      });
  }

  fetchHASignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/ha`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListSignatureHA = response.data.filter(
            (item: any) => item.form_status === 'Published'
          );
          this.dataSignatureHALength = this.dataListSignatureHA.length;
        } else {
          console.log('Data HA is null');
          this.dataSignatureHALength = 0;
        }
      })
      .catch((error) => {
        console.log('Error fetching HA signatures:', error);
        this.dataSignatureHALength = 0;
      });
  }
}
