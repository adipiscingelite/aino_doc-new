import { Component, Inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-tes',
  standalone: true,
  imports: [],
  templateUrl: './tes.component.html',
  styleUrl: './tes.component.css'
})
export class TesComponent implements OnInit {
  
  constructor(
    private cookieService: CookieService,
    // private fb: FormBuilder,
    // public formDaService: FormDaService,
    // private datePipe: DatePipe,
    // private pdfService: PdfGenerationService,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit(): void {
    this.apalah
  }

  apalah() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        // this.dataListUserFormDA = response.data;
        console.log('wirrrrrrrrrr',response);
        
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }
}
