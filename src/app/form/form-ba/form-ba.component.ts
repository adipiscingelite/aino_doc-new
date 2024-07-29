import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { FormBaService } from '../../services/form-ba/form-ba.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import axios from 'axios';

interface formsBA {
  form_uuid: string;
  form_number: string;
  form_ticket: string;
  form_status: string;
  document_name: string;
  project_name: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  deleted_by: string;
  deleted_at: string;
  judul: string;
  tanggal: string;
  nama_aplikasi: string;
  no_da: string;
  no_itcm: string;
  dilakukan_oleh: string;
  didampingi_oleh: string;
}

interface Documents {
  document_uuid: string;
  document_name: string;
}

interface Projects {
  project_uuid: string;
  project_name: string;
}

interface Users {
  user_id: string;
  personal_name: string;
}

@Component({
  selector: 'app-form-ba',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './form-ba.component.html',
  styleUrls: ['./form-ba.component.css'],
})
export class FormBaComponent implements OnInit {
  searchText: string = '';
  user_uuid: any;
  user_name: any;
  role_code: any;

  form_uuid: string = '';
  form_number: string = '';
  form_status: string = '';

  updated_at: string = '';
  update_by: string = '';
  created_at: string = '';
  created_by: string = '';
  updated_by: string = '';
  deleted_at: string = '';
  deleted_by: string = '';

  document_uuid: string = '';
  document_name: string = '';
  form_ticket: string = '';
  project_uuid: string = '';
  project_name: string = '';

  judul: string = '';
  tanggal: string = '';
  nama_aplikasi: string = '';
  no_da: string = '';
  no_itcm: string = '';
  dilakukan_oleh: string = '';
  didampingi_oleh: string = '';

  signatories = [];
  name1: string = '';
  name2: string = '';
  name3: string = '';
  name4: string = '';
  name5: string = '';

  position1: string = '';
  position2: string = '';
  position3: string = '';
  position4: string = '';
  position5: string = '';

  roleSign1: string = 'Pemohon';
  roleSign2: string = 'Atasan Pemohon';
  roleSign3: string = 'Penerima';
  roleSign4: string = 'Atasan Penerima';
  roleSign5: string = 'Atasan Pemohon';

  dataListAllDoc: Documents[] = [];
  dataListAllProject: Projects[] = [];

  dataListAllBA: formsBA[] = [];
  dataListUserBA: formsBA[] = [];
  dataListAdminBA: formsBA[] = [];

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalApproveOpen: boolean = false;

