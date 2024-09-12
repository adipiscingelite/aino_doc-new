import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { FormBaService } from '../../services/form-ba/form-ba.service';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import axios from 'axios';

interface Signatory {
  sign_uuid: string;
  signatory_name: string;
  signatory_position: string;
  role_sign: string;
  is_sign: boolean;
}

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

interface formsDANumber {
  da_form_number: string;
}

interface formsITCMNumber {
  itcm_form_number: string;
}

@Component({
  selector: 'app-form-ba',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './form-ba.component.html',
  styleUrls: ['./form-ba.component.css'],
})
export class FormBaComponent implements OnInit {
  isPreview: boolean = false; // State untuk menampilkan preview atau tabel

  searchText: string = '';
  user_uuid: any;
  user_name: any;
  role_code: any;

  form_uuid: string = '';
  form_number: string = '';
  form_status: string = '';

  da_form_number: string = '';
  itcm_form_number: string = '';

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

  dataListDANumber: formsDANumber[] = [];
  dataListITCMNumber: formsITCMNumber[] = [];

  dataListAllBA: formsBA[] = [];
  dataListUserBA: formsBA[] = [];
  dataListAdminBA: formsBA[] = [];

  // draft
  dataListAdminFormBADraft: formsBA[] = [];
  dataListUserFormBADraft: formsBA[] = [];

  // approved
  dataListAdminFormBAApproved: formsBA[] = [];
  dataListUserFormBAApproved: formsBA[] = [];

  // Rejected
  dataListAdminFormBARejected: formsBA[] = [];
  dataListUserFormBARejected: formsBA[] = [];

  // signature
  dataListFormBASignature: formsBA[] = [];

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalApproveOpen: boolean = false;

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
    public formBaService: FormBaService,
    private route: ActivatedRoute,
    private router: Router,
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

    this.fetchDAFormNumber();
    this.fetchITCMFormNumber();

    // draft
    this.fetchDataAdminFormBADraft();
    this.fetchDataUserFormBADraft();

    // approved
    this.fetchDataAdminFormBAApproved();
    this.fetchDataUserFormBAApproved();

    // rejected
    this.fetchDataAdminFormBARejected();
    this.fetchDataUserFormBARejected();

    this.fetchUserSignature();

