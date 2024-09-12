import { Component, OnInit, Inject, HostListener } from '@angular/core';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
// import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { ApplicationService } from '../../services/application/application.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Application {
  application_uuid: string;
  application_order: number;
  application_code: string;
  application_title: string;
  application_description: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  deleted_by: string;
  deleted_at: string;
}

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './application.component.html',
  styleUrl: './application.component.css',
})
export class ApplicationComponent implements OnInit {

  popoverIndex: number | null = null;
  
  searchText: string = '';

  application_uuid: string = '';
  application_code: string = '';
  application_title: string = '';
  application_description: string = '';
  role_code: any;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;

  constructor(
    private cookieService: CookieService,
    public applicationService: ApplicationService,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  dataListApplication: Application[] = [];

  ngOnInit(): void {
    this.fetchProfileData();
    this.fetchDataApplication();
  }

  matchesSearch(item: Application): boolean {
    const searchLowerCase = this.searchText.toLowerCase();
    return (
      item.application_code.toLowerCase().includes(searchLowerCase) ||
      item.application_title.toLowerCase().includes(searchLowerCase) ||
      item.application_description.toLowerCase().includes(searchLowerCase)
    );
  }

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
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchDataApplication(): void {
    axios
      .get(`${this.apiUrl}/application/all`)
      .then((response) => {
        this.dataListApplication = response.data;
        this.applicationService.updateDataListApplication(
          this.dataListApplication
        );
      })
      .catch((error) => {
        if (error.response.status === 500) {
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
    this.application_code = '';
    this.application_title = '';
    this.application_description = '';
    // console.log('hai');
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addApplication() {
    const token = this.cookieService.get('userToken');

    axios
      .post(
        `${this.apiUrl}/superadmin/application/add`,
        {
          application_code: this.application_code,
          application_title: this.application_title,
          application_description: this.application_description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        // $('#addApplicationModal').modal('hide');
        this.application_code = '';
        this.application_title = '';
        this.application_description = '';
        this.fetchDataApplication();
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

  openEditModal(applicationUuid: string): void {
    axios
      .get(`${this.apiUrl}/application/${applicationUuid}`)
      .then((response) => {
        const applicationData = response.data;
        console.log(applicationData);
        this.application_uuid = applicationData.application_uuid;
        this.application_code = applicationData.application_code;
        this.application_title = applicationData.application_title;
        this.application_description = applicationData.application_description;

        this.isModalEditOpen = true;
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

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateApplication(): void {
    const token = this.cookieService.get('userToken');
    const applicationUuid = this.application_uuid;

    axios
      .put(
        `${this.apiUrl}/superadmin/application/update/${applicationUuid}`,
        {
          application_code: this.application_code,
          application_title: this.application_title,
          application_description: this.application_description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataApplication();
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        // $('#editApplicationModal').modal('hide');
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
    this.isModalEditOpen = false;
  }

  onDeleteApplication(application_uuid: string): void {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Anda yakin ingin menghapus Appication ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteApplication(application_uuid);
      }
    });
  }

  performDeleteApplication(application_uuid: string): void {
    const token = this.cookieService.get('userToken');

    axios
      .put(
        `${this.apiUrl}/superadmin/application/delete/${application_uuid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataApplication();
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

export { Application };
