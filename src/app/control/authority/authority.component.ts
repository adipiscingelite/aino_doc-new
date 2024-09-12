import { Component, OnInit, Inject, HostListener } from '@angular/core';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { AppRoleService } from '../../services/authority/authority.service';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

interface AppRole {
  application_role_uuid: string;
  application_title: string;
  role_title: string;
  created_by: string;
  updated_by: string;
  updated_at: string;
  deleted_by: string;
  deleted_at: string;
}

interface Application {
  application_uuid: string;
  application_title: string;
}

interface Role {
  role_uuid: string;
  role_title: string;
}

@Component({
  selector: 'app-authority',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './authority.component.html',
  styleUrl: './authority.component.css',
})
export class AuthorityComponent implements OnInit {

  popoverIndex: number | null = null;

  searchText: string = '';

  form!: FormGroup;

  dataListApplication: Application[] = [];
  dataListRole: Role[] = [];

  application_role_uuid: string = '';
  application_uuid: string = '';
  application_title: string = '';
  role_uuid: string = '';
  role_title: string = '';
  role_code: any;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;

  constructor(
    private cookieService: CookieService,
    public appRoleService: AppRoleService,
    @Inject('apiUrl') private apiUrl: string,
    private fb: FormBuilder
  ) {
    this.apiUrl = apiUrl;
  }

  dataListAppRole: AppRole[] = [];

  ngOnInit(): void {
    this.fetchDataAppRole();
    this.profileData();

    this.form = this.fb.group({
      application_uuid: [''],
      application_title: [''],
      role_uuid: [''],
      role_title: [''],
    });

    this.appData();
    this.roleData();
  }

  matchesSearch(item: AppRole): boolean {
    const searchLowerCase = this.searchText.toLowerCase();
    return (
      item.application_title.toLowerCase().includes(searchLowerCase) ||
      item.role_title.toLowerCase().includes(searchLowerCase)
    );
  }

  fetchDataAppRole(): void {
    axios
      .get(`${this.apiUrl}/application/role/all`)
      .then((response) => {
        this.dataListAppRole = response.data;
        this.appRoleService.updateDataListAppRole(this.dataListAppRole);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
          Swal.fire({
            icon: 'error',
            title: 'Terjadi Kesalahan',
            text: error.response.data.message,
          });
        } else {
          console.log(error.response.data.message);
        }
      });
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
        this.role_code = response.data.role_code;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  appData(): void {
    axios
      .get(`${this.apiUrl}/application/all`)
      .then((response) => {
        this.dataListApplication = response.data;
        console.log(this.dataListApplication);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  roleData(): void {
    axios
      .get(`${this.apiUrl}/role/all`)
      .then((response) => {
        this.dataListRole = response.data;
        console.log(this.dataListRole);
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
    this.form.patchValue({
      application_uuid: '',
      role_uuid: '',
    });
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addAuthority() {
    const token = this.cookieService.get('userToken');

    axios
      .post(
        `${this.apiUrl}/superadmin/application/role/add`,
        {
          application_uuid: this.form.value.application_uuid,
          role_uuid: this.form.value.role_uuid,
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
        // $('#addAppRoleModal').modal('hide');
        this.fetchDataAppRole();
        this.application_title = '';
        this.role_title = '';
        this.application_title = '';
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
            text: 'Terjadi Kesalahan',
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

  openEditModal(application_role_uuid: string) {
    axios
      .get(`${this.apiUrl}/application/role/${application_role_uuid}`)
      .then((response) => {
        const appRoleData = response.data;
        console.log(appRoleData);
        this.application_role_uuid = application_role_uuid;

        const existingApp = this.dataListApplication.find(
          (app) => app.application_title === appRoleData.application_title
        );
        const existingRole = this.dataListRole.find(
          (role) => role.role_title === appRoleData.role_title
        );

        this.form.patchValue({
          application_uuid: existingApp ? existingApp.application_uuid : '',
          role_uuid: existingRole ? existingRole.role_uuid : '',
        });

        // $('#editAppRoleModal').modal('show');
        this.isModalEditOpen = true;
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
            text: 'Terjadi Kesalahan',
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      });
  }

   closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateAuthority(): void {
    const token = this.cookieService.get('userToken');
    const appRoleFormValue = this.form.value;
    const appRoleUuid = this.application_role_uuid;
    const sendUpdateData = {
      application_uuid: appRoleFormValue.application_uuid,
      role_uuid: appRoleFormValue.role_uuid,
    };

    axios
      .put(
        `${this.apiUrl}/superadmin/application/role/update/${appRoleUuid}`,
        sendUpdateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataAppRole();
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        // $('#editAppRoleModal').modal('hide');
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
            text: 'Terjadi Kesalahan',
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

  onDeleteAuthority(application_role_uuid: string): void {
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
        this.performDeleteAuthority(application_role_uuid);
      }
    });
  }

  performDeleteAuthority(application_role_uuid: string): void {
    const token = this.cookieService.get('userToken');

    axios
      .put(
        `${this.apiUrl}/superadmin/application/role/delete/${application_role_uuid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataAppRole();
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

export { AppRole };
