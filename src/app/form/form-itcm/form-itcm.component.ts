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
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import SignaturePad from 'signature_pad';
import {
  AngularEditorConfig,
  AngularEditorModule,
} from '@kolkov/angular-editor';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormStatusInfoComponent } from '../../template/form-status-info/form-status-info.component';

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

  totaljawa: number = 0;

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

    return []
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

    return []
  }

  get dataFormITCMRejected(): formsITCM[] {
    if (this.role_code === 'A') {
      return this.dataListAdminFormITCMRejected;
    } else if (this.role_code === 'M') {
      return this.dataListUserFormITCMRejected;
    }

    return []
  }

  

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
    // console.log(Handling ${action} for:, item);
    this.closePopover();
  }
  // handleKeyboardEvent(event: KeyboardEvent): void {
  //   if (event.key === 'Q') {
  //     this.closeAddModal();
  //     this.closeEditModal();
  //   }
  // }
  handleKeyDown(event: KeyboardEvent) {
    console.log(`Key pressed: ${event.key}`); // Debug output
    if (event.key === 'Escape') {
      this.closeAddModal();
      this.closeEditModal();
      this.closeApproveModal();
      // this.closeSignModal();
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
          const mySignatory = signatories.find(
            (signatory: Signatory) =>
              signatory?.signatory_name === this.personal_name
          );
          console.log('plis', mySignatory);

          if (mySignatory) {
            console.log('Sign UUID:', mySignatory.sign_uuid);
            this.isSigned = mySignatory.is_sign;
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
}

export { formsITCM };
