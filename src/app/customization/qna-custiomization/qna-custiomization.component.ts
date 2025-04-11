import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import axios from 'axios';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';

interface QnA {
  qna_uuid: string;
  question: string;
  answer: string;
  created_at: string;
  created_by: string;
}

@Component({
  selector: 'app-qna-custiomization',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './qna-custiomization.component.html',
  styleUrl: './qna-custiomization.component.css',
})
export class QnaCustiomizationComponent implements OnInit {
  searchText: string = '';

  role_code: any;

  qna_uuid: string = '';
  question: string = '';
  answer: string = '';
  created_at: string = '';
  created_by: string = '';

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;

  dataListQnA: QnA[] = [];

  constructor(
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit(): void {
    this.profileData();
    this.fetchAllQnA();
  }

  matchesSearch(item: QnA): boolean {
    const searchText = this.searchText.toLowerCase();

    return (
      item.question.toLowerCase().includes(searchText) ||
      item.answer.toLowerCase().includes(searchText)
    );
  }

  profileData(): void {
    const token = this.cookieService.get('userToken');

    axios
      .get(`${this.apiUrl}/auth/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        this.role_code = response.data.role_code;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchAllQnA(): void {
    axios
      .get(`${environment.apiUrl2}/qna`)
      .then((response) => {
        this.dataListQnA = response.data.data;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  popoverIndex: number | null = null;

  togglePopover(event: Event, index: number): void {
    event.stopPropagation();
    if (this.popoverIndex === index) {
      this.popoverIndex = null;
    } else {
      this.popoverIndex = index;
    }
  }

  closePopover() {
    this.popoverIndex = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.popoverIndex !== null) {
      const clickedElement = event.target as HTMLElement;
      const popoverElement = document.querySelector('.popover-content');
      if (popoverElement && !popoverElement.contains(clickedElement)) {
        this.closePopover();
      }
    }
  }

  openAddModal() {
    this.qna_uuid = '';
    this.question = '';
    this.answer = '';

    this.isModalAddOpen = true;
  }
  closeAddModal() {
    this.isModalAddOpen = false;
  }
  addQnA() {
    const data = {
      question: this.question,
      answer: this.answer,
    };

    axios
      .post(`${environment.apiUrl2}/superadmin/qna/add`, data, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: response.data.message,
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchAllQnA();
        this.isModalAddOpen = false;
      })
      .catch((error) => {
        {
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
  openEditModal(qna_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/superadmin/qna/${qna_uuid}`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.isModalEditOpen = true;
        const editData = response.data.data;

        this.qna_uuid = editData.qna_uuid;
        this.question = editData.question;
        this.answer = editData.answer;

        this.isModalEditOpen = true;
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      });
  }
  closeEditModal() {
    this.isModalEditOpen = false;
  }
  updateQnA() {
    const data = {
      question: this.question,
      answer: this.answer,
    };

    axios
      .put(
        `${environment.apiUrl2}/superadmin/qna/update/${this.qna_uuid}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
          },
        }
      )
      .then((response) => {
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchAllQnA();
        this.isModalEditOpen = false;
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      });
  }
  onDeleteQnA(qna_uuid: string) {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Anda yakin ingin menghapus data ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteFormHA(qna_uuid);
      }
    });
  }

  performDeleteFormHA(qna_uuid: string) {
    axios
      .delete(`${environment.apiUrl2}/superadmin/qna/delete/${qna_uuid}`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchAllQnA();
      })
      .catch((error) => {
        if (error.response.status === 404 || error.response.status === 500) {
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
}
