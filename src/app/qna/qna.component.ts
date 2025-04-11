import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import axios from 'axios';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
interface QnA {
  qna_uuid: string;
  question: string;
  answer: string;
  created_at: string;
  created_by: string;
}

@Component({
  selector: 'app-qna',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './qna.component.html',
  styleUrl: './qna.component.css',
})
export class QnaComponent {
  qna_uuid: string = '';
  question: string = '';
  answer: string = '';
  created_at: string = '';
  created_by: string = '';

  dataListQnA: QnA[] = [];

  ngOnInit(): void {
    this.fetchAllQnA();
  }

  fetchAllQnA(): void {
    axios
      .get(`${environment.apiUrl2}/qna`)
      .then((response) => {
        console.log('respon', response);
        this.dataListQnA = response.data.data;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }
}
