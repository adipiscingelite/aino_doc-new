import { Component, OnInit, Inject, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { FormItcmService } from '../../services/form-itcm/form-itcm.service';
import { CommonModule } from '@angular/common';

interface formsITCM {
  form_uuid: string;
  form_number: string;
  form_ticket: string;
  form_status: string;
  document_name: string;
  project_name: string;
  project_manager: string;
  approval_status: string;
  reason: string;
  created_by: string;
  updated_by: string;
  updated_at: string;
  deleted_by: string;
  deleted_at: string;
  no_da: string;
  nama_pemohon: string;
  instansi: string;
  tanggal: string;
  perubahan_aset: string;
  deskripsi: string;
}

interface Documents {
  document_uuid: string;
  document_name: string;
}

interface Projects {
  project_uuid: string;
  project_name: string;
}
@Component({
  selector: 'app-form-itcm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './form-itcm.component.html',
  styleUrls: ['./form-itcm.component.scss'],
})
export class FormItcmComponent implements OnInit {
  searchText: string = '';

  form!: FormGroup;

  user_uuid: any;
  user_name: any;
  role_code: any;

  dataListAllDoc: Documents[] = [];
  dataListAllProject: Projects[] = [];

  document_uuid: string = '';
  //768e9241-c9ca-411f-8b91-4fb3ca7728bf
  document_name: string = '';
  form_ticket: string = '';
  form_ticket_update: string = '';
  project_uuid: string = '';
  project_name: string = '';

  formatted_form_number: string = '';
  form_status: string = '';
  project_manager: string = '';
  approval_status: string = '';

  created_by: string = '';
  created_at: string = '';
  updated_by: string = '';
  updated_at: string = '';
  deleted_by: string = '';
  deleted_at: string = '';

  dataListAllUser: any = [];

  no_da: string = '';
  nama_pemohon: string = '';
  instansi: string = '';
  tanggal: string = '';
  perubahan_aset: string = '';
  deskripsi: string = '';

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
  form_uuid: any;

  role_sign1: string = 'Pemohon';
  role_sign2: string = 'Atasan Pemohon';
  role_sign3: string = 'Penerima';
  role_sign4: string = 'Atasan Penerima';
  role_sign5: string = 'Atasan Pemohon';

  is_sign: boolean = false;
  is_sign1: boolean = false;
  is_sign2: boolean = false;
  is_sign3: boolean = false;
  is_sign4: boolean = false;
  is_sign5: boolean = false;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalApproveOpen: boolean = false;

  constructor(
    private cookieService: CookieService,
    private fb: FormBuilder,
    public formItcmService: FormItcmService,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit(): void {
    this.fetchDataFormITCM();
    this.fetchDataAdminFormITCM();
    this.fetchDataUserFormITCM();
    this.profileData();

    this.fetchAllUser();
    this.fetchAllDocument();
    this.fetchAllProject();
    this.fetchDocumentUUID();
  }

  dataListDocument: Documents[] = [];
  dataListProject: Projects[] = [];

  dataListFormITCM: formsITCM[] = [];
  dataListFormAdminITCM: formsITCM[] = [];
  dataListFormUserITCM: formsITCM[] = [];

  matchesSearch(item: formsITCM): boolean {
    const searchText = this.searchText.toLowerCase();
    return (
      item.form_number.toLowerCase().includes(searchText) ||
      item.form_ticket.toLowerCase().includes(searchText) ||
      item.document_name.toLowerCase().includes(searchText) ||
      item.project_name.toLowerCase().includes(searchText) ||
      item.project_manager.toLowerCase().includes(searchText) ||
      item.no_da.toLowerCase().includes(searchText) ||
      item.nama_pemohon.toLowerCase().includes(searchText) ||
      item.instansi.toLowerCase().includes(searchText) ||
      item.tanggal.toLowerCase().includes(searchText) ||
      item.perubahan_aset.toLowerCase().includes(searchText) ||
      item.deskripsi.toLowerCase().includes(searchText)
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

  fetchDataFormITCM() {
    axios
      .get(`${environment.apiUrl2}/form/itcm`)
      .then((response) => {
        this.dataListFormITCM = response.data;
        console.log(response.data);
        this.formItcmService.updateDataListFormITCM(this.dataListFormITCM);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        } else if (error.response.status === 404) {
          console.log(error.response.data.message);
        }
      });
  }

  fetchDataAdminFormITCM() {
    axios
      .get(`${environment.apiUrl2}/admin/itcm/all`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListFormAdminITCM = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  fetchDataUserFormITCM() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/itcm`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListFormUserITCM = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  fetchDocumentUUID(): void {
    axios
      .get(`${environment.apiUrl2}/form/itcm/code`)
      .then((response) => {
        this.document_uuid = response.data.document_uuid;
        console.log('Document UUID:', this.document_uuid);
      })
      .catch((error) => {
        console.error('Error fetching document UUID:', error);
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

  fetchAllDocument(): void {
    axios
      .get(`${environment.apiUrl2}/document`)
      .then((response) => {
        this.dataListDocument = response.data;
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  fetchAllProject() {
    axios
      .get(`${environment.apiUrl2}/project`)
      .then((response) => {
        this.dataListProject = response.data;
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  openAddModal() {
    this.isModalAddOpen = true;
  }

  addFormITCM() {
    axios
      .post(
        `${environment.apiUrl2}/api/add/itcm`,
        {
          formData: {
            document_uuid: this.document_uuid,
            form_ticket: this.form_ticket,
            project_uuid: this.project_uuid,
          },
          data_itcm: {
            no_da: this.no_da,
            nama_pemohon: this.nama_pemohon,
            instansi: this.instansi,
            tanggal: this.tanggal,
            perubahan_aset: this.perubahan_aset,
            deskripsi: this.deskripsi,
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
        },
        {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        this.fetchDataFormITCM();
        this.fetchDataAdminFormITCM();
        this.fetchDataUserFormITCM();
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: response.data.message,
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        if ( 
          error.response.status === 500 ||
          error.response.status === 400 ||
          error.response.status === 422 ||
          error.response.status === 404
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
        }
      });
    this.isModalAddOpen = false;
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  openEditModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/form/itcm/${form_uuid}`)
      .then((response) => {
        console.log(response.data);
        this.isModalEditOpen = true;
        const formData = response.data;
        this.form_uuid = formData.form_uuid;
        this.document_uuid = formData.document_uuid;
        this.form_ticket = formData.form_ticket;
        this.no_da = formData.no_da;
        this.project_name = formData.project_name;
        this.nama_pemohon = formData.nama_pemohon;
        this.instansi = formData.instansi;
        this.tanggal = formData.tanggal;
        this.perubahan_aset = formData.perubahan_aset;
        this.deskripsi = formData.deskripsi;
      })
      .catch((error) => {
        if (error.response.status === 404 || error.response.status === 500) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      });
  }

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateFormITCM() {
    axios
      .put(
        `${environment.apiUrl2}/api/form/itcm/update/${this.form_uuid}`,
        {
          formData: {
            document_uuid: this.document_uuid,
            form_ticket: this.form_ticket,
            project_uuid: this.project_uuid,
          },
          data_itcm: {
            no_da: this.no_da,
            nama_pemohon: this.nama_pemohon,
            instansi: this.instansi,
            tanggal: this.tanggal,
            perubahan_aset: this.perubahan_aset,
            deskripsi: this.deskripsi,
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
        });
        this.fetchDataFormITCM();
        this.fetchDataAdminFormITCM();
        this.fetchDataUserFormITCM();
      })
      .catch((error) => {
        if (error.response.status === 404 || error.response.status === 500) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      });
      this.isModalAddOpen = false;
  }

  openApproveModal(form_uuid: string) {
    axios.get(`${environment.apiUrl2}/itcm/${form_uuid}`).then((response) => {
      this.isModalAddOpen = true;
      this.form_ticket = response.data.form_ticket;
      this.formatted_form_number = response.data.formatted_form_number;
      this.form_status = response.data.form_status;
      this.document_name = response.data.document_name;
      this.project_name = response.data.project_name;
      this.project_manager = response.data.project_manager;
      this.approval_status = response.data.approval_status;
      this.no_da = response.data.no_da;
      this.nama_pemohon = response.data.nama_pemohon;
      this.instansi = response.data.instansi;
      this.tanggal = response.data.tanggal;
      this.perubahan_aset = response.data.perubahan_aset;
      this.deskripsi = response.data.deskripsi;
      this.created_by = response.data.created_by;
      this.created_at = response.data.created_at;
      this.updated_by = response.data.updated_by;
      this.updated_at = response.data.updated_at;
      this.deleted_by = response.data.deleted_by;
      this.deleted_at = response.data.deleted_at;
    });
  }

  
  closeApproveModal() {
    this.isModalApproveOpen = false;
  }

  onDeleteFormITCM(form_uuid: string) {
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
        this.performDeleteFormITCM(form_uuid);
      }
    });
  }

  performDeleteFormITCM(form_uuid: string) {
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
        });
        this.fetchDataFormITCM();
        this.fetchDataAdminFormITCM();
        this.fetchDataUserFormITCM();
      })
      .catch((error) => {
        if (error.response.status === 404 || error.response.status === 500) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      });
  }
}

export { formsITCM };
