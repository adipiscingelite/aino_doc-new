import { Component, OnInit, Inject, HostListener } from '@angular/core';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { AccessGroupService } from '../../services/access-group/access-group.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface Role {
  role_uuid: string;
  role_order: number;
  role_code: string;
  role_title: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  deleted_by: string;
  deleted_at: string;
}

@Component({
  selector: 'app-access-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-group.component.html',
  styleUrl: './access-group.component.css',
})
export class AccessGroupComponent implements OnInit {

  popoverIndex: number | null = null;
  
  searchText: string = '';

  profileRoleCode: string = '';
  role_uuid: string = '';
  role_code: string = '';
  role_title: string = '';

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;

  constructor(
    private cookieService: CookieService,
    public AccessGroupService: AccessGroupService,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  dataListRole: Role[] = [];

  ngOnInit(): void {
    this.fetchDataRoleGroup();
    this.profileData();
  }

  matchesSearch(item: Role): boolean {
    const searchLowerCase = this.searchText.toLowerCase();
    return (
      item.role_code.toLowerCase().includes(searchLowerCase) ||
      item.role_title.toLowerCase().includes(searchLowerCase)
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
        // this.user_uuid = response.data.user_uuid;
        // this.user_name = response.data.user_name;
        this.profileRoleCode = response.data.role_code;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchDataRoleGroup(): void {
    axios
      .get(`${this.apiUrl}/role/all`)
      .then((response) => {
        this.dataListRole = response.data;
        this.AccessGroupService.updateDataListRole(this.dataListRole);
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
    this.role_code = '';
    this.role_title = '';
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addAccessGroup() {
    const token = this.cookieService.get('userToken');

    axios
      .post(
        `${this.apiUrl}/superadmin/role/add`,
        { role_code: this.role_code, role_title: this.role_title },
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
        // $('#addRoleModal').modal('hide');
        this.role_code = '';
        this.role_title = '';
        this.fetchDataRoleGroup();
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

  openEditModal(roleUuid: string): void {
    axios
      .get(`${this.apiUrl}/role/${roleUuid}`)
      .then((response) => {
        console.log(response);
        
        const roleData = response.data;
        this.role_uuid = roleData.role_uuid;
        this.role_code = roleData.role_code;
        this.role_title = roleData.role_title;

        this.isModalEditOpen = true;
      })
      .catch((error) => {
        if (error.response.status === 500 || error.response.status === 404) {
          console.log(error.response.data.message);
        }
      });
  }

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateAccessGroup(): void {
    const token = this.cookieService.get('userToken');
    const roleUuid = this.role_uuid;

    axios
      .put(
        `${this.apiUrl}/superadmin/role/update/${roleUuid}`,
        { role_code: this.role_code, role_title: this.role_title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataRoleGroup();
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
    this.isModalEditOpen = true;
  }

  onDeleteRoleGroup(role_uuid: string): void {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Anda yakin ingin menghapus App Role ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteRoleGroup(role_uuid);
      }
    });
  }

  performDeleteRoleGroup(role_uuid: string): void {
    const token = this.cookieService.get('userToken');

    axios
      .put(
        `${this.apiUrl}/superadmin/role/delete/${role_uuid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataRoleGroup();
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

export { Role };
