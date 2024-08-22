import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { FormDaService } from '../../services/form-da/form-da.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import axios from 'axios';
import { PdfGenerationService } from '../../services/pdf-generation.service';
// import { PdfGenerationService } from '../services/pdf-generation.service';'
import { AlertModule } from '@coreui/angular';
import { initFlowbite,  } from 'flowbite';
import { initPopovers } from 'flowbite';


interface Signatory {
  sign_uuid: string;
  signatory_name: string;
  signatory_position: string;
  role_sign: string;
  is_sign: boolean;
}

interface formsDA {
  form_uuid: string;
  form_name: string;
  form_number: string;
  form_ticket: string;
  form_status: string;
  document_name: string;
  project_name: string;
  nama_analis: string;
  jabatan: string;
  departemen: string;
  jenis_perubahan: string;
  detail_dampak_perubahan: string;
  rencana_pengembangan_perubahan: string;
  rencana_pengujian_perubahan_sistem: string;
  rencana_rilis_perubahan_dan_implementasi: string;

  is_sign: boolean;

  created_by: string;
  updated_by: string;
  updated_at: string;
  deleted_by: string;
  deleted_at: string;
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

interface Detail {
  form_number: string;
  form_ticket: string;
  form_status: string;
  document_name: string;
  project_name: string;
  nama_analis: string;
  approval_status: string;
  reason: string;
  jabatan: string;
  departemen: string;
  jenis_perubahan: string;
  detail_dampak_perubahan: string;
  rencana_pengembangan_perubahan: string;
  rencana_pengujian_perubahan_sistem: string;
  rencana_rilis_perubahan_dan_implementasi: string;
  name: string;
  position: string;
  role_sign: string;
  is_sign: boolean;
}

interface Approval {
  is_approve: boolean;
  reason: string | null;
}

@Component({
  selector: 'app-form-da',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ],
  templateUrl: './form-da.component.html',
  styleUrl: './form-da.component.css',
})
export class FormDaComponent implements OnInit {
  searchText: string = '';

  isPreview: boolean = false; // State untuk menampilkan preview atau tabel
  form!: FormGroup;
  dataListAllDoc: Documents[] = [];
  dataListAllProject: Projects[] = [];
  dataListAllUser: Users[] = [];

  form_uuid: string = '';
  form_number: string = '';
  form_ticket: string = '';
  form_status: string = '';
  document_uuid: string = '';
  document_name: string = '';
  project_uuid: string = '';
  project_name: string = '';
  approval_status: string = '';
  reason: string = '';
  created_by: string = '';
  created_at: string = '';
  updated_by: string = '';
  updated_at: string = '';
  deleted_by: string = '';
  deleted_at: string = '';

  isPublished: boolean = false;
  // reason: string = ''

  nama_analis: string = '';
  jabatan: string = '';
  departemen: string = '';
  jenis_perubahan: string = '';
  detail_dampak_perubahan: string = '';
  rencana_pengembangan_perubahan: string = '';
  rencana_pengujian_perubahan_sistem: string = '';
  rencana_rilis_perubahan_dan_implementasi: string = '';

  personal_name: string = '';
  name: string = '';
  position: string = '';
  role_sign: string = '';
  is_sign: boolean = false;

  user_uuid: any;
  user_name: any;
  role_code: any;

  maxDate: string = '';

  signatories = [];
  name1: string = '';
  name2: string = '';
  name3: string = '';
  name4: string = '';
  // name5: string = '';

  position1: string = '';
  position2: string = '';
  position3: string = '';
  position4: string = '';
  // position5: string = '';

  roleSign1: string = 'Pemohon';
  roleSign2: string = 'Atasan Pemohon';
  roleSign3: string = 'Penerima';
  roleSign4: string = 'Atasan Penerima';

  is_sign1: boolean = false;
  is_sign2: boolean = false;
  is_sign3: boolean = false;
  is_sign4: boolean = false;
  // roleSign5: string = 'Atasan Pemohon';

