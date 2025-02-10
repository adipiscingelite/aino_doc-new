import {
  Component,
  OnInit,
  Inject,
  HostListener,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
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
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import SignaturePad from 'signature_pad';
import {
  AngularEditorConfig,
  AngularEditorModule,
} from '@kolkov/angular-editor';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormStatusInfoComponent } from '../../template/form-status-info/form-status-info.component';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Signatory {
  sign_uuid: string;
  signatory_name: string;
  signatory_position: string;
  role_sign: string;
  is_sign: boolean;
  sign_img: string | { String: string };
}

interface formsITCM {
  form_uuid: string;
  form_number: string;
  formatted_form_number: string; // Tambahkan ini
  form_ticket: string;
  form_status: string;
  document_name: string;
  project_name: string;
  project_manager: string;
  approval_status: string;
  reason: string;
  created_by: string;
  created_at: string;
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularEditorModule,
    HttpClientModule,
    FormStatusInfoComponent,
  ],
  templateUrl: './form-itcm.component.html',
  styleUrls: ['./form-itcm.component.scss'],
})
export class FormItcmComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sigPad', { static: false })
  sigPad!: ElementRef<HTMLCanvasElement>;
  @ViewChild('modal', { static: false }) modal!: ElementRef<HTMLDivElement>;
  @ViewChild('closeButton', { static: false })
  closeButton!: ElementRef<HTMLButtonElement>;

  private signaturePad!: SignaturePad;
  img: string | null = null;
  penColor: string = '#262626'; // Default pen color

  ngAfterViewInit() {
    const canvas = this.sigPad.nativeElement;

    // Initialize SignaturePad
    this.signaturePad = new SignaturePad(canvas);
    this.signaturePad.penColor = this.penColor;

    // Resize canvas to fit the container
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));

    if (this.closeButton) {
      this.closeButton.nativeElement.addEventListener('click', () =>
        this.closeModal()
      );
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
    if (this.closeButton) {
      this.closeButton.nativeElement.removeEventListener('click', () =>
        this.closeModal()
      );
    }
  }

  clear() {
    this.signaturePad.clear();
    this.img = null; // Clear the img property when the canvas is cleared
  }

  save() {
    const dataURL = this.sigPad.nativeElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'signature.png';
    link.click();
  }

  onColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.penColor = input.value;
    this.signaturePad.penColor = this.penColor;
  }

  private resizeCanvas() {
    const canvas = this.sigPad.nativeElement;
    const container = canvas.parentElement as HTMLElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    this.signaturePad.clear(); // Clear the canvas to fit new size
  }

  searchText: string = '';

  isPreview: boolean = false; // State untuk menampilkan preview atau tabel
  form!: FormGroup;

  user_uuid: any;
  user_name: any;
  role_code: any;
  personal_name: string = '';

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
  reason: string = '';

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
  sanitizedDescription: SafeHtml = '';

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

  is_approve: boolean | null = null;
  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalApproveOpen: boolean = false;

  popoverIndex: number | null = null;

  isSigned: boolean = false;
  mySignatory: Signatory | undefined;

  signatoryPositions: {
    [key: string]: {
      name: string;
      position: string;
      is_sign: boolean;
      sign_img: string;
    };
  } = {
    Pemohon: { name: '', position: '', is_sign: false, sign_img: '' },
    'Atasan Pemohon': { name: '', position: '', is_sign: false, sign_img: '' },
    Penerima: { name: '', position: '', is_sign: false, sign_img: '' },
    'Atasan Penerima': { name: '', position: '', is_sign: false, sign_img: '' },
  };

  totalMyDocument: number = 0;
  totalDraft: number = 0;
  totalMySignature: number = 0;
  totalApproved: number = 0;
  totalRejected: number = 0;

  constructor(
    private cookieService: CookieService,
    private fb: FormBuilder,
    public formItcmService: FormItcmService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  dataListDocument: Documents[] = [];
  dataListProject: Projects[] = [];

  dataListFormITCM: formsITCM[] = [];
  dataListFormAdminITCM: formsITCM[] = [];
  dataListFormUserITCM: formsITCM[] = [];

  // draft
  dataListAdminFormITCMDraft: formsITCM[] = [];
  dataListUserFormITCMDraft: formsITCM[] = [];

  dataListFormITCMSignature: formsITCM[] = [];

  // publish
  // dataListAdminFormDAPublish: formsITCM[] = [];
  // dataListUserFormDAPublish: formsITCM[] = [];

  // approved
  dataListAdminFormITCMApproved: formsITCM[] = [];
  dataListUserFormITCMApproved: formsITCM[] = [];

  // Rejected
  dataListAdminFormITCMRejected: formsITCM[] = [];
  dataListUserFormITCMRejected: formsITCM[] = [];

  async ngOnInit(): Promise<void> {
    // ? mendapatkan role code
    await this.profileData();
    if (this.role_code === 'SA') {
      this.superAdminOnly();
      // console.log('superadmin woi');
    } else if (this.role_code === 'A') {
      this.adminOnly();
      // console.log('admin woi');
    } else if (this.role_code === 'M') {
      this.userOnly();
      // console.log('member woi');
    }

    // ? fetch untuk ADD dan EDIT
    this.fetchAllUser();
    this.fetchAllDocument();
    this.fetchAllProject();
    this.fetchDocumentUUID();

    // ? fetch signature setiap user
    this.fetchUserSignature();

    // ? untuk membuka preview
    this.route.paramMap.subscribe((params) => {
      const form_uuid = params.get('form_uuid');
      if (form_uuid) {
        this.openPreviewPage(form_uuid);
      }
    });
  }

  superAdminOnly() {
    // document
    this.fetchDataFormITCM();
  }

  adminOnly() {
    // document
    this.fetchDataAdminFormITCM();
    // draft
    this.fetchDataAdminFormITCMDraft();
    // approve
    this.fetchDataAdminFormITCMApproved();
    // rejected
    this.fetchDataAdminFormITCMRejected();
  }

  userOnly() {
    // document
    this.fetchDataUserFormITCM();
    // draft
    this.fetchDataUserFormITCMDraft();
    // approve
    this.fetchDataUserFormITCMApproved();
    // rejected
    this.fetchDataUserFormITCMRejected();
  }

  // * untuk tabel
  get dataMyDocument(): formsITCM[] {
    if (this.role_code === 'SA') {
      return this.dataListFormITCM;
    } else if (this.role_code === 'A') {
      return this.dataListFormAdminITCM;
    } else if (this.role_code === 'M') {
      return this.dataListFormUserITCM;
    }

    return [];
  }

  get dataFormITCMDraft(): formsITCM[] {
    if (this.role_code === 'SA') {
      return this.dataListAdminFormITCMDraft;
    } else if (this.role_code === 'A') {
      return this.dataListAdminFormITCMDraft;
    } else if (this.role_code === 'M') {
      return this.dataListUserFormITCMDraft;
    }

    return [];
  }

  // get dataFormITCMSignature(): formsITCM[] {
  //   return ''
  // }

  get dataFormITCMApproved(): formsITCM[] {
    if (this.role_code === 'A') {
      return this.dataListAdminFormITCMApproved;
    } else if (this.role_code === 'M') {
      return this.dataListUserFormITCMApproved;
    }

    return [];
  }

  get dataFormITCMRejected(): formsITCM[] {
    if (this.role_code === 'A') {
      return this.dataListAdminFormITCMRejected;
    } else if (this.role_code === 'M') {
      return this.dataListUserFormITCMRejected;
    }

    return [];
  }

  matchesSearch(item: formsITCM): boolean {
    const searchText = this.searchText.toLowerCase();
    return (
      item.form_number.toLowerCase().includes(searchText) ||
      item.form_ticket.toLowerCase().includes(searchText) ||
      item.document_name.toLowerCase().includes(searchText) ||
      item.project_name.toLowerCase().includes(searchText) ||
      item.project_manager.toLowerCase().includes(searchText) ||
      item.no_da.toLowerCase().includes(searchText)
      // item.nama_pemohon.toLowerCase().includes(searchText) ||
      // item.instansi.toLowerCase().includes(searchText) ||
      // item.tanggal.toLowerCase().includes(searchText) ||
      // item.perubahan_aset.toLowerCase().includes(searchText) ||
      // item.deskripsi.toLowerCase().includes(searchText)
    );
  }

  async profileData(): Promise<void> {
    const token = this.cookieService.get('userToken');

    try {
      const response = await axios.get(`${this.apiUrl}/auth/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.user_uuid = response.data.user_uuid;
      this.user_name = response.data.user_name;
      this.role_code = response.data.role_code;
      this.personal_name = response.data.personal_name;
      console.log('personal name: ', this.personal_name);
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        if (error.response?.status === 500 || error.response?.status === 404) {
          console.log(error.response.data);
        }
      } else {
        console.error('Unexpected error:', error);
      }
    }
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
      .get(`${environment.apiUrl2}/admin/my/itcm/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListFormAdminITCM = response.data;
        this.totalMyDocument =
          response.data && Array.isArray(response.data)
            ? response.data.length
            : 0;
        console.log('ini laa', response.data);
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
        this.totalMyDocument =
          response.data && Array.isArray(response.data)
            ? response.data.length
            : 0;
        // console.log(response.data);
        console.table('ini woi', response.data);
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  // signature
  fetchUserSignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/itcm`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListFormITCMSignature = response.data.filter(
          (item: any) => item.form_status === 'Published'
        );

        this.totalMySignature = this.dataListFormITCMSignature.length;
        // cuma menampilkan yg udh published aja
        // console.log('wirrrrrrrrrr', response);
      })
      .catch((error) => {
        if (error.response) {
          // Jika error response ada, cek statusnya
          if (error.response.status === 500) {
            console.log(error.response.data);
          } else {
            console.log(error.response.data);
          }
        } else {
          // Jika error response tidak ada, log error keseluruhan
          // console.log('Error: ', error.message || error);
        }
      });
  }

  //! my document yg draft
  // draft admin
  fetchDataAdminFormITCMDraft(): void {
    axios
      .get(`${environment.apiUrl2}/admin/my/itcm/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListAdminFormITCMDraft = response.data.filter(
          (item: any) => item.form_status === 'Draft'
        );

        this.totalDraft = this.dataListAdminFormITCMDraft.length;
      })
      .catch((error) => {
        if (error.response) {
          // Jika error response ada, cek statusnya
          if (error.response.status === 500) {
            console.log(error.response.data);
          } else {
            console.log(error.response.data);
          }
        } else {
          // Jika error response tidak ada, log error keseluruhan
          console.log('Error: ', error.message || error);
        }
      });
  }

  // draft user
  fetchDataUserFormITCMDraft() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/itcm`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListUserFormITCMDraft = response.data.filter(
          (item: any) => item.form_status === 'Draft'
        );

        this.totalDraft = this.dataListUserFormITCMDraft.length;
      })
      .catch((error) => {
        if (error.response) {
          // Jika error response ada, cek statusnya
          if (error.response.status === 500) {
            console.log(error.response.data);
          } else {
            console.log(error.response.data);
          }
        } else {
          // Jika error response tidak ada, log error keseluruhan
          console.log('Error: ', error.message || error);
        }
      });
  }

  // Approved admin
  fetchDataAdminFormITCMApproved(): void {
    axios
      .get(`${environment.apiUrl2}/admin/itcm/all`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListAdminFormITCMApproved = response.data.filter(
          (item: any) => item.approval_status === 'Disetujui'
        );

        this.totalApproved = this.dataListAdminFormITCMApproved.length;

        if (this.dataListAdminFormITCMApproved.length === 0) {
          console.log('No approved documents found for admin.');
        }
      })
      .catch((error) => {
        if (error.response) {
          // Jika error response ada, cek statusnya
          if (error.response.status === 500) {
            console.log(error.response.data);
          } else {
            console.log(error.response.data);
          }
        } else {
          // Jika error response tidak ada, log error keseluruhan
          console.log('Error: ', error.message || error);
        }
      });
  }

  // Approved user
  fetchDataUserFormITCMApproved() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/itcm`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListUserFormITCMApproved = response.data.filter(
          (item: any) => item.approval_status === 'Disetujui'
        );

        this.totalApproved = this.dataListUserFormITCMApproved.length;

        if (this.dataListUserFormITCMApproved.length === 0) {
          console.log('No approved documents found for user.');
        }
      })
      .catch((error) => {
        if (error.response) {
          // Jika error response ada, cek statusnya
          if (error.response.status === 500) {
            console.log(error.response.data);
          } else {
            console.log(error.response.data);
          }
        } else {
          // Jika error response tidak ada, log error keseluruhan
          console.log('Error: ', error.message || error);
        }
      });
  }

  // Rejected admin
  fetchDataAdminFormITCMRejected(): void {
    axios
      .get(`${environment.apiUrl2}/admin/itcm/all`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListAdminFormITCMRejected = response.data.filter(
          (item: any) => item.approval_status === 'Tidak Disetujui'
        );

        this.totalRejected = this.dataListAdminFormITCMRejected.length;

        if (this.dataListAdminFormITCMRejected.length === 0) {
          console.log('No Rejected documents found for admin.');
        }
      })
      .catch((error) => {
        if (error.response) {
          // Jika error response ada, cek statusnya
          if (error.response.status === 500) {
            console.log(error.response.data);
          } else {
            console.log(error.response.data);
          }
        } else {
          // Jika error response tidak ada, log error keseluruhan
          console.log('Error: ', error.message || error);
        }
      });
  }

  // Rejected user
  fetchDataUserFormITCMRejected() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/itcm`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListUserFormITCMRejected = response.data.filter(
          (item: any) => item.approval_status === 'Tidak Disetujui'
        );

        this.totalRejected = this.dataListUserFormITCMRejected.length;

        if (this.dataListUserFormITCMRejected.length === 0) {
          console.log('No Rejected documents found for user.');
        }
      })
      .catch((error) => {
        if (error.response) {
          // Jika error response ada, cek statusnya
          if (error.response.status === 500) {
            console.log(error.response.data);
          } else {
            console.log(error.response.data);
          }
        } else {
          // Jika error response tidak ada, log error keseluruhan
          console.log('Error: ', error.message || error);
        }
      });
  }

  openTab = 1;
  toggleTabs($tabNumber: number) {
    this.openTab = $tabNumber;
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
    this.closePopover();
  }
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeAddModal();
      this.closeEditModal();
      this.closeApproveModal();
      console.log('Modals closed');
    }
  }

  sortKey: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  sortData(dataList: formsITCM[], key: keyof formsITCM) {
    // Check if the current sort is on the same key
    if (this.sortKey === key) {
      // Toggle sort order
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortOrder = 'asc'; // Default to ascending if new key is selected
    }
    this.sortKey = key;

    // Perform sorting on the provided dataList array
    dataList.sort((a, b) => {
      const itemA = a[key]?.toString().toLowerCase() || '';
      const itemB = b[key]?.toString().toLowerCase() || '';

      if (itemA < itemB) return this.sortOrder === 'asc' ? -1 : 1;
      if (itemA > itemB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: false,
    height: 'auto',
    minHeight: '12',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: 'Arial',
    defaultFontSize: '2',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'georgia', name: 'Georgia' },
      { class: 'helvetica', name: 'Helvetica' },
      { class: 'myriad-pro', name: 'Myriad Pro' },
    ],
    // customClasses: [
    //   {
    //     name: 'quote',
    //     class: 'quote',
    //   },
    //   {
    //     name: 'redText',
    //     class: 'redText',
    //   },
    //   {
    //     name: 'titleText',
    //     class: 'titleText',
    //     tag: 'h1',
    //   },
    // ],
    toolbarHiddenButtons: [
      // ['underline']  // This hides the Underline button
    ],
  };

  openAddModal() {
    this.form_ticket = '';
    this.no_da = '';
    this.project_name = '';
    this.nama_pemohon = '';
    this.instansi = '';
    this.tanggal = '';
    this.perubahan_aset = '';
    this.deskripsi = '';

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
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
          },
        }
      )
      .then((response) => {
        console.log(FormData);
        // console.log(data_itcm);

        // fetch setelah add biar gausah refresh
        this.fetchUserSignature();
        if (this.role_code === 'A') {
          this.adminOnly();
        } else if (this.role_code === 'M') {
          this.userOnly();
        }

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
    // this.fetchDocumentUUID()
    // console.log('Document UUID 2:', this.document_uuid);
    axios
      .get(`${environment.apiUrl2}/itcm/${form_uuid}`)
      .then((response) => {
        console.log(response.data);
        // console.log('plis laah', response.data.form.document_uuid);

        this.isModalEditOpen = true;
        const formData = response.data.form;
        this.form_uuid = formData.form_uuid;
        this.document_uuid = this.document_uuid;
        this.form_ticket = formData.form_ticket;
        this.no_da = formData.no_da;
        this.project_name = formData.project_name;
        this.nama_pemohon = formData.nama_pemohon;
        this.instansi = formData.instansi;
        this.tanggal = formData.tanggal;
        this.perubahan_aset = formData.perubahan_aset;
        // this.deskripsi = formData.deskripsi;
        // this.setDeskripsi(formData.deskripsi); // Memanggil metode setDeskripsi
        this.deskripsi = formData.deskripsi;

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

        const existingProject = this.dataListProject.find(
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
        }
      });
  }

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateFormITCM() {
    const data = {
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
    console.log('ini sama sign', data);
    axios
      .put(
        `${environment.apiUrl2}/api/form/itcm/update/${this.form_uuid}`,
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

        // fetch setelah add biar gausah refresh
        this.fetchUserSignature();
        if (this.role_code === 'A') {
          this.adminOnly();
        } else if (this.role_code === 'M') {
          this.userOnly();
        }
      })
      .catch((error) => {
        if (
          error.response.status === 404 ||
          error.response.status === 500 ||
          error.response.status === 422 ||
          error.response.status === 400
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

            // fetch setelah add biar gausah refresh
            this.fetchUserSignature();
            if (this.role_code === 'A') {
              this.adminOnly();
            } else if (this.role_code === 'M') {
              this.userOnly();
            }
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

  setDeskripsi(description: string) {
    // Sanitasi konten HTML menggunakan DomSanitizer
    this.sanitizedDescription =
      this.sanitizer.bypassSecurityTrustHtml(description);
  }

  async openPreviewPage(form_uuid: string) {
    await this.profileData();
    axios
      .get(`${environment.apiUrl2}/itcm/${form_uuid}`)
      .then((response) => {
        const BASE_URL = environment.apiUrl2;
        // $('#detailModalDA').modal('show');
        console.log('ada sign img', response);        
        const formData = response.data.form;
        this.form_uuid = formData.form_uuid;
        this.created_at = formData.created_at;
        this.form_ticket = formData.form_ticket;
        this.form_status = formData.form_status;
        this.nama_pemohon = formData.nama_pemohon;
        this.instansi = formData.instansi;
        this.formatted_form_number = formData.formatted_form_number;
        this.no_da = formData.no_da;
        this.document_name = formData.document_name;
        this.project_name = formData.project_name;
        this.project_manager = formData.project_manager;
        this.perubahan_aset = formData.perubahan_aset;
        this.setDeskripsi(formData.deskripsi); // Memanggil metode setDeskripsi
        this.approval_status = formData.approval_status;
        this.isPreview = true;
        this.router.navigate([`/form/itcm/${form_uuid}`]);

        console.log('dokumen uuid dari preview ini', this.form_uuid);

        const signatories: Signatory[] = response.data.signatories || [];
        Object.keys(this.signatoryPositions).forEach((role) => {
          this.signatoryPositions[role] = {
            name: '',
            position: '',
            is_sign: false,
            sign_img: '',
          };
        });
        signatories.forEach((signatory: Signatory) => {
          const role = signatory.role_sign;
          if (this.signatoryPositions[role]) {
            this.signatoryPositions[role] = {
              name: signatory.signatory_name || '',
              position: signatory.signatory_position || '',
              is_sign: signatory.is_sign || false,
              sign_img:
                typeof signatory.sign_img === 'object' &&
                'String' in signatory.sign_img
                  ? BASE_URL + signatory.sign_img.String
                  : BASE_URL + signatory.sign_img,
            };
          }
        });

        if (signatories && signatories.length > 0) {
          this.mySignatory = signatories.find(
            (signatory: Signatory) =>
              signatory?.signatory_name?.trim().toLowerCase() === this.personal_name?.trim().toLowerCase()
          );
        
          console.log('plis', this.mySignatory);
        
          if (this.mySignatory) {
            console.log('Sign UUID:', this.mySignatory.sign_uuid);
            this.isSigned = this.mySignatory.is_sign;
          } else {
            console.log(
              'Signatory not found for personal_name:',
              this.personal_name
            );
          }
        } else {
          console.log('Signatories array is empty or undefined');
        }
        
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

    this.router.navigate([`/form/itcm`]);
  }

  openApproveModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/itcm/${form_uuid}`)
      .then((response) => {
        console.log(response);
        const formData = response.data.form;
        this.created_at = formData.created_at;
        this.form_ticket = formData.form_ticket;
        // this.formatted_form_number = formData.formatted_form_number;
        this.form_uuid = formData.form_uuid;

        this.isModalApproveOpen = true;
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

  closeApproveModal() {
    this.isModalApproveOpen = false;
  }

  approveForm(form_uuid: string) {
    const formData = {
      is_approve: this.is_approve,
      reason: this.is_approve ? '' : this.reason,
    };

    axios
      .put(
        `${environment.apiUrl2}/api/form/approval/${form_uuid}`,
        formData, // Send the correct form data
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
        this.fetchDataFormITCM();
        this.fetchDataAdminFormITCM();
        this.fetchDataUserFormITCM();
        this.isModalApproveOpen = false;
        this.openPreviewPage(form_uuid);
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
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });

        // fetch setelah add biar gausah refresh
        this.fetchUserSignature();
        if (this.role_code === 'A') {
          this.adminOnly();
        } else if (this.role_code === 'M') {
          this.userOnly();
        }
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

  openModal(form_uuid: string) {
    this.form_uuid = form_uuid;
    if (this.modal) {
      this.modal.nativeElement.classList.add('scale-100');
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.nativeElement.classList.remove('scale-100');
    }
    this.clear();
  }

  signature(form_uuid: string) {
    const dataURL = this.sigPad.nativeElement.toDataURL('image/png'); // Get the signature image

    axios.get(`${environment.apiUrl2}/itcm/${form_uuid}`).then((response) => {
      const signatories: Signatory[] = response.data.signatories || [];

      Object.keys(this.signatoryPositions).forEach((role) => {
        this.signatoryPositions[role] = {
          name: '',
          position: '',
          is_sign: false,
          sign_img: '', // Initially empty
        };
      });

      signatories.forEach((signatory: Signatory) => {
        const role = signatory.role_sign;
        if (this.signatoryPositions[role]) {
          this.signatoryPositions[role] = {
            name: signatory.signatory_name || '',
            position: signatory.signatory_position || '',
            is_sign: signatory.is_sign || false,
            sign_img:
              typeof signatory.sign_img === 'string'
                ? signatory.sign_img
                : (signatory.sign_img as { String: string }).String || '',
          };
        }
      });

      const mySignatory = signatories.find(
        (signatory: Signatory) =>
          signatory.signatory_name === this.personal_name
      );

      if (mySignatory) {
        console.log('Signatory details:', mySignatory);
        console.log('Sign UUID:', mySignatory.sign_uuid);

        // Prepare payload to send, including the signature image
        const payload = {
          name: mySignatory.signatory_name,
          position: mySignatory.signatory_position,
          is_sign: true,
          sign_img: dataURL, // Include the Base64 signature image
        };

        // Send the update to the backend
        this.onSignature(mySignatory.sign_uuid, payload);
      } else {
        console.log(
          'Signatory not found for personal_name:',
          this.personal_name
        );
      }
    });
  }

  onSignature(sign_uuid: string, payload: any) {
    console.log('pailod', payload);

    axios
      .put(
        `${environment.apiUrl2}/api/signature/update/${sign_uuid}`,
        payload, // Send the entire payload with image
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

        this.closeModal();

        // tambah ini biar setelah add ga perlu refresh agar bisa muncul
        this.fetchDataFormITCM();
        this.fetchDataAdminFormITCM();
        this.fetchDataUserFormITCM();
        this.fetchDataAdminFormITCMDraft();
        this.fetchDataUserFormITCMDraft();
        // this.fetchDataAdminFormPublish();
        // this.fetchDataUserFormPublish();
        this.fetchUserSignature();
        this.openPreviewPage(this.form_uuid);
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
  }

  // copy
  generateURL(form_uuid: string) {
    // Generate URL
    const url = `${window.location.origin}/form/itcm/${form_uuid}`;

    // Cek jika navigator.clipboard tersedia (fitur modern)
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
      // Fallback jika navigator.clipboard tidak tersedia
      this.fallbackCopyTextToClipboard(url);
    }
  }

  fallbackCopyTextToClipboard(text: string) {
    // Buat elemen textarea untuk memegang URL
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Sembunyikan textarea di luar layar
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);

    // Pilih teks dan salin
    textArea.select();
    try {
      document.execCommand('copy');
      //  alert('URL copied to clipboard: ' + text);
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

    // Hapus elemen textarea setelah menyalin
    document.body.removeChild(textArea);
  }

  fetchDataAndGeneratePDF(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/itcm/${form_uuid}`)
      .then((response) => {
        const BASE_URL = environment.apiUrl2;
        const formData = response.data.form;
        const signatories = response.data.signatories || [];
  
        // Menyimpan data form
        this.form_uuid = formData.form_uuid;
        this.created_at = formData.created_at;
        this.form_ticket = formData.form_ticket;
        this.form_status = formData.form_status;
        this.nama_pemohon = formData.nama_pemohon;
        this.instansi = formData.instansi;
        this.formatted_form_number = formData.formatted_form_number;
        this.no_da = formData.no_da;
        this.document_name = formData.document_name;
        this.project_name = formData.project_name;
        this.project_manager = formData.project_manager;
        this.perubahan_aset = formData.perubahan_aset;
        this.setDeskripsi(formData.deskripsi);
        this.approval_status = formData.approval_status;
        this.isPreview = true;
        this.router.navigate([`/form/itcm/${form_uuid}`]);
  
        // Menyimpan data signatories
        Object.keys(this.signatoryPositions).forEach((role) => {
          this.signatoryPositions[role] = {
            name: '',
            position: '',
            is_sign: false,
            sign_img: '',
          };
        });
  
        signatories.forEach((signatory: Signatory) => {
          const role = signatory.role_sign;
          if (this.signatoryPositions[role]) {
            this.signatoryPositions[role] = {
              name: signatory.signatory_name || '',
              position: signatory.signatory_position || '',
              is_sign: signatory.is_sign || false,
              sign_img: BASE_URL + signatory.sign_img,
            };
          }
        });
  
        // Cek apakah user memiliki tanda tangan di signatories
        const mySignatory = signatories.find(
          (signatory:Signatory) => signatory.signatory_name === this.personal_name
        );
        this.isSigned = mySignatory ? mySignatory.is_sign : false;
  
        // Generate PDF dengan data dari API
        this.generatePDF2(formData, signatories);
      })
      .catch((error) => {
        console.error('Gagal mengambil data:', error);
      });
  }
  


  generatePDF2(formData: any, signatories: any) {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const BASE_URL = environment.apiUrl2;
    const pageHeight = doc.internal.pageSize.height;
    let y = 50;
    let currentY = 45;
    console.log('ppaa', formData)

    const imgPath = 'assets/images/aino.png';

    const addHeader = (doc: jsPDF, pageNumber: number) => {
      doc.setFont('helvetica', 'bold');

      const tableWidth = doc.internal.pageSize.width * 0.9;
      const tableX = (doc.internal.pageSize.width - tableWidth) / 2;
      const tableY = 10;
      const boxHeight2 = 20;

      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(tableX, tableY, tableWidth, boxHeight2);

      const boxWidth2 = tableWidth / 3;

      const imgWidth = 40;
      const imgHeight = 13;
      const imgX1 = tableX + (boxWidth2 - imgWidth) / 2;
      const imgY1 = tableY + (boxHeight2 - imgHeight) / 2;

      try {
        doc.addImage(imgPath, 'PNG', imgX1, imgY1, imgWidth, imgHeight);
      } catch (error) {
        console.error('Gagal menambahkan gambar:', error);
      }

      doc.rect(tableX + boxWidth2, tableY, boxWidth2, boxHeight2);
      doc.setFontSize(12);
      const textX2 = tableX + boxWidth2 + boxWidth2 / 2;
      const textY2 = tableY + boxHeight2 / 2;
      doc.text('FORMULIR PENGELOLAAN', textX2, textY2 - 5, { align: 'center' });
      doc.text('PERUBAHAN TI', textX2, textY2 + 5, { align: 'center' });

      doc.rect(tableX + 2 * boxWidth2, tableY, boxWidth2, boxHeight2);
      doc.setFontSize(9);
      const labelX3 = tableX + 2 * boxWidth2 + 2;
      const valueX3 = tableX + 2 * boxWidth2 + 28;
      let textY3 = tableY + boxHeight2 / 2 - 6;

      doc.text('No. Dokumen', labelX3, textY3);
      doc.text(`': 0007/GA/PP/XI/2024'`, valueX3, textY3);
      textY3 += 6;
      doc.text('Tanggal Terbit', labelX3, textY3);
      doc.text(': 01/02/2025', valueX3, textY3);
      textY3 += 6;
      doc.text('No. Revisi', labelX3, textY3);
      doc.text(': 01', valueX3, textY3);
    };

    let pageNumber = 1;
    addHeader(doc, pageNumber);

    doc.setFontSize(10);
    doc.setFont('helvetica', '', 700);
    const titleText =
      'FORMULIR PENGELOLAAN PERUBAHAN TI (IT CHANGE MANAGEMENT)';
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
    doc.text(titleText, titleX, currentY);
    currentY += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', '', 700);
    const nomorText = `Nomor : ${formData.formatted_form_number}`;
    const nomorWidth = doc.getTextWidth(nomorText);
    const nomorX = (doc.internal.pageSize.width - nomorWidth) / 2;
    doc.text(nomorText, nomorX, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');

    const lineWidth = (210 * 80) / 100;
    doc.setLineWidth(0.3);
    const lineX = (doc.internal.pageSize.width - lineWidth) / 2;
    doc.line(lineX, currentY, lineX + lineWidth, currentY);
    currentY += 10;

    doc.text('No. Form Dampak Analisa', 10, currentY);
    doc.text(`: ${formData.no_da}`, 60, currentY);
    currentY += 5;
    doc.text('Nama Product/Project', 10, currentY);
    doc.text(`: ${formData.project_name}`, 60, currentY);
    currentY += 5;
    doc.text('Product/Project Manager', 10, currentY);
    doc.text(`: ${formData.project_manager}`, 60, currentY);
    currentY += 10;

    doc.text('Nama Pemohon', 10, currentY);
    doc.text(`: ${formData.nama_pemohon}`, 60, currentY);
    currentY += 5;
    doc.text('Divisi', 10, currentY);
    doc.text(`: ${formData.instansi}`, 60, currentY);
    currentY += 5;
    const datePipe = new DatePipe('en-US');
    const formattedDate = datePipe.transform(formData.created_at, 'dd MMMM yyyy');
    
    doc.text('Tanggal', 10, currentY);
    doc.text(`: ${formattedDate}`, 60, currentY);
    
    currentY += 10;

    const checkSpaceAndAddPage = (doc: jsPDF, requiredSpace: number) => {
      if (currentY + requiredSpace > pageHeight - 10) {
        doc.addPage();
        pageNumber++;
        addHeader(doc, pageNumber);
        doc.setFont('helvetica', 'normal');
        currentY = 50;
      }
    };

    const addTextWithBox = (
      doc: jsPDF,
      title: string,
      text: string,
      spaceAfter = 10
    ) => {
      const boxWidth = doc.internal.pageSize.width * 0.9;
      const boxX = (doc.internal.pageSize.width - boxWidth) / 2;
      const boxPadding = 5;
      const titleBoxHeight = 7;
      const minContentHeight = 10; // Tambahkan tinggi minimum agar teks tidak bertabrakan

      checkSpaceAndAddPage(doc, titleBoxHeight);
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(boxX, currentY, boxWidth, titleBoxHeight);
      doc.setFontSize(10);
      doc.text(
        title,
        doc.internal.pageSize.width / 2,
        currentY + titleBoxHeight / 2 + 1,
        { align: 'center' }
      );
      currentY += titleBoxHeight;

      let spaceLeft = pageHeight - currentY - boxPadding;
      const textLines = doc.splitTextToSize(text, boxWidth - boxPadding * 2);
      let remainingText = textLines;

      while (remainingText.length > 0) {
        let maxLines = Math.floor(spaceLeft / 5);
        let pageText = remainingText.slice(0, maxLines);
        remainingText = remainingText.slice(maxLines);

        // Pastikan ada minimal tinggi agar teks tidak menempel ke border bawah
        let contentBoxHeight = Math.max(pageText.length * 5, minContentHeight);

        doc.rect(boxX, currentY, boxWidth, contentBoxHeight);
        doc.text(pageText, boxX + boxPadding, currentY + boxPadding);
        currentY += contentBoxHeight;
        spaceLeft = pageHeight - currentY - boxPadding;

        if (remainingText.length > 0) {
          checkSpaceAndAddPage(doc, titleBoxHeight);
          doc.setFontSize(10);
          spaceLeft = pageHeight - currentY - boxPadding;
        }
      }

      currentY += spaceAfter;
    };

    addTextWithBox(
      doc,
      'Perubahan Aset yang diusulkan:',
      formData.perubahan_aset
    );
    addTextWithBox(
      doc,
      'Deskripsi Perubahan yang diusulkan:',
      formData.deskripsi
    );

    const addStatusBox = (doc: jsPDF, approval_status: string) => {
      const boxWidth = doc.internal.pageSize.width * 0.9;
      const boxX = (doc.internal.pageSize.width - boxWidth) / 2;
      const boxHeight = 40;
    
      checkSpaceAndAddPage(doc, boxHeight + 10);
    
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.rect(boxX, currentY, boxWidth, boxHeight);
    
      const leftBoxWidth = boxWidth / 2;
      const leftBoxHeight = boxHeight;
      doc.rect(boxX, currentY, leftBoxWidth, leftBoxHeight);
    
      doc.setFontSize(10);
      doc.text(
        'Status Pengajuan: (Berikan alasan apabila not approve)',
        boxX + 5,
        currentY + boxHeight / 2
      );
    
      const rightBoxWidth = boxWidth / 2;
      const rightBoxHeight = boxHeight;
      doc.rect(boxX + leftBoxWidth, currentY, rightBoxWidth, rightBoxHeight);
      const innerBoxHeight = rightBoxHeight / 2;
    
      doc.setFont('helvetica', 'bold');
      doc.rect(
        boxX + leftBoxWidth,
        currentY,
        rightBoxWidth / 2,
        innerBoxHeight
      );
      doc.text(
        'Approve',
        boxX + leftBoxWidth + rightBoxWidth / 4,
        currentY + innerBoxHeight / 2,
        { align: 'center' }
      );
    
      doc.rect(
        boxX + leftBoxWidth + rightBoxWidth / 2,
        currentY,
        rightBoxWidth / 2,
        innerBoxHeight
      );
      doc.text(
        'Not Approve',
        boxX + leftBoxWidth + (rightBoxWidth / 4) * 3,
        currentY + innerBoxHeight / 2,
        { align: 'center' }
      );
    
      // Cek status approval
      const isApproved = approval_status === "Disetujui";
      const isNotApproved = approval_status === "Tidak Disetujui";
    
      doc.setFont('helvetica', 'normal');
      doc.rect(
        boxX + leftBoxWidth,
        currentY + innerBoxHeight,
        rightBoxWidth / 2,
        innerBoxHeight
      );
      doc.text(
        isApproved ? '✅' : '',
        boxX + leftBoxWidth + rightBoxWidth / 4,
        currentY + innerBoxHeight + innerBoxHeight / 2,
        { align: 'center' }
      );
    
      doc.rect(
        boxX + leftBoxWidth + rightBoxWidth / 2,
        currentY + innerBoxHeight,
        rightBoxWidth / 2,
        innerBoxHeight
      );
      doc.text(
        isNotApproved ? '✅' : '',
        boxX + leftBoxWidth + (rightBoxWidth / 4) * 3,
        currentY + innerBoxHeight + innerBoxHeight / 2,
        { align: 'center' }
      );
    
      currentY += boxHeight + 10;
    };
    
    // Contoh pemanggilan fungsi
    addStatusBox(doc, formData.approval_status);  // Ganti dengan status yang diinginkan
    
    if (formData.approval_status === 'Tidak Disetujui' && formData.reason.Valid) {
      addTextWithBox(doc, 'Alasan tidak approve:', formData.reason.String);
    }
    
    

    const addSignatureTable = (doc: jsPDF): void => {
      const tableWidth: number = doc.internal.pageSize.width * 0.9;
      const tableX: number = (doc.internal.pageSize.width - tableWidth) / 2;
      const rowHeight: number = 50;
      const colWidth: number = tableWidth / 4;
      
      
      checkSpaceAndAddPage(doc, rowHeight + 10);

      // Ukuran gambar dengan rasio 2:1
      const imageWidth: number = 40;  // Lebar gambar
      const imageHeight: number = 20; // Tinggi gambar
    
      // Mapping posisi tanda tangan berdasarkan role_sign
      const signatoryMap: { [key: string]: number } = {
        'Pemohon': 0,
        'Atasan Pemohon': 1,
        'Penerima': 2,
        'Atasan Penerima': 3
      };
    
      // Inisialisasi array dengan posisi tetap
      const formattedSignatories: Signatory[] = new Array(4).fill(null).map(() => ({
        sign_uuid: '',
        signatory_name: '',
        signatory_position: '',
        role_sign: '',
        is_sign: false,
        sign_img: ''
      }));
    
      // Masukkan signatories ke dalam urutan yang benar
      signatories.forEach((signatory: Signatory) => {
        const index = signatoryMap[signatory.role_sign]; // Cari index berdasarkan role_sign
        if (index !== undefined) {
          formattedSignatories[index] = signatory;
        }
      });
    
      // Header Kolom
      const headers: string[] = ['Pemohon', 'Atasan Pemohon', 'Penerima', 'Atasan Penerima'];
      doc.setFont('helvetica', 'bold');
      headers.forEach((header: string, i: number) => {
        const x: number = tableX + i * colWidth;
        doc.rect(x, currentY, colWidth, 10);
        doc.text(header, x + colWidth / 2, currentY + 7, { align: 'center' });
      });
    
      // Box tanda tangan
      currentY += 10;
      headers.forEach((_header: string, i: number) => {
        const x: number = tableX + i * colWidth;
        doc.rect(x, currentY, colWidth, rowHeight);
      });
    
      // Tambahkan tanda tangan, nama, dan jabatan
      currentY += 5;
      formattedSignatories.forEach((signatory, i) => {
        const x: number = tableX + i * colWidth;
        const imageY = currentY + 1;
    
        // Ambil nilai sign_img yang benar
        const signImg = typeof signatory.sign_img === 'string' 
          ? signatory.sign_img 
          : signatory.sign_img?.String || '';
    
        // Pastikan tidak ada string kosong
        const fullSignImg = signImg ? BASE_URL + signImg : '';
    
        console.log(`Signatory Image ${i}:`, fullSignImg); // Debugging
    
        if (signatory.is_sign && fullSignImg) {
          try {
            if (fullSignImg.startsWith(BASE_URL)) {
              doc.addImage(
                fullSignImg,
                'PNG',
                x + colWidth / 2 - imageWidth / 2,
                imageY,
                imageWidth,
                imageHeight
              );
            } else {
              console.warn(`Gambar tanda tangan tidak valid: ${fullSignImg}`);
            }
          } catch (error) {
            console.error('Gagal menambahkan gambar tanda tangan:', error);
          }
        } else {
          console.warn(`Tidak ada gambar tanda tangan untuk signatory ${i}`);
        }
    
        // Nama & Jabatan
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const textY = imageY + imageHeight + 10;
        doc.text(signatory.signatory_name || '', x + colWidth / 2, textY, { align: 'center' });
        doc.text(signatory.signatory_position || '', x + colWidth / 2, textY + 5, { align: 'center' });
      });
    
      currentY += rowHeight + 10;
    };
    
    // Panggil fungsi tabel dengan data dari API
    addSignatureTable(doc);
  
    const pdfBlob = doc.output('blob');

    const pdfUrl = URL.createObjectURL(pdfBlob);

    window.open(pdfUrl, '_blank');
  }

  
  // const fileName = `Form_ITCM_${formData.formatted_form_number}.pdf`;

  // // Simpan PDF dengan nama file yang sudah ditentukan
  // doc.save(fileName);

  // // Segarkan halaman setelah download
  // window.location.reload();

  generatePDF99() {
    const doc = new jsPDF('p', 'mm', 'a4'); // Ukuran halaman A4 (210mm x 297mm)

    const element = document.getElementById('headerElement');

    if (element) {
      const margin = 10;
      let currentY = margin; // Posisi Y untuk menempatkan konten pertama kali

      // Fungsi callback untuk mengatur konten HTML dalam PDF
      doc.html(element, {
        callback: (doc) => {
          // Jika konten melebihi satu halaman, kita tambahkan halaman baru
          const totalHeight = doc.internal.pageSize.height;
          const contentHeight = currentY + element.offsetHeight;

          if (contentHeight > totalHeight) {
            // Jika konten melebihi tinggi halaman, tambahkan halaman baru
            doc.addPage(); // Menambahkan halaman baru
            currentY = margin; // Reset posisi Y di halaman baru
          }

          // Render konten di halaman pertama atau yang baru
          doc.text('Table Content', margin, currentY); // Menambah teks tambahan jika diperlukan

          // Render element HTML
          doc.html(element, {
            x: margin,
            y: currentY + 10, // Jarak vertikal untuk konten berikutnya
            callback: (doc) => {
              // Jika konten lebih banyak, ulangi langkah ini untuk halaman kedua, dst.
              window.open(doc.output('bloburl'), '_blank'); // Menampilkan PDF setelah selesai
            },
            autoPaging: 'text', // Menambahkan auto-paging saat teks terlalu panjang
            width: doc.internal.pageSize.width - 2 * margin, // Menyesuaikan lebar
          });
        },
        x: margin,
        y: currentY,
        width: doc.internal.pageSize.width - 2 * margin,
        autoPaging: 'text', // Mengaktifkan auto-paging
      });
    }
  }
}

export { formsITCM };
