import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { DocumentService } from '../../services/document/document.service';
import Swal from 'sweetalert2';
import axios from 'axios';

interface documents {
  document_uuid: string;
  document_code: string;
  document_name: string;
}

@Component({
  selector: 'app-document-control',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './document-control.component.html',
  styleUrl: './document-control.component.css',
})
export class DocumentControlComponent implements OnInit {

  popoverIndex: number | null = null;
  
  searchText: string = '';

  document_uuid: string = '';
  document_code: string = '';
  document_name: string = '';
  user_uuid: any;
  user_name: any;
  role_code: any;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;

  constructor(
    private cookieService: CookieService,
    public documentService: DocumentService,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit(): void {
    this.fetchDataDoc();
    this.profileData();
  }

  dataListDoc: documents[] = [];

  matchesSearch(item: documents): boolean {
    const searchLowerCase = this.searchText.toLowerCase();
    return (
      item.document_code.toLowerCase().includes(searchLowerCase) ||
      item.document_name.toLowerCase().includes(searchLowerCase)
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
        console.log(response);
        this.user_uuid = response.data.user_uuid;
        this.user_name = response.data.user_name;
        this.role_code = response.data.role_code;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchDataDoc(): void {
    axios
      .get(`${environment.apiUrl2}/document`)
      .then((response) => {
        this.dataListDoc = response.data;
        this.documentService.updateDataListDoc(this.dataListDoc);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        } else if (error.response.status === 404) {
          console.log(error.response.data.message);
        }
      });
  }

  togglePopover(event: Event, index: number): void {
    event.stopPropagation(); // Menghentikan event bubbling
    if (this.popoverIndex === index) {
      this.popoverIndex = null; // Tutup popover jika diklik lagi
    } else {
      this.popoverIndex = index; // Buka popover untuk baris ini
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

  handleAction(action: string, item: any): void {
    // console.log(Handling ${action} for:, item);
    this.closePopover();
  }

  openAddModal() {
    this.isModalAddOpen = true;
    this.document_code = '';
    this.document_name = '';
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addDocument() {
    const token = this.cookieService.get('userToken');
    axios
      .post(
        `${environment.apiUrl2}/superadmin/document/add`,
        {
          document_code: this.document_code,
          document_name: this.document_name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataDoc();
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        if (
          error.response.status === 400 ||
          error.response.status === 422 ||
          error.response.status === 500
        ) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Terjadi kesalahan',
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      });
    this.isModalAddOpen = false;
  }

  openEditModal(documentUuid: string): void {
    axios
      .get(`${environment.apiUrl2}/document/` + documentUuid)
      .then((response) => {
        // console.log(response.data);
        this.isModalEditOpen = true;
        const documentData = response.data;
        this.document_uuid = documentData.document_uuid;
        this.document_code = documentData.document_code;
        this.document_name = documentData.document_name;
      })
      .catch((error) => {
        if (error.response.status === 500 || error.response.status === 404) {
          console.log(error.response.data.message);
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        } else
          Swal.fire({
            title: 'Error',
            text: 'Terjadi kesalahan',
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
      });
    this.isModalAddOpen = false;
  }

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateDocument(): void {
    const token = this.cookieService.get('userToken');
    const documentUuid = this.document_uuid;

    axios
      .put(
        `${environment.apiUrl2}/superadmin/document/update/${documentUuid}`,
        {
          document_code: this.document_code,
          document_name: this.document_name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataDoc();
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        if (
          error.response.status === 400 ||
          error.response.status === 422 ||
          error.response.status === 404 ||
          error.response.status === 500
        ) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Terjadi kesalahan',
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      });
    this.isModalEditOpen = false;
  }

  onDeleteDocument(document_uuid: string): void {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Anda yakin ingin menghapus Docuemnt ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteDocument(document_uuid);
      }
    });
  }

  performDeleteDocument(document_uuid: string): void {
    const token = this.cookieService.get('userToken');

    axios
      .put(
        `${environment.apiUrl2}/superadmin/document/delete/${document_uuid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataDoc();
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
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

export { documents };