  dataListFormDADetail: Detail[] = [];

  is_approve: boolean = false;
  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalApproveOpen: boolean = false;

  activePopover: number | null = null;

  signatoryPositions: {
    [key: string]: { name: string; position: string; is_sign: boolean };
  } = {
    Pemohon: { name: '', position: '', is_sign: false },
    'Atasan Pemohon': { name: '', position: '', is_sign: false },
    Penerima: { name: '', position: '', is_sign: false },
    'Atasan Penerima': { name: '', position: '', is_sign: false },
  };

  constructor(
    private cookieService: CookieService,
    private fb: FormBuilder,
    public formDaService: FormDaService,
    private datePipe: DatePipe,
    private pdfService: PdfGenerationService,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  dataListAllFormDA: formsDA[] = [];
  dataListAdminFormDA: formsDA[] = [];
  dataListUserFormDA: formsDA[] = [];

  ngOnInit(): void {
    initFlowbite();
    initPopovers()
    this.profileData();

    this.listAllDoc();
    this.listAllProject();
    this.fetchAllUser();

    this.fetchDataFormDA();
    this.fetchDataAdminFormDA();
    this.fetchDataUserFormDA();
    this.fetchDocumentUUID();

    let auxDate = this.substractYearsToDate(new Date(), 0);
    this.maxDate = this.getDateFormateForSearch(auxDate);
    // console.log('rencana', this.rencana_pengembangan_perubahan);
  }

  substractYearsToDate(date: Date, years: number): Date {
    date.setFullYear(date.getFullYear() - years);
    return date;
  }

  backToTable() {
    // Ganti state untuk menampilkan tabel
    this.isPreview = false;
  }

  getDateFormateForSearch(date: Date): string {
    let year = date.toLocaleDateString('es', { year: 'numeric' });
    let month = date.toLocaleDateString('es', { month: '2-digit' });
    let day = date.toLocaleDateString('es', { day: '2-digit' });
    return `${year}-${month}-${day}`;
  }

  matchesSearch(item: any): boolean {
    const searchText = this.searchText.toLowerCase();
    return (
      (item.form_name && item.form_name.toLowerCase().includes(searchText)) ||
      (item.form_number &&
        item.form_number.toLowerCase().includes(searchText)) ||
      (item.form_ticket &&
        item.form_ticket.toLowerCase().includes(searchText)) ||
      (item.document_name &&
        item.document_name.toLowerCase().includes(searchText)) ||
      (item.project_name &&
        item.project_name.toLowerCase().includes(searchText))
    );
  }

  woilah(){
    alert('wkkwkwkwkwkw gatau blm bisa')
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
        if (error.response.status === 500 || error.response.status === 404) {
          console.log(error.response.data);
        }
      });
  }

  listAllDoc(): void {
    axios
      .get(`${environment.apiUrl2}/document`)
      .then((response) => {
        this.dataListAllDoc = response.data;
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  listAllProject(): void {
    axios
      .get(`${environment.apiUrl2}/project`)
      .then((response) => {
        this.dataListAllProject = response.data;
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  fetchDataFormDA() {
    axios
      .get(`${environment.apiUrl2}/dampak/analisa`)
      .then((response) => {
        this.dataListAllFormDA = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error.response);
        if (error.response.status === 500) {
          console.log(error.response.data);
        }
      });
  }

  fetchDataAdminFormDA() {
    axios
      .get(`${environment.apiUrl2}/admin/da/all`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListAdminFormDA = response.data;
        console.log(response.data);        
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  fetchDataUserFormDA() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListUserFormDA = response.data;
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  fetchAllUser() {
    axios
      .get(`${this.apiUrl}/personal/name/all`)
      .then((response) => {
        this.dataListAllUser = response.data;
        console.log('user', this.dataListAllUser);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  fetchDocumentUUID(): void {
    axios
      .get(`${environment.apiUrl2}/form/da/code`)
      .then((response) => {
        this.document_uuid = response.data.document_uuid;
        console.log('Document UUID:', this.document_uuid);
      })
      .catch((error) => {
        console.error('Error fetching document UUID:', error);
      });
  }

  togglePopover(index: number) {
    if (this.activePopover === index) {
      this.activePopover = null;
    } else {
      this.activePopover = index;
    }
  }

  openAddModal() {
    this.isModalAddOpen = true;
    this.form_ticket = '1';
    this.project_uuid = '';
    this.nama_analis = 'a';
    this.jabatan = 'a';
    this.departemen = 'a';
    this.jenis_perubahan = 'a';
    this.detail_dampak_perubahan = 'a';
    this.rencana_pengembangan_perubahan = 'a';
    this.rencana_pengujian_perubahan_sistem = 'a';
    this.rencana_rilis_perubahan_dan_implementasi = 'a';
    this.name1 = '';
    this.position1 = '';
    this.roleSign1 = this.roleSign1;
    this.name2 = '';
    this.position2 = '';
    this.roleSign2 = this.roleSign2;
    this.name3 = '';
    this.position3 = '';
    this.roleSign3 = this.roleSign3;
    this.name4 = '';
    this.position4 = '';
    this.roleSign4 = this.roleSign4;
    // this.name5 = '';
    // this.position5 = '';
    // this.roleSign5 = '';
    console.log('add da');
  }
  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addFormDA(): void {
    const token = this.cookieService.get('userToken');
    console.log('Document UUID:', this.document_uuid);

    const requestDataFormDA = {
      isPublished: false,
      formData: {
        document_uuid: this.document_uuid,
        form_ticket: this.form_ticket,
        project_uuid: this.project_uuid,
      },
      data_da: {
        nama_analis: this.nama_analis,
        jabatan: this.jabatan,
        departemen: this.departemen,
        jenis_perubahan: this.jenis_perubahan,
        detail_dampak_perubahan: this.detail_dampak_perubahan,
        rencana_pengembangan_perubahan: this.rencana_pengembangan_perubahan,
        rencana_pengujian_perubahan_sistem:
          this.rencana_pengujian_perubahan_sistem,
        rencana_rilis_perubahan_dan_implementasi:
          this.rencana_rilis_perubahan_dan_implementasi,
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
        // {
        //   name: this.name5,
        //   postion: this.position5,
        //   role_sign: this.roleSign5,
        // },
      ],
    };
    console.log(requestDataFormDA);

    console.log(this.document_uuid);
    axios
      .post(`${environment.apiUrl2}/api/add/da`, requestDataFormDA, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        Swal.fire({
          icon: 'success',
          title: 'SUCCESS',
          text: response.data.message,
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchDataFormDA();
        this.fetchDataAdminFormDA();
        this.fetchDataUserFormDA();
        // console.log('rencana', this.rencana_pengembangan_perubahan);
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
    // this.isModalAddOpen = false;
  }

  openEditModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/dampak/analisa/${form_uuid}`)
      .then((response) => {
        this.isModalEditOpen = true;
        const formData = response.data;
        this.form_uuid = formData.form_uuid;
        this.form_number = formData.form_number;
        this.form_ticket = formData.form_ticket;
        this.form_status = formData.form_status;
        this.document_name = formData.document_name;
        this.project_uuid = formData.project_uuid;
        this.project_name = formData.project_name;
        this.nama_analis = formData.nama_analis;
        this.jabatan = formData.jabatan;
        this.departemen = formData.departemen;
        this.jenis_perubahan = formData.jenis_perubahan;
        this.detail_dampak_perubahan = formData.detail_dampak_perubahan;
        this.rencana_pengembangan_perubahan =
          formData.rencana_pengembangan_perubahan;
        this.rencana_pengujian_perubahan_sistem =
          formData.rencana_pengujian_perubahan_sistem;
        this.rencana_rilis_perubahan_dan_implementasi =
          formData.rencana_rilis_perubahan_dan_implementasi;

        const existingProject = this.dataListAllProject.find(
          (project) => project.project_name === formData.project_name
        );
        this.project_uuid = existingProject ? existingProject.project_uuid : '';

        console.log(this.rencana_pengembangan_perubahan);
      })
      .catch((error) => {
        if (error.response.status === 500) {
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

  // openEditModal() {
  //   this.isModalEditOpen = true;
  // }
  closeEditModal() {
    this.isModalEditOpen = false;
  }
  updateFormDA() {
    axios
      .put(
        `${environment.apiUrl2}/api/dampak/analisa/update/${this.form_uuid}`,
        {
          formData: {
            document_uuid: this.document_uuid,
            form_ticket: this.form_ticket,
            project_uuid: this.project_uuid,
          },
          data_da: {
            nama_analis: this.nama_analis,
            jabatan: this.jabatan,
            departemen: this.departemen,
            jenis_perubahan: this.jenis_perubahan,
            detail_dampak_perubahan: this.detail_dampak_perubahan,
            rencana_pengembangan_perubahan: this.rencana_pengembangan_perubahan,
            rencana_pengujian_perubahan_sistem:
              this.rencana_pengujian_perubahan_sistem,
            rencana_rilis_perubahan_dan_implementasi:
              this.rencana_rilis_perubahan_dan_implementasi,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
          },
        }
      )
      .then((response) => {
        Swal.fire({
          icon: 'success',
          title: 'SUCCESS',
          text: response.data.message,
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        // $('#updateModalDA').modal('hide');
        this.fetchDataFormDA();
        this.fetchDataAdminFormDA();
        this.fetchDataUserFormDA();
      })
      .catch((error) => {
        if (
          error.response.status === 404 ||
          error.response.status === 500 ||
          error.response.status === 422 ||
          error.response.status === 400
        ) {
          console.log(error.response);
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

  openPreviewPage(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/da/${form_uuid}`)
      .then((response) => {
        // $('#detailModalDA').modal('show');
        console.log(response);
        const formData = response.data.form;
        this.created_at = formData.created_at;
        this.form_ticket = formData.form_ticket;
        this.form_status = formData.form_status;
        this.form_number = formData.form_number;
        this.document_name = formData.document_name;
        this.project_name = formData.project_name;
        this.approval_status = formData.approval_status;
        this.reason = formData.reason?.String || '';
        this.nama_analis = formData.nama_analis;
        this.jabatan = formData.jabatan;
        this.departemen = formData.departemen;
        this.jenis_perubahan = formData.jenis_perubahan;
        this.detail_dampak_perubahan = formData.detail_dampak_perubahan;
        this.rencana_pengembangan_perubahan =
          formData.rencana_pengembangan_perubahan;
        this.rencana_pengujian_perubahan_sistem =
          formData.rencana_pengujian_perubahan_sistem;
        this.rencana_rilis_perubahan_dan_implementasi =
          formData.rencana_rilis_perubahan_dan_implementasi;
        this.isPreview = true;

        const signatories: Signatory[] = response.data.signatories || [];

        // Reset the signatory details
        Object.keys(this.signatoryPositions).forEach((role) => {
          this.signatoryPositions[role] = {
            name: '',
            position: '',
            is_sign: false,
          };
        });

        // Populate the signatory details based on the API response
        signatories.forEach((signatory: Signatory) => {
          const role = signatory.role_sign;
          if (this.signatoryPositions[role]) {
            this.signatoryPositions[role] = {
              name: signatory.signatory_name || '',
              position: signatory.signatory_position || '',
              is_sign: signatory.is_sign || false,
            };
          }
        });

        // Log to verify
        console.log(this.signatoryPositions);

        if (
          this.approval_status === 'Menunggu Disetujui' &&
          this.role_sign === 'Atasan Penerima'
        ) {
          console.log('iy');
        } else {
          console.log(this.approval_status);
          console.log(this.role_sign);

          console.log('no');
        }
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
        }
      });
  }

  // openApproveModal() {
  //   this.isModalApproveOpen = true;
  // }
  closePreviewPage() {
    this.isPreview = false;
  }
  // openApproveModal(form_uuid: string) {
  //   axios
  //     .get(`${environment.apiUrl2}/da/${form_uuid}`)
  //     .then((response) => {
  //       // $('#detailModalDA').modal('show');
  //       console.log(response);
  //       const formData = response.data.form;
  //       this.created_at = formData.created_at;
  //       this.form_ticket = formData.form_ticket;
  //       this.form_status = formData.form_status;
  //       this.form_number = formData.form_number;
  //       this.document_name = formData.document_name;
  //       this.project_name = formData.project_name;
  //       this.approval_status = formData.approval_status;
  //       this.reason = formData.reason?.String || '';
  //       this.nama_analis = formData.nama_analis;
  //       this.jabatan = formData.jabatan;
  //       this.departemen = formData.departemen;
  //       this.jenis_perubahan = formData.jenis_perubahan;
  //       this.detail_dampak_perubahan = formData.detail_dampak_perubahan;
  //       this.rencana_pengembangan_perubahan =
  //         formData.rencana_pengembangan_perubahan;
  //       this.rencana_pengujian_perubahan_sistem =
  //         formData.rencana_pengujian_perubahan_sistem;
  //       this.rencana_rilis_perubahan_dan_implementasi =
  //         formData.rencana_rilis_perubahan_dan_implementasi;
  //         this.isPreview = true;

  //       const signatories: Signatory[] = response.data.signatories || [];

  //       // Reset the signatory details
  //       Object.keys(this.signatoryPositions).forEach(role => {
  //         this.signatoryPositions[role] = { name: '', position: '', is_sign: false };
  //       });

  //       // Populate the signatory details based on the API response
  //       signatories.forEach((signatory: Signatory) => {
  //         const role = signatory.role_sign;
  //         if (this.signatoryPositions[role]) {
  //           this.signatoryPositions[role] = {
  //             name: signatory.signatory_name || '',
  //             position: signatory.signatory_position || '',
  //             is_sign: signatory.is_sign || false
  //           };
  //         }
  //       });

  //       // Log to verify
  //       console.log(this.signatoryPositions);

  //       if (this.approval_status === 'Menunggu Disetujui' && this.role_sign === 'Atasan Penerima') {
  //         console.log('iy');

  //       } else {
  //         console.log(this.approval_status);
  //         console.log(this.role_sign);

  //         console.log('no');

  //       }
  //     })
  //     .catch((error) => {
  //       if (error.response && error.response.status === 500) {
  //         Swal.fire({
  //           title: 'Error',
  //           text: error.response.data.message,
  //           icon: 'error',
  //           timer: 2000,
  //           timerProgressBar: true,
  //           showCancelButton: false,
  //           showConfirmButton: false,
  //           confirmButtonText: 'OK',
  //         });
  //       } else {
  //         console.error(error);
  //       }
  //     });
  // }

  // // openApproveModal() {
  // //   this.isModalApproveOpen = true;
  // // }
  // closeApproveModal() {
  //   this.isModalApproveOpen = false;
  // }

  onDeleteFormDA(form_uuid: string) {
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
        this.performDeleteFormDA(form_uuid);
      }
    });
  }

  performDeleteFormDA(form_uuid: string) {
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
        this.fetchDataFormDA();
        this.fetchDataAdminFormDA();
        this.fetchDataUserFormDA();
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

  // onDeleteFormDA() {
  //   Swal.fire({
  //     title: "Konfirmasi",
  //     text: "Anda yakin ingin menghapus Formulir ini?",
  //     icon: "question",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Ya",
  //     cancelButtonText: "Tidak",
  //   }).then(() => {
  //     this.performDeleteBA();
  //   })
  // }

  // performDeleteBA() {
  //       Swal.fire({
  //         title: 'Success',
  //         text: 'Berhasil' ,
  //         icon: 'success',
  //         showCancelButton: false,
  //         timer: 3000
  //       });
  // }
  approveForm(form_uuid: string) {
    axios
      .put(
        `${environment.apiUrl2}/api/form/approval/${form_uuid}`,
        {
          is_approve: true, // Properly reference the class properties
          reason: '', // Reason should be null if approved
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
        this.fetchDataFormDA();
        this.fetchDataAdminFormDA();
        this.fetchDataUserFormDA();
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

  downloadData(form_uuid: string) {
    console.log('downloadData called with', form_uuid);
    axios
      .get(`${environment.apiUrl2}/da/${form_uuid}`)
      .then((response) => {
        const formData = response.data.form;

        // Periksa apakah formData ada dan memiliki properti yang diperlukan
        if (formData) {
          this.form_ticket = formData.form_ticket;
          this.form_status = formData.form_status;
          this.form_number = formData.form_number;
          this.document_name = formData.document_name;
          this.project_name = formData.project_name;
          this.approval_status = formData.approval_status;
          this.reason = formData.reason?.String || '';
          this.nama_analis = formData.nama_analis;
          this.jabatan = formData.jabatan;
          this.departemen = formData.departemen;
          this.jenis_perubahan = formData.jenis_perubahan;
          this.detail_dampak_perubahan = formData.detail_dampak_perubahan;
          this.rencana_pengembangan_perubahan =
            formData.rencana_pengembangan_perubahan;
          this.rencana_pengujian_perubahan_sistem =
            formData.rencana_pengujian_perubahan_sistem;
          this.rencana_rilis_perubahan_dan_implementasi =
            formData.rencana_rilis_perubahan_dan_implementasi;

          // Panggil fungsi untuk menghasilkan PDF
          this.downloadPdfAction();
        } else {
          console.error('Form data is not present in the response');
        }
      })
      .catch((error) => {
        console.error('Error fetching document data:', error);
      });
  }

  downloadPdfAction() {
    // Pastikan data sudah diambil dan siap untuk digunakan
    if (this.form_ticket) {
      this.pdfService
        .generatePdf({
          form_ticket: this.form_ticket,
          form_status: this.form_status,
          form_number: this.form_number,
          document_name: this.document_name,
          project_name: this.project_name,
          approval_status: this.approval_status,
          reason: this.reason,
          nama_analis: this.nama_analis,
          jabatan: this.jabatan,
          departemen: this.departemen,
          jenis_perubahan: this.jenis_perubahan,
          detail_dampak_perubahan: this.detail_dampak_perubahan,
          rencana_pengembangan_perubahan: this.rencana_pengembangan_perubahan,
          rencana_pengujian_perubahan_sistem:
            this.rencana_pengujian_perubahan_sistem,
          rencana_rilis_perubahan_dan_implementasi:
            this.rencana_rilis_perubahan_dan_implementasi,
        })
        .then(() => {
          console.log('PDF generation completed');
        })
        .catch((error) => {
          console.error('Error generating PDF:', error);
        });
    } else {
      console.error('Data is not ready for PDF generation');
    }
  }

  tabIndent(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault(); // Mencegah tab berpindah fokus
      const textarea = event.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Menambahkan tab pada posisi kursor
      textarea.value =
        textarea.value.substring(0, start) +
        '\t' +
        textarea.value.substring(end);

      // Mengatur posisi kursor setelah tab
      textarea.selectionStart = textarea.selectionEnd = start + 1;

      // Update ngModel value
      this.detail_dampak_perubahan = textarea.value;
    }
  }
}

export { formsDA };
