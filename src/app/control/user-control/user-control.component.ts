import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormGroupDirective,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
// import { FormDaService } from '../../services/form-da/form-da.service';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user-control/user-control.service';
import Swal from 'sweetalert2';
import axios from 'axios';

interface Users {
  user_uuid: string;
  user_application_role_uuid: string;
  user_name: string;
  user_email: string;
  personal_name: string;
  personal_birthday: string;
  personal_gender: string;
  personal_phone: string;
  personal_address: string;
  role_title: string;
  application_title: string;
  division_title: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

interface Application {
  application_uuid: string;
  application_title: string;
}

interface Role {
  role_uuid: string;
  role_title: string;
}

interface Division {
  division_uuid: string;
  division_title: string;
}

@Component({
  selector: 'app-user-control',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,],
  templateUrl: './user-control.component.html',
  styleUrls: ['./user-control.component.css'],
})
export class UserControlComponent implements OnInit {
  searchText: string = '';

  form!: FormGroup;
  dataListApplication: Application[] = [];
  dataListRole: Role[] = [];
  dataListDivision: Division[] = [];

  user_name: string = '';
  user_uuid: string = '';
  user_application_role_uuid: string = '';
  user_email: string = '';
  user_password: string = '';
  personal_name: string = '';
  personal_birthday: string = '';
  personal_gender: string = '';
  personal_phone: string = '';
  personal_address: string = '';
  division_uuid: string = '';
  division_title: string = '';
  role_uuid: string = '';
  role_title: string = '';
  application_uuid: string = '';
  application_title: string = '';
  showPassword: boolean = false;
  maxBirthdayDate: string = '';

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;

  constructor(
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private formGroupDirective: FormGroupDirective,
    public userService: UserService
  ) {
    this.apiUrl = apiUrl;
  }

  userList: Users[] = [];

  ngOnInit(): void {
    this.fetchDataUser();
    this.form = this.fb.group({
      user_name: [''],
      user_email: [''],
      user_password: [''],
      personal_name: [''],
      personal_birthday: [''],
      personal_gender: [''],
      personal_phone: [''],
      personal_address: [''],
      application_uuid: [''],
      role_uuid: [''],
      division_uuid: [''],
    });

    let auxDate = this.substractYearsToDate(new Date(), 0);
    this.maxBirthdayDate = this.getDateFormateForSearch(auxDate);

    // const today = new Date();
    // const year = today.getFullYear();
    // const month = ('0' + (today.getMonth() + 1)).slice(-2);
    // const day = ('0' + today.getDate()).slice(-2);

    // this.maxDate = `${day}-${month}-${year}`;

    this.appData();
    this.roleData();
    this.divisionData();
  }

  substractYearsToDate(auxDate: Date, years: number): Date {
    auxDate.setFullYear(auxDate.getFullYear() - years);
    return auxDate;
  }

  getDateFormateForSearch(date: Date): string {
    let year = date.toLocaleDateString('es', { year: 'numeric' });
    let month = date.toLocaleDateString('es', { month: '2-digit' });
    let day = date.toLocaleDateString('es', { day: '2-digit' });
    return `${year}-${month}-${day}`;
  }

  matchesSearch(item: Users): boolean {
    const searchLowerCase = this.searchText.toLowerCase();
    return (
      item.user_name.toLowerCase().includes(searchLowerCase) ||
      item.user_email.toLowerCase().includes(searchLowerCase) ||
      item.personal_phone.toLowerCase().includes(searchLowerCase) ||
      item.division_title.toLowerCase().includes(searchLowerCase)
    );
  }