  constructor(
    private cookieService: CookieService,
    private fb: FormBuilder,
    public formBaService: FormBaService,
    @Inject('apiUrl') private apiUrl: string,
    private datePipe: DatePipe
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit(): void {
    this.profileData();
    this.fetchAllUser();
    this.listAllProject();
    console.log('bjir', this.listAllProject());
    

    this.fetchAllDataBA();
    this.fetchDataAdminBA();

    this.FetchDataUserBA();
    this.fetchDocumentUUID();
  }

  dataListAllUser: Users[] = [];

  matchesSearch(item: formsBA): boolean {
    const searchText = this.searchText.toLowerCase();

    return (
      item.judul.toLowerCase().includes(searchText) ||
      item.tanggal.toLowerCase().includes(searchText) ||
      item.nama_aplikasi.toLowerCase().includes(searchText) ||
      item.no_da.toLowerCase().includes(searchText) ||
      item.no_itcm.toLowerCase().includes(searchText) ||
      item.dilakukan_oleh.toLowerCase().includes(searchText) ||
      item.didampingi_oleh.toLowerCase().includes(searchText)
    );
  }

  substractYearsToDate(date: Date, years: number): Date {
    date.setFullYear(date.getFullYear() - years);
    return date;
  }

  getDateFormateForSearch(date: Date): string {
    let year = date.toLocaleDateString('es', { year: 'numeric' });
    let month = date.toLocaleDateString('es', { month: '2-digit' });
    let day = date.toLocaleDateString('es', { day: '2-digit' });
    return `${year}-${month}-${day}`;
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

  listAllProject(): void {
    axios
      .get(`${environment.apiUrl2}/project`)
      .then((response) => {
        this.dataListAllProject = response.data;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchAllUser() {
    axios
      .get(`${this.apiUrl}/personal/name/all`)
      .then((response) => {
        this.dataListAllUser = response.data;
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  fetchAllDataBA(): void {
    axios
      .get(`${environment.apiUrl2}/form/ba`)
      .then((response) => {
        // console.log(response.data);
        this.dataListAllBA = response.data;
      })
      .catch((error) => {
        // console.log(error.response);
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  fetchDataAdminBA() {
    axios
      .get(`${environment.apiUrl2}/admin/ba/all`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListAdminBA = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  FetchDataUserBA() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ba`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListUserBA = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  fetchDocumentUUID(): void {
    axios
      .get(`${environment.apiUrl2}/form/ba/code`)
      .then((response) => {
        this.document_uuid = response.data.document_uuid;
        console.log('Document UUID:', this.document_uuid);
      })
      .catch((error) => {
        console.error('Error fetching document UUID:', error);
      });
  }

  openAddModal() {
    // this.fetchAllDataBA();

  this.form_ticket = '';
  this.project_uuid = '';
  this.judul = '';
  this.tanggal = '';
  this.nama_aplikasi = '';
  this.no_da = '';
  this.no_itcm = '';
  this.dilakukan_oleh = '';
  this.didampingi_oleh = '';
    this.isModalAddOpen = true;
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addFormBA() {
    const data = {
      isPublished: false,
      formData: {
        document_uuid: this.document_uuid,
        form_ticket: this.form_ticket,
        project_uuid: this.project_uuid,
      },
      data_ba: {
        judul: this.judul,
        tanggal: this.tanggal,
        nama_aplikasi: this.nama_aplikasi,
        no_da: this.no_da,
        no_itcm: this.no_itcm,
        dilakukan_oleh: this.dilakukan_oleh,
        didampingi_oleh: this.didampingi_oleh,
      },
      signatories: [
        {
          name: this.name1,
          position: this.position1,
          role_sign: this.roleSign1,
        },
        {
          name: this.name2,
          position: this.position2,
          role_sign: this.roleSign2,
        },
        {
          name: this.name3,
          position: this.position3,
          role_sign: this.roleSign3,
        },
        {
          name: this.name4,
          position: this.position4,
          role_sign: this.roleSign4,
        },
        {
          name: this.name5,
          postion: this.position5,
          role_sign: this.roleSign5,
        },
      ],
    };

    axios
      .post(`${environment.apiUrl2}/api/add/ba`, data, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        console.log(response.data.message);
        this.fetchAllDataBA();
        this.fetchDataAdminBA();
        this.fetchAllDataBA();
        Swal.fire({
          icon: 'success',
          title: 'SUCCESS',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.log(error.response.data.message);
        if (
          error.response.status === 401 ||
          error.response.status === 500 ||
          error.response.status === 400
        ) {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: error.response.data.message,
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      });
    this.isModalAddOpen = false;
  }

  openEditModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/form/ba/${form_uuid}`)
      .then((response) => {
        console.log(response.data);
        // $('#updateModalBA').modal('show');
        const formData = response.data;
        this.form_uuid = formData.form_uuid;
        this.form_number = formData.form_number;
        this.form_ticket = formData.form_ticket;
        this.form_status = formData.form_status;
        this.document_name = formData.document_name;
        this.document_name = formData.document_name;
        this.created_by = formData.created_by;
        this.created_at = formData.created_at;
        this.updated_by = formData.updated_by;
        this.updated_at = formData.updated_at;
        this.deleted_by = formData.deleted_by;
        this.deleted_at = formData.deleted_at;
        this.judul = formData.judul;
        this.tanggal = formData.tanggal;
        this.nama_aplikasi = formData.nama_aplikasi;
        this.no_da = formData.no_da;
        this.no_itcm = formData.no_itcm;
        this.dilakukan_oleh = formData.dilakukan_oleh;
        this.didampingi_oleh = formData.didampingi_oleh;
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
        } else {
          console.log(error.response.data);
        }
      });
  }

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateBA() {
    axios
      .put(
        `${environment.apiUrl2}/api/form/ba/update/${this.form_uuid}`,
        {
          formData: {
            document_uuid: this.document_uuid,
            form_ticket: this.form_ticket,
            project_uuid: this.project_uuid,
          },
          data_ba: {
            judul: this.judul,
            tanggal: this.tanggal,
            nama_aplikasi: this.nama_aplikasi,
            no_da: this.no_da,
            no_itcm: this.no_itcm,
            dilakukan_oleh: this.dilakukan_oleh,
            didampingi_oleh: this.didampingi_oleh,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
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
        this.fetchAllDataBA();
        this.fetchDataAdminBA();
        this.FetchDataUserBA();
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
    this.isModalEditOpen = false;
  }

  onDeleteFormBA(form_uuid: string) {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Anda yakin ingin menghapus Formulir ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteBA(form_uuid);
      }
    });
  }

  performDeleteBA(form_uuid: string) {
    axios
      .put(
        `${environment.apiUrl2}/api/form/delete/${form_uuid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
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
        this.fetchAllDataBA();
        this.fetchDataAdminBA();
        this.FetchDataUserBA();
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

export { formsBA };