    this.route.paramMap.subscribe((params) => {
      const form_uuid = params.get('form_uuid');
      if (form_uuid) {
        this.openPreviewPage(form_uuid); // Panggil fungsi dengan UUID dari URL
      }
    });
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
      .get(`${environment.apiUrl2}/admin/my/ba/division`, {
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

  fetchDAFormNumber() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        console.log('ini wir', response.data);

        if (response.data.length > 0) {
          this.dataListDANumber = response.data.map((form: any) => ({
            da_form_number: form.form_number,
          }));

          console.log('All DA forms:', this.dataListDANumber);
        } else {
          console.log('No DA forms found.');
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  fetchITCMFormNumber() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/itcm`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        console.log('ini wir', response.data);

        if (response.data.length > 0) {
          this.dataListITCMNumber = response.data.map((form: any) => ({
            itcm_form_number: form.form_number,
          }));

          console.log('All ITCM forms:', this.dataListITCMNumber);
        } else {
          console.log('No ITCM forms found.');
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  // signature
  fetchUserSignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/ba`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListFormBASignature = response.data.filter(
          (item: any) => item.form_status === 'Published'
        );
        // cuma menampilkan yg udh published aja
        console.log('wirrrrrrrrrr', response);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  //! my document yg draft
  // draft admin
  fetchDataAdminFormBADraft(): void {
    axios
      .get(`${environment.apiUrl2}/admin/my/ba/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListAdminFormBADraft = response.data.filter(
          (item: any) => item.form_status === 'Draft'
        );
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  // draft user
  fetchDataUserFormBADraft() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ba`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListUserFormBADraft = response.data.filter(
          (item: any) => item.form_status === 'Draft'
        );
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  // Publish admin
  // fetchDataAdminFormDAPublish(): void {
  //   axios
  //     .get(`${environment.apiUrl2}/admin/da/all`, {
  //       headers: {
  //         Authorization: `Bearer ${this.cookieService.get('userToken')}`,
  //       },
  //     })
  //     .then((response) => {
  //       this.dataListAdminFormDAPublish = response.data.filter(
  //         (item: any) => item.form_status === 'Published'
  //       );

  //       if (this.dataListAdminFormDAPublish.length === 0) {
  //         console.log('No published documents found for admin.');
  //       }
  //     })
  //     .catch((error) => {
  //       if (error.response.status === 500) {
  //         console.log(error.response.data);
  //       } else {
  //         console.log(error.response.data);
  //       }
  //     });
  // }

  // Publish user
  // fetchDataUserFormBAPublish() {
  //   axios
  //     .get(`${environment.apiUrl2}/api/my/form/da`, {
  //       headers: {
  //         Authorization: `Bearer ${this.cookieService.get('userToken')}`,
  //       },
  //     })
  //     .then((response) => {
  //       this.dataListUserFormBAPublish = response.data.filter(
  //         (item: any) => item.form_status === 'Published'
  //       );

  //       if (this.dataListUserFormBAPublish.length === 0) {
  //         console.log('No published documents found for user.');
  //       }
  //     })
  //     .catch((error) => {
  //       if (error.response.status === 500) {
  //         console.log(error.response.data);
  //       } else {
  //         console.log(error.response.data);
  //       }
  //     });
  // }

  // Approved admin
  fetchDataAdminFormBAApproved(): void {
    axios
      .get(`${environment.apiUrl2}/admin/ba/all`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListAdminFormBAApproved = response.data.filter(
          (item: any) => item.approval_status === 'Disetujui'
        );

        if (this.dataListAdminFormBAApproved.length === 0) {
          console.log('No approved documents found for admin.');
        }
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  // Approved user
  fetchDataUserFormBAApproved() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ba`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        console.log('approv', response);

        this.dataListUserFormBAApproved = response.data.filter(
          (item: any) => item.approval_status === 'Disetujui'
        );

        if (this.dataListUserFormBAApproved.length === 0) {
          console.log('No approved documents found for user.');
        }
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  // Rejected admin
  fetchDataAdminFormBARejected(): void {
    axios
      .get(`${environment.apiUrl2}/admin/ba/all`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListAdminFormBARejected = response.data.filter(
          (item: any) => item.approval_status === 'Tidak Disetujui'
        );

        if (this.dataListAdminFormBARejected.length === 0) {
          console.log('No Rejected documents found for admin.');
        }
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  // Rejected user
  fetchDataUserFormBARejected() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ba`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListUserFormBARejected = response.data.filter(
          (item: any) => item.approval_status === 'Tidak Disetujui'
        );
        console.log('rejec', this.dataListUserFormBARejected);

        if (this.dataListUserFormBARejected.length === 0) {
          console.log('No Rejected documents found for user.');
        }
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  openTab = 1;
  toggleTabs($tabNumber: number) {
    this.openTab = $tabNumber;
  }

  // buat popover option di tabel
  popoverIndex: number | null = null;

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
        // console.log(response.data.message);
        console.log('data: ', data);

        Swal.fire({
          icon: 'success',
          title: 'SUCCESS',
          text: response.data.message,
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });

        this.fetchAllDataBA();
        this.fetchDataAdminBA();

        this.FetchDataUserBA();
        this.fetchDocumentUUID();

        // draft
        this.fetchDataAdminFormBADraft();
        this.fetchDataUserFormBADraft();

        // approved
        this.fetchDataAdminFormBAApproved();
        this.fetchDataUserFormBAApproved();

        // rejected
        this.fetchDataAdminFormBARejected();
        this.fetchDataUserFormBARejected();

        this.fetchUserSignature();
      })
      .catch((error) => {
        // console.log(error.response.data.message);
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
      .get(`${environment.apiUrl2}/ba/${form_uuid}`)
      .then((response) => {
        console.log(response.data);
        this.isModalEditOpen = true;
        const formData = response.data.form;
        this.form_uuid = formData.form_uuid;
        this.form_number = formData.form_number;
        this.form_ticket = formData.form_ticket;
        this.form_status = formData.form_status;
        this.document_name = formData.document_name;
        // this.document_name = formData.document_name;
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

        // ini untuk edit penerima, tp masih bingung
        const signData: Signatory[] = response.data.signatories;
        signData.forEach((sign: Signatory) => {
          const role = sign.role_sign;
          if (this.signatoryPositions[role]) {
            this.signatoryPositions[role].name = sign.signatory_name;
            this.signatoryPositions[role].position = sign.signatory_position;
            this.signatoryPositions[role].is_sign = sign.is_sign;
          }
        });

        console.log('signdata', signData);

        const existingProject = this.dataListAllProject.find(
          (project) => project.project_name === formData.project_name
        );
        this.project_uuid = existingProject ? existingProject.project_uuid : '';
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
    const data = {
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
          name: this.signatoryPositions['Pemohon'].name,
          position: this.signatoryPositions['Pemohon'].position,
          role_sign: 'Pemohon',
        },
        {
          name: this.signatoryPositions['Atasan Pemohon'].name,
          position: this.signatoryPositions['Atasan Pemohon'].position,
          role_sign: 'Atasan Pemohon',
        },
        {
          name: this.signatoryPositions['Penerima'].name,
          position: this.signatoryPositions['Penerima'].position,
          role_sign: 'Penerima',
        },
        {
          name: this.signatoryPositions['Atasan Penerima'].name,
          position: this.signatoryPositions['Atasan Penerima'].position,
          role_sign: 'Atasan Penerima',
        },
      ],
    };
    console.log('yg ini udh sama sign', data);

    axios
      .put(
        `${environment.apiUrl2}/api/form/ba/update/${this.form_uuid}`,
        data,
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
        this.fetchDocumentUUID();

        // draft
        this.fetchDataAdminFormBADraft();
        this.fetchDataUserFormBADraft();

        // approved
        this.fetchDataAdminFormBAApproved();
        this.fetchDataUserFormBAApproved();

        // rejected
        this.fetchDataAdminFormBARejected();
        this.fetchDataUserFormBARejected();

        this.fetchUserSignature();
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

  publish(form_uuid: string, form_ticket: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Apakah anda yakin untuk mempublish dokumen ini? Setelah dokumen dipublish, dokumen tidak dapat dikembalikan.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, publish it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Panggil API untuk mempublish dokumen
        axios
          .put(
            `${environment.apiUrl2}/api/form/update/${form_uuid}`,
            {
              isPublished: true,
              formData: {
                form_ticket: form_ticket,
                document_uuid: this.document_uuid,
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
              text: 'Berhasil dipublish!',
              timer: 2000,
              timerProgressBar: true,
              showCancelButton: false,
              showConfirmButton: false,
            });

            // biar gausah refresh

            this.fetchAllDataBA();
            this.fetchDataAdminBA();

            this.FetchDataUserBA();
            this.fetchDocumentUUID();

            // draft
            this.fetchDataAdminFormBADraft();
            this.fetchDataUserFormBADraft();

            // approved
            this.fetchDataAdminFormBAApproved();
            this.fetchDataUserFormBAApproved();

            // rejected
            this.fetchDataAdminFormBARejected();
            this.fetchDataUserFormBARejected();

            this.fetchUserSignature();
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
    });
  }

  openPreviewPage(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/ba/${form_uuid}`)
      .then((response) => {
        console.log('ba/id', response);
        this.isPreview = true;
        this.router.navigate([`/form/ba/${form_uuid}`]);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 404) {
            // Navigasi ke halaman Not Found jika data tidak ditemukan
            this.router.navigate(['/not-found']);
          } else if (error.response.status === 500) {
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
            console.error('HTTP Error:', error.response);
          }
        } else {
          console.error('Network Error:', error);
        }
      });
  }

  closePreviewPage() {
    this.isPreview = false;

    this.router.navigate([`/form/ba`]);
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
        this.fetchDocumentUUID();

        // draft
        this.fetchDataAdminFormBADraft();
        this.fetchDataUserFormBADraft();

        // approved
        this.fetchDataAdminFormBAApproved();
        this.fetchDataUserFormBAApproved();

        // rejected
        this.fetchDataAdminFormBARejected();
        this.fetchDataUserFormBARejected();

        this.fetchUserSignature();
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

  // copy
  generateURL(form_uuid: string) {
    // Generate URL
    const url = `${window.location.origin}/form/ba/${form_uuid}`;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert('URL copied to clipboard: ' + url);
        })
        .catch((err) => {
          console.error('Failed to copy URL: ', err);
        });
    } else {
      this.fallbackCopyTextToClipboard(url);
    }
  }

  fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);

    textArea.select();
    try {
      document.execCommand('copy');
      Swal.fire({
        icon: 'success',
        title: 'SUCCESS',
        text: 'Berhasil Generate link',
        timer: 2000,
        timerProgressBar: true,
        showCancelButton: false,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('Fallback: Could not copy text', err);
    }

    document.body.removeChild(textArea);
  }
}

export { formsBA };