  fetchDataUser(): void {
    const token = this.cookieService.get('userToken');
    axios
      .get(`${this.apiUrl}/superadmin/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        this.userList = response.data;
        this.userService.updateDataListUsers(this.userList);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
          Swal.fire({
            icon: 'error',
            title: 'Kesalahan',
            text: error.response.data.message,
          });
        } else {
          console.log(error);
        }
      });
  }

  openAddModal() {
    this.isModalAddOpen = true;
    this.user_name = '';
    this.user_email = '';
    this.user_password = '';
    this.personal_name = '';
    this.personal_birthday = '';
    this.personal_gender = '';
    this.personal_phone = '';
    this.personal_address = '';
    this.division_uuid = '';
    this.role_uuid = '';
    this.application_uuid = '';
    this.onApplicationChange();
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  // togglePasswordVisibility() {
  //   this.showPassword = !this.showPassword;
  // }

  appData(): void {
    axios
      .get(`${this.apiUrl}/application/all`)
      .then((response) => {
        this.dataListApplication = response.data;
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
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  onApplicationChange(): void {
    if (this.application_uuid) {
      this.roleByAppData(this.application_uuid);
    } else {
      this.dataListRole = [];
    }
  }

  roleByAppData(application_uuid: string): void {
    axios
      .get(`${this.apiUrl}/list/role/${application_uuid}`)
      .then((response) => {
        this.dataListRole = response.data;
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  divisionData(): void {
    axios
      .get(`${this.apiUrl}/division/all`)
      .then((response) => {
        this.dataListDivision = response.data;
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  addUser(): void {
    const token = this.cookieService.get('userToken');
    const userFormValue = this.form.value;
    const user = {
      user_name: this.user_name,
      user_email: this.user_email,
      personal_name: this.personal_name,
      user_password: this.user_password,
      personal_birthday: this.personal_birthday,
      personal_gender: this.personal_gender,
      personal_phone: this.personal_phone,
      personal_address: this.personal_address,
      applicationRole: {
        application_uuid: this.application_uuid,

        // _application_uuid: userFormValue.application_uuid,
        // get application_uuid() {
        //   return this._application_uuid;
        // },
        // set application_uuid(value) {
        //   this._application_uuid = value;
        // },
        role_uuid: userFormValue.role_uuid,
        division_uuid: userFormValue.division_uuid,
      },
    };

    console.log(user, userFormValue);
    axios
      .post(`${this.apiUrl}/superadmin/user/add`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataUser();
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
        if (error.response.status === 500 || error.response.status === 400) {
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
          console.log(error);
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
    this.isModalAddOpen = false;
  }

  openEditModal(user_application_role_uuid: string): void {
    axios
      .get(`${this.apiUrl}/user/${user_application_role_uuid}`)
      .then((response) => {
        this.isModalEditOpen = true;
        const userData = response.data;
        console.log(userData);
        this.user_application_role_uuid = userData.user_application_role_uuid;

        const existingApplication = this.dataListApplication.find(
          (app) => app.application_title === userData.application_title
        );

        const existingRole = this.dataListRole.find(
          (role) => role.role_title === userData.role_title
        );

        const existingDivision = this.dataListDivision.find(
          (division) => division.division_title === userData.division_title
        );

        this.form.patchValue({
          application_uuid: existingApplication
            ? existingApplication.application_uuid
            : '',
          role_uuid: existingRole ? existingRole.role_uuid : '',
          division_uuid: existingDivision ? existingDivision.division_uuid : '',
        });

        userData.personal_birthday = this.datePipe.transform(
          userData.personal_birthday,
          'yyyy-MM-dd'
        );

        this.user_uuid = userData.user_uuid;
        this.user_application_role_uuid = userData.user_application_role_uuid;
        this.user_name = userData.user_name;
        this.user_email = userData.user_email;
        this.personal_name = userData.personal_name;
        this.personal_birthday = userData.personal_birthday;
        this.personal_gender = userData.personal_gender;
        this.personal_phone = userData.personal_phone;
        this.personal_address = userData.personal_address;
        // $('#editUserModal').modal('show');
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
          console.log(error);
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
  }

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateUser(): void {
    const token = this.cookieService.get('userToken');
    const userAppRoleUuid = this.user_application_role_uuid;
    const userFormValue = this.form.value;
    const updateDataUser = {
      user_name: this.user_name,
      user_email: this.user_email,
      personal_name: this.personal_name,
      personal_birthday: this.personal_birthday,
      personal_gender: this.personal_gender,
      personal_phone: this.personal_phone,
      personal_address: this.personal_address,
      applicationRole: {
        application_uuid: userFormValue.application_uuid,
        role_uuid: userFormValue.role_uuid,
        division_uuid: userFormValue.division_uuid,
      },
    };

    axios
      .put(
        `${this.apiUrl}/superadmin/user/update/${userAppRoleUuid}`,
        updateDataUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataUser();
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        console.log(response);
      })
      .catch((error) => {
        if (
          error.response.status === 400 ||
          error.response.status === 422 ||
          error.response.status === 404 ||
          error.response.status === 500
        ) {
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

  openDetailModal(user_application_role_uuid: string) {
    axios
      .get(`${environment.apiUrl}/user/${user_application_role_uuid}`)
      .then((response) => {
        console.log(response);
        const user = response.data;

        this.user_name = user.user_name;
        this.user_uuid = user.user_uuid;
        this.user_application_role_uuid = user.user_application_role_uuid;
        this.user_email = user.user_email;
        this.personal_name = user.personal_name;
        this.personal_birthday = user.personal_birthday;
        this.personal_gender = user.personal_gender;
        this.personal_phone = user.personal_phone;
        this.personal_address = user.personal_address;
        this.division_title = user.division_title;
        this.role_title = user.role_title;
        this.application_title = user.application_title;
        this.isModalDetailOpen = true;
        // console.log('woi', this.user_email);
                
      })
      .catch((error) => {
        if (error.response && error.response.status === 500) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
            confirmButtonText: 'OK',
          });
        } else {
          console.error(error);
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

  closeDetailModal() {
    this.isModalDetailOpen = false;
  }

  onDeleteUser(user_application_role_uuid: string): void {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Anda yakin ingin menghapus user ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteUser(user_application_role_uuid);
      }
    });
  }

  performDeleteUser(user_application_role_uuid: string): void {
    const token = this.cookieService.get('userToken');
    axios
      .put(
        `${this.apiUrl}/superadmin/user/delete/${user_application_role_uuid}`,
        {},
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
        this.fetchDataUser();
      })
      .catch((error) => {
        if (error.response.status === 500 || error.response.status === 400) {
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
          console.log(error);
        }
      });
  }
}

export { Users };
