import { Component, OnInit, Inject, HostListener } from '@angular/core';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
// import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { DivisionService } from '../../services/division/division.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Division {
  division_uuid: string;
  division_order: number;
  division_code: string;
  division_title: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  deleted_by: string;
  deleted_at: string;
}

@Component({
  selector: 'app-division',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './division.component.html',
  styleUrl: './division.component.css',
})
export class DivisionComponent implements OnInit {

  popoverIndex: number | null = null;
  
  searchText: string = '';

  division_uuid: string = '';
  division_code: string = '';
  division_title: string = '';
  user_uuid: any;
  user_name: any;
  role_code: any;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;

  constructor(
    private cookieService: CookieService,
    public divisionService: DivisionService,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  dataListDivision: Division[] = [];

  ngOnInit(): void {
    this.fetchDataDivision();
    this.profileData();
  }

  matchesSearch(item: Division): boolean {
    const searchLowerCase = this.searchText.toLowerCase();
    return (
      item.division_code.toLowerCase().includes(searchLowerCase) ||
      item.division_title.toLowerCase().includes(searchLowerCase)
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

  fetchDataDivision(): void {
    axios
      .get(`${this.apiUrl}/division/all`)
      .then((response) => {
        this.dataListDivision = response.data;
        this.divisionService.updateDataListDivision(this.dataListDivision);
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
    this.division_code = '';
    this.division_title = '';
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addDivision() {
    const token = this.cookieService.get('userToken');

    axios
      .post(
        `${this.apiUrl}/superadmin/division/add`,
        {
          division_code: this.division_code,
          division_title: this.division_title,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataDivision();
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        // $('#addDivisionModal').modal('hide');
        this.division_code = '';
        this.division_title = '';
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

  openEditModal(divisionUuid: string): void {
    axios
      .get(`${this.apiUrl}/division/` + divisionUuid)
      .then((response) => {
        const divisionData = response.data;
        console.log(divisionData);
        this.division_uuid = divisionData.division_uuid;
        this.division_code = divisionData.division_code;
        this.division_title = divisionData.division_title;

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
          console.log(error.response);
        }
      });
    this.isModalEditOpen = false;
  }

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateDivision(): void {
    const token = this.cookieService.get('userToken');
    const divisionUuid = this.division_uuid;

    axios
      .put(
        `${this.apiUrl}/superadmin/division/update/${divisionUuid}`,
        {
          division_code: this.division_code,
          division_title: this.division_title,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataDivision();
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

  onDeleteDivision(division_uuid: string): void {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Anda yakin ingin menghapus Divisi ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteDivision(division_uuid);
      }
    });
  }

  performDeleteDivision(division_uuid: string): void {
    const token = this.cookieService.get('userToken');

    axios
      .put(
        `${this.apiUrl}/superadmin/division/delete/${division_uuid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataDivision();
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

export { Division };
