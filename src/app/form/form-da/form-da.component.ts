import { CommonModule, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
// import { AlertModule } from '@coreui/angular';
import { initFlowbite } from 'flowbite';
import { Router, ActivatedRoute } from '@angular/router';
import SignaturePad from 'signature_pad';
import { FormStatusInfoComponent } from '../../template/form-status-info/form-status-info.component';
import jsPDF from 'jspdf';
// import { initPopovers } from 'flowbite';

interface Signatory {
  sign_uuid: string;
  signatory_name: string;
  signatory_position: string;
  role_sign: string;
  is_sign: boolean;
  // sign_img: string
  sign_img: string | { String: string };
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
  approval_status: any;

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

interface ITCMId {
  itcm_form_uuid: string;
  itcm_form_number: string;
}

@Component({
  selector: 'app-form-da',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormStatusInfoComponent,
  ],
  templateUrl: './form-da.component.html',
  styleUrl: './form-da.component.css',
})
export class FormDaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sigPad', { static: false })
  sigPad!: ElementRef<HTMLCanvasElement>;
  @ViewChild('modal', { static: false }) modal!: ElementRef<HTMLDivElement>;
  @ViewChild('closeButton', { static: false })
  closeButton!: ElementRef<HTMLButtonElement>;

  private signaturePad!: SignaturePad;

  img: string | null = null;
  uploadedImage: string | ArrayBuffer | null = null;
  penColor: string = '#262626'; // Default pen color

  searchText: string = '';

  isPreview: boolean = false; // State untuk menampilkan preview atau tabel
  form!: FormGroup;

  userEmails: string[] = [];

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

  // buat itcm
  itcm_forms_id: string = '';

  itcm_form_uuid: string = '';
  itcm_form_number: string = '';

  resizedImage: string | null = null;

  signatories = [];
  name1: string = '';
  name2: string = '';
  name3: string = '';
  name4: string = '';

  position1: string = '';
  position2: string = '';
  position3: string = '';
  position4: string = '';

  roleSign1: string = 'Pemohon';
  roleSign2: string = 'Atasan Pemohon';
  roleSign3: string = 'Penerima';
  roleSign4: string = 'Atasan Penerima';

  is_sign1: boolean = false;
  is_sign2: boolean = false;
  is_sign3: boolean = false;
  is_sign4: boolean = false;

  dataListFormDADetail: Detail[] = [];

  is_approve: boolean | null = null;
  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalSignOpen: boolean = false;
  isModalApproveOpen: boolean = false;

  // activePopover: number | null = null;
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

  constructor(
    private cookieService: CookieService,
    private fb: FormBuilder,
    public formDaService: FormDaService,
    private datePipe: DatePipe,
    private pdfService: PdfGenerationService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  dataListAllFormDA: formsDA[] = [];
  dataListAdminFormDA: formsDA[] = [];
  dataListUserFormDA: formsDA[] = [];

  list_itcm_forms_number: ITCMId[] = [];

  // draft
  dataListAdminFormDADraft: formsDA[] = [];
  dataListUserFormDADraft: formsDA[] = [];

  // publish
  dataListAdminFormDAPublish: formsDA[] = [];
  dataListUserFormDAPublish: formsDA[] = [];

  // approved
  dataListAdminFormDAApproved: formsDA[] = [];
  dataListUserFormDAApproved: formsDA[] = [];

  // Rejected
  dataListAdminFormDARejected: formsDA[] = [];
  dataListUserFormDARejected: formsDA[] = [];

  dataListFormDASignature: formsDA[] = [];

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

    this.listAllDoc();
    this.listAllProject();
    this.fetchAllUser();

    this.fetchDocumentUUID();

    this.fetchITCMFormNumber();

    this.fetchUserSignature();
    let auxDate = this.substractYearsToDate(new Date(), 0);
    this.maxDate = this.getDateFormateForSearch(auxDate);

    this.route.paramMap.subscribe((params) => {
      const form_uuid = params.get('form_uuid');
      if (form_uuid) {
        this.openPreviewPage(form_uuid);
      }
    });

    this.route.queryParams.subscribe((params) => {
      this.openTab = params['tab'] ? Number(params['tab']) : 1;
    });
  }

  ngAfterViewInit() {
    const canvas = this.sigPad.nativeElement;

    this.signaturePad = new SignaturePad(canvas);
    this.signaturePad.penColor = this.penColor;

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
    this.img = null;
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
    this.signaturePad.clear();
  }

  superAdminOnly() {
    this.fetchDataFormDA();
  }

  adminOnly() {
    this.fetchDataAdminFormDA();
    // draft
    this.fetchDataAdminFormDADraft();
    // publlish
    this.fetchDataAdminFormDAPublish();
    // approved
    this.fetchDataAdminFormDAApproved();
    // approved
    this.fetchDataAdminFormDARejected();
  }

  userOnly() {
    this.fetchDataUserFormDA();
    // draft
    this.fetchDataUserFormDADraft();
    // publlish
    this.fetchDataUserFormDAPublish();
    // approved
    this.fetchDataUserFormDAApproved();
    // approved
    this.fetchDataUserFormDARejected();
  }

  // * untuk tabel
  get dataMyDocument(): formsDA[] {
    if (this.role_code === 'SA') {
      return this.dataListAllFormDA;
    } else if (this.role_code === 'A') {
      return this.dataListAdminFormDA;
    } else if (this.role_code === 'M') {
      return this.dataListUserFormDA;
    }

    return [];
  }

  get dataFormDADraft(): formsDA[] {
    if (this.role_code === 'A') {
      return this.dataListAdminFormDADraft;
    } else if (this.role_code === 'M') {
      return this.dataListUserFormDADraft;
    }

    return [];
  }

  get dataFormDAApproved(): formsDA[] {
    if (this.role_code === 'A') {
      return this.dataListAdminFormDAApproved;
    } else if (this.role_code === 'M') {
      return this.dataListUserFormDAApproved;
    }

    return [];
  }

  get dataFormDARejected(): formsDA[] {
    if (this.role_code === 'A') {
      return this.dataListAdminFormDARejected;
    } else if (this.role_code === 'M') {
      return this.dataListUserFormDARejected;
    }

    return [];
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

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedImage = reader.result as string;
        this.resizeImage(this.uploadedImage);
      };
      reader.readAsDataURL(file);
    }
  }

  resizeImage(base64Str: string) {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx) {
        const targetWidth = 444;
        const targetHeight = 150;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const scale = Math.max(
          targetWidth / img.width,
          targetHeight / img.height
        );
        const x = (targetWidth / scale - img.width) / 2;
        const y = (targetHeight / scale - img.height) / 2;

        ctx.scale(scale, scale);
        ctx.drawImage(img, x, y);

        this.resizedImage = canvas.toDataURL('image/jpeg', 0.9); // 90% kualitas gambar
      }
    };
  }

  offsetX = 0; // Posisi horizontal
  offsetY = 0; // Posisi vertikal
  isDragging = false; // Status apakah gambar sedang digeser

  startDrag(event: MouseEvent | TouchEvent) {
    // Mencegah default browser behavior (seperti drag and drop)
    event.preventDefault();

    // Menangani mouse dan sentuhan
    let startX =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    let startY =
      event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    // Menandai drag dimulai
    this.isDragging = true;

    const moveHandler = (moveEvent: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;

      const moveX =
        moveEvent instanceof MouseEvent
          ? moveEvent.clientX
          : moveEvent.touches[0].clientX;
      const moveY =
        moveEvent instanceof MouseEvent
          ? moveEvent.clientY
          : moveEvent.touches[0].clientY;

      this.offsetX += moveX - startX;
      this.offsetY += moveY - startY;

      // Update posisi gambar
      startX = moveX;
      startY = moveY;
    };

    const stopDrag = () => {
      this.isDragging = false;
      // Hapus event listener setelah drag selesai
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('touchend', stopDrag);
    };

    // Menambahkan event listener untuk move dan stop
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
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

  fetchData() {
    switch (this.role_code) {
      case 'SA': // Super Admin
        this.superAdminOnly();
        break;
      case 'A': // Admin
        this.adminOnly();
        break;
      case 'M': // Member/User
        this.userOnly();
        break;
      default:
        // Tidak ada data untuk role yang tidak dikenal
        break;
    }
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

  fetchAllUser() {
    axios
      .get(`${this.apiUrl}/personal/name/all`)
      .then((response) => {
        this.dataListAllUser = response.data;
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
      })
      .catch((error) => {
        console.error('Error fetching document UUID:', error);
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
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.list_itcm_forms_number = response.data.map((form: any) => ({
            itcm_form_number: form.form_number,
            itcm_form_uuid: form.form_uuid,
          }));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchDataFormDA() {
    axios
      .get(`${environment.apiUrl2}/dampak/analisa`)
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListAllFormDA = response.data;

          this.totalMyDocument = this.dataListAllFormDA.length;
        }
      })
      .catch((error) => {
        console.log(error.response);
        if (error.response.status === 500) {
          console.log(error.response.data);
        }
      });
  }

  fetchDataAdminFormDA(): void {
    axios
      .get(`${environment.apiUrl2}/admin/my/da/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListAdminFormDA = response.data;

          this.totalMyDocument = this.dataListAdminFormDA.length;
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

  fetchDataUserFormDA() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListUserFormDA = Array.isArray(response.data)
            ? response.data
            : []; // Pastikan data adalah array, jika tidak, set menjadi array kosong
          this.totalMyDocument = this.dataListUserFormDA.length;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message); // Menampilkan error yang sesuai
      });
  }

  // signature
  fetchUserSignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListFormDASignature = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.form_status === 'Published'
              )
            : [];
          this.totalMySignature = this.dataListFormDASignature.length;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  // draft admin
  fetchDataAdminFormDADraft(): void {
    axios
      .get(`${environment.apiUrl2}/admin/my/da/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListAdminFormDADraft = Array.isArray(response.data)
            ? response.data.filter((item: any) => item.form_status === 'Draft')
            : [];
          this.totalDraft = this.dataListAdminFormDADraft.length;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  // draft user
  fetchDataUserFormDADraft() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListUserFormDADraft = Array.isArray(response.data)
            ? response.data.filter((item: any) => item.form_status === 'Draft')
            : [];
          this.totalDraft = this.dataListUserFormDADraft.length;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  // Publish admin
  fetchDataAdminFormDAPublish(): void {
    axios
      .get(`${environment.apiUrl2}/admin/da/all`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListAdminFormDAPublish = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.form_status === 'Published'
              )
            : [];
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  // Publish user
  fetchDataUserFormDAPublish() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListUserFormDAPublish = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.form_status === 'Published'
              )
            : [];
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  // Approved admin
  fetchDataAdminFormDAApproved(): void {
    axios
      .get(`${environment.apiUrl2}/admin/da/all`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListAdminFormDAApproved = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.approval_status === 'Disetujui'
              )
            : [];
          this.totalApproved = this.dataListAdminFormDAApproved.length;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  // Approved user
  fetchDataUserFormDAApproved() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListUserFormDAApproved = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.approval_status === 'Disetujui'
              )
            : [];
          this.totalApproved = this.dataListUserFormDAApproved.length;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  // Rejected admin
  fetchDataAdminFormDARejected(): void {
    axios
      .get(`${environment.apiUrl2}/admin/da/all`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListAdminFormDARejected = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.approval_status === 'Tidak Disetujui'
              )
            : [];
          this.totalRejected = this.dataListAdminFormDARejected.length;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  // Rejected user
  fetchDataUserFormDARejected() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListUserFormDARejected = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.approval_status === 'Tidak Disetujui'
              )
            : [];
          this.totalRejected = this.dataListUserFormDARejected.length;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  openTab = 1;
  toggleTabs($tabNumber: number) {
    this.openTab = $tabNumber;
  }

  openTab2 = 1;
  toggleTabs2($tabNumber: number) {
    this.openTab2 = $tabNumber;
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
    this.closePopover();
  }

  handleKeyDown(event: KeyboardEvent) {
    console.log(`Key pressed: ${event.key}`); // Debug output
    if (event.key === 'Escape') {
      this.closeAddModal();
      this.closeEditModal();
      this.closeApproveModal();
      this.closeSignModal();
      console.log('Modals closed');
    }
  }

  openAddModal() {
    this.form_ticket = '';
    this.project_uuid = '';
    this.itcm_form_number = '';
    this.nama_analis = '';
    this.jabatan = '';
    this.departemen = '';
    this.jenis_perubahan = '';
    this.detail_dampak_perubahan = '';
    this.rencana_pengembangan_perubahan = '';
    this.rencana_pengujian_perubahan_sistem = '';
    this.rencana_rilis_perubahan_dan_implementasi = '';
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

    this.isModalAddOpen = true;
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addFormDA(): void {
    const token = this.cookieService.get('userToken');

    const requestDataFormDA = {
      isPublished: false,
      formData: {
        document_uuid: this.document_uuid,
        form_ticket: this.form_ticket,
        project_uuid: this.project_uuid,
      },
      data_da: {
        itcm_form_uuid: this.itcm_form_uuid,
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
      ],
    };
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

        this.fetchData();
      })
      .catch((error) => {
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
        } else {
          console.log('Error', error.message);
        }
      });
    this.isModalAddOpen = false;
  }

  openEditModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/da/${form_uuid}`)
      .then((response) => {
        console.log(response);
        
        const formData = response.data.form;
        if (formData.form_status === 'Published') {
          Swal.fire({
            title: 'Konfirmasi',
            text: 'Anda yakin ingin mengedit Formulir ini? Setelah diedit, formulir akan kembali menjadi Draft dan semua signatories akan dihapus',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya',
            cancelButtonText: 'Tidak',
          }).then((result) => {
            if (result.isConfirmed) {
              this.isModalEditOpen = true;
            }
          });
        } else if (formData.form_status === 'Draft') {
          this.isModalEditOpen = true;
        }
        console.log(response);

        // const formData = response.data.form;
        this.form_uuid = formData.form_uuid;
        this.form_number = formData.form_number;
        this.form_ticket = formData.form_ticket;
        this.form_status = formData.form_status;
        this.document_name = formData.document_name;
        this.project_uuid = formData.project_uuid;
        this.project_name = formData.project_name;
        this.itcm_form_uuid = formData.itcm_form_uuid;
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

        const existingProject = this.dataListAllProject.find(
          (project) => project.project_name === formData.project_name
        );
        this.project_uuid = existingProject ? existingProject.project_uuid : '';

        // const existingITCMNumber = this.dataListAllProject.find(
        //   (project) => project.project_name === formData.project_name
        // );

        this.itcm_form_uuid = formData.itcm_form_uuid;
        const matchingForm = this.list_itcm_forms_number.find(
          (form) => form.itcm_form_uuid === formData.itcm_form_uuid
        );

        if (matchingForm) {
          this.itcm_form_number = matchingForm.itcm_form_number;
        } else {
          this.itcm_form_number = '';
        }
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

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateFormDA() {
    const data = {
      // isPublished: false,
      formData: {
        document_uuid: this.document_uuid,
        form_ticket: this.form_ticket,
        project_uuid: this.project_uuid,
      },
      data_da: {
        itcm_form_uuid: this.itcm_form_uuid,
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

    axios
      .put(
        `${environment.apiUrl2}/api/dampak/analisa/update/${this.form_uuid}`,
        data,
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

        this.fetchData();
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

  async fetchUserEmail(form_uuid: string): Promise<void> {
    try {
      const response = await axios.get(
        `${environment.apiUrl2}/da/${form_uuid}`
      );
      // console.log(response);
      this.userEmails = response.data.user_emails;
    } catch (error) {
      console.error('Gagal ambil user email', error);
      throw error;
    }
  }

  async emailToZimbra(form_uuid: string) {
    try {
      await this.fetchUserEmail(form_uuid);
      this.generateURL(form_uuid);

      const link = `${window.location.origin}/form/da/${form_uuid}`;

      await axios.post(
        `${environment.apiUrl2}/send-email`,
        {
          to: this.userEmails,
          subject: 'Formulir Baru dari Woila untuk Ditandatangani - DA',
          body: `
          <div
            style="max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">

            <div style="text-align: center;">
              <h2 style="color: #2c3e50; margin-bottom: 8px;">📄 Formulir Baru Siap Ditinjau</h2>
              <p style="font-size: 16px; margin-bottom: 24px;">Anda memiliki formulir baru dari <strong>Woila</strong> yang perlu
                ditinjau dan ditandatangani.</p>
              <a href="${link}"
                style="background-color: #007bff; color: #ffffff; padding: 12px 24px; border-radius: 6px; font-size: 16px; text-decoration: none; display: inline-block;">
                ✍️ Tinjau & Tandatangani Sekarang
              </a>
            </div>

            <div style="margin-top: 32px; font-size: 14px; color: #777; text-align: center;">
              <p>Jika tombol tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:</p>
              <a href="${link}" style="color: #007bff;">${link}</a>
            </div>

            <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0;">

            <div style="font-size: 12px; color: #999; text-align: center;">
              Email ini dikirim secara otomatis oleh sistem <strong>Woila</strong>. Harap tidak membalas email ini.
            </div>

            <div style="font-size: 10px; color: #aaa; margin-top: 30px; text-align: justify; line-height: 1.5;">
              <p><strong>Peringatan:</strong> E-mail ini dan termasuk seluruh lampirannya jika ada, hanya ditujukan kepada
                penerima yang tercantum di atas. Jika Anda bukan penerima yang dituju, maka Anda tidak diperkenankan untuk
                memanfaatkan, menyebarkan, mendistribusikan atau menggandakan e-mail ini beserta seluruh lampirannya. Mohon
                kerjasamanya untuk segera memberitahukan PT Aino Indonesia di alamat email yang tercantum di atas serta menghapus
                e-mail ini beserta seluruh lampirannya. Semua pesan yang ada dalam e-mail ini merupakan pesan pribadi dari
                pengirim yang bersangkutan dan tidak serta merta mencerminkan pandangan PT Aino Indonesia, kecuali telah terdapat
                kesepakatan antara pengirim dan penerima bahwa e-mail ini termasuk salah satu bentuk komunikasi kedinasan yang
                dapat diterima oleh kedua pihak.</p>
              <div
                style="text-align: center; font-family: monospace; font-size: 18px; color: #cccccc; white-space: nowrap; overflow: hidden; text-overflow: clip; margin: 20px 0;">
                <span
                  style="user-select: none;">========================================================</span>
              </div>

              <p style="  font-style: italic;"><strong>Caution:</strong> The information enclosed in this email (and any
                attachments) may be legally privileged and/or confidential and is intended only for the use of the addressee(s).
                No addressee should forward, print, copy or otherwise reproduce this message in any manner that would allow it to
                be viewed by any individual not originally listed as a recipient. If the reader of this message is not the
                intended recipient, you are hereby notified that any unauthorized disclosure, dissemination, distribution, copying
                or the taking of any action in reliance on the information herein is strictly prohibited. If you have received
                this communication in error,

                please immediately notify the sender and delete this message.Unless it is made by the authorized person, any views
                expressed in this message are those of the individual sender and may not necessarily reflect the views of PT Aino
                Indonesia.
              </p>
            </div>
          </div>`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
          },
        }
      );
    } catch (error) {
      console.error('Gagal kirim email:', error);
    }
  }

  async publish(form_uuid: string, form_ticket: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Apakah anda yakin untuk mempublish dokumen ini? Setelah dokumen dipublish, dokumen tidak dapat dikembalikan.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, publish it',
    });

    if (result.isConfirmed) {
      try {
        await axios.put(
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
        );

        await Swal.fire({
          icon: 'success',
          title: 'SUCCESS',
          text: 'Berhasil dipublish',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });

        this.fetchData();
        await this.emailToZimbra(form_uuid);
      } catch (error: any) {
        Swal.fire({
          title: 'Error',
          text: error?.response?.data?.message ?? 'Terjadi kesalahan.',
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      }
    }
  }

  async openPreviewPage(form_uuid: string) {
    await this.profileData();
    axios
      .get(`${environment.apiUrl2}/da/${form_uuid}`)
      .then((response) => {
        const BASE_URL = environment.apiUrl2;

        // Proses data dan perbarui UI di sini
        const formData = response.data.form;
        this.form_uuid = formData.form_uuid;
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
        this.reason = formData.reason;
        this.isPreview = true;
        this.router.navigate([`/form/da/${form_uuid}`]);

        // Update signatory positions
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

        // udh bener tp kadang undefined
        if (signatories && signatories.length > 0) {
          const mySignatory = signatories.find(
            (signatory: Signatory) =>
              signatory?.signatory_name === this.personal_name
          );

          if (mySignatory) {
            this.isSigned = mySignatory.is_sign;
          }
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

    this.router.navigate([`/form/da`]);
  }

  openSignModal(form_uuid: string) {
    this.form_uuid = form_uuid;
    this.isModalSignOpen = true;
  }

  closeSignModal() {
    this.isModalSignOpen = false;
  }

  openApproveModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/da/${form_uuid}`)
      .then((response) => {
        const formData = response.data.form;
        this.created_at = formData.created_at;
        this.form_ticket = formData.form_ticket;
        this.form_number = formData.form_number;
        this.form_uuid = formData.form_uuid;

        this.is_approve = null;
        this.reason = '';
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
        `${environment.apiUrl2}/api/form/da/approval/${form_uuid}`,
        formData, // Send the correct form data
        {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
          },
        }
      )
      .then((response) => {
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
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });

        this.fetchData();
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
    if (this.openTab2 === 1) {
      // Menggunakan canvas untuk signature
      this.img = this.sigPad.nativeElement.toDataURL('image/png');
    } else if (this.openTab2 === 2) {
      // Menggunakan image yang di-upload dan sudah di-resize
      this.img = this.resizedImage;
    }

    // Pastikan img tidak kosong
    if (!this.img) {
      console.error('No signature image found');
      return;
    }

    // const dataURL = this.sigPad.nativeElement.toDataURL('image/png'); // Get the signature image

    axios.get(`${environment.apiUrl2}/da/${form_uuid}`).then((response) => {
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
        // Prepare payload to send, including the signature image
        const payload = {
          name: mySignatory.signatory_name,
          position: mySignatory.signatory_position,
          is_sign: true,
          sign_img: this.img, // Include the Base64 signature image
        };

        // Send the update to the backend
        this.onSignature(mySignatory.sign_uuid, payload);
      }
    });
  }

  onSignature(sign_uuid: string, payload: any) {
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
        this.fetchData();
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

  downloadData(form_uuid: string) {
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

  // copy
  generateURL(form_uuid: string) {
    // Generate URL
    const url = `${window.location.origin}/form/da/${form_uuid}`;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          // alert('URL copied to clipboard: ' + url);
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

  fetchDataAndGeneratePDF(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/da/${form_uuid}`)
      .then((response) => {
        // const BASE_URL = environment.apiUrl2;
        const formData = response.data.form;
        const signatories = response.data.signatories || [];

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

    const imgPath = 'assets/images/aino.png';

    const addHeader = (doc: jsPDF, pageNumber: number) => {
      doc.setFont('helvetica', 'bold');

      const tableWidth = doc.internal.pageSize.width * 0.9;
      const tableX = (doc.internal.pageSize.width - tableWidth) / 2;
      const tableY = 10;
      const boxHeight2 = 28;

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
      doc.setFontSize(11);
      const textX2 = tableX + boxWidth2 + boxWidth2 / 2;
      const textY2 = tableY + boxHeight2 / 2;
      doc.text('FORMULIR ANALISA DAMPAK', textX2, textY2 - 5, {
        align: 'center',
      });
      doc.text('PENGELOLAAN PERUBAHAN TI', textX2, textY2 + 5, {
        align: 'center',
      });

      doc.rect(tableX + 2 * boxWidth2, tableY, boxWidth2, boxHeight2);
      doc.setFontSize(9);
      const labelX3 = tableX + 2 * boxWidth2 + 2;
      const valueX3 = tableX + 2 * boxWidth2 + 28;
      let textY3 = tableY + boxHeight2 / 2 - 6;

      doc.text('No. Dokumen', labelX3, textY3);
      doc.text(`: AINO/PED/F/04/01`, valueX3, textY3);
      textY3 += 6;
      doc.text('Tanggal Terbit', labelX3, textY3);
      doc.text(': 20 Februari 2024', valueX3, textY3);
      textY3 += 6;
      doc.text('No. Revisi', labelX3, textY3);
      doc.text(': 2.0', valueX3, textY3);
      textY3 += 6;
      doc.text('Halaman', labelX3, textY3);
      doc.text(`: ${pageNumber}`, valueX3, textY3);
    };

    let pageNumber = 1;
    addHeader(doc, pageNumber);

    doc.setFontSize(10);
    doc.setFont('helvetica', '', 700);
    const titleText = 'FORMULIR ANALISIS DAMPAK PENGELOLAAN PERUBAHAN TI';
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
    doc.text(titleText, titleX, currentY);
    currentY += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', '', 700);
    const nomorText = `Nomor : ${formData.form_number}`;
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

    doc.text('Nama Proyek', 10, currentY);
    doc.text(`: ${formData.project_name}`, 60, currentY);
    currentY += 5;
    doc.text('Nama Analis', 10, currentY);
    doc.text(`: ${formData.nama_analis}`, 60, currentY);
    currentY += 5;
    doc.text('Jabatan', 10, currentY);
    doc.text(`: ${formData.jabatan}`, 60, currentY);
    currentY += 5;
    doc.text('Divisi', 10, currentY);
    doc.text(`: ${formData.departemen}`, 60, currentY);
    currentY += 10;

    // doc.text('Nama Pemohon', 10, currentY);
    // doc.text(`: ${formData.nama_pemohon}`, 60, currentY);
    // currentY += 5;
    // doc.text('Divisi', 10, currentY);
    // doc.text(`: ${formData.instansi}`, 60, currentY);
    // currentY += 5;
    // const datePipe = new DatePipe('en-US');
    // const formattedDate = datePipe.transform(
    //   formData.created_at,
    //   'dd MMMM yyyy'
    // );

    // doc.text('Tanggal', 10, currentY);
    // doc.text(`: ${formattedDate}`, 60, currentY);

    // currentY += 10;

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

    // text dengan box
    addTextWithBox(doc, 'Jenis Perubahan:', formData.jenis_perubahan);

    addTextWithBox(
      doc,
      'Detail Dampak Perubahan:',
      formData.detail_dampak_perubahan
    );

    addTextWithBox(
      doc,
      'Rencana Pengembangan Perubahan:',
      formData.rencana_pengembangan_perubahan
    );

    addTextWithBox(
      doc,
      'Rencana Pengujian Perubahan Sistem:',
      formData.rencana_pengujian_perubahan_sistem
    );

    addTextWithBox(
      doc,
      'Rencana Rilis Perubahan dan Implementasi:',
      formData.rencana_rilis_perubahan_dan_implementasi
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
      const isApproved = approval_status === 'Disetujui';
      const isNotApproved = approval_status === 'Tidak Disetujui';

      doc.setFont('helvetica', 'normal');
      doc.rect(
        boxX + leftBoxWidth,
        currentY + innerBoxHeight,
        rightBoxWidth / 2,
        innerBoxHeight
      );

      // Gambar checkmark (hanya jika approved)
      if (isApproved) {
        doc.addImage(
          'assets/images/check.png',
          'PNG',
          boxX + leftBoxWidth + rightBoxWidth / 4 - 5,
          currentY + innerBoxHeight + innerBoxHeight / 2 - 5,
          10,
          10
        ); // Sesuaikan posisi gambar
      }

      // Kotak kedua
      doc.rect(
        boxX + leftBoxWidth + rightBoxWidth / 2,
        currentY + innerBoxHeight,
        rightBoxWidth / 2,
        innerBoxHeight
      );

      // Gambar checkmark untuk kotak kedua (hanya jika not approved)
      if (isNotApproved) {
        doc.addImage(
          'assets/images/check.png',
          'PNG',
          boxX + leftBoxWidth + (rightBoxWidth / 4) * 3 - 5,
          currentY + innerBoxHeight + innerBoxHeight / 2 - 5,
          10,
          10
        ); // Sesuaikan posisi gambar
      }

      currentY += boxHeight + 10;
    };

    // Contoh pemanggilan fungsi
    addStatusBox(doc, formData.approval_status); // Ganti dengan status yang diinginkan

    if (formData.approval_status === 'Tidak Disetujui' && formData.reason) {
      addTextWithBox(doc, 'Alasan tidak approve:', formData.reason);
    }

    const addSignatureTable = (doc: jsPDF): void => {
      const tableWidth: number = doc.internal.pageSize.width * 0.9;
      const tableX: number = (doc.internal.pageSize.width - tableWidth) / 2;
      const rowHeight: number = 50;
      const colWidth: number = tableWidth / 4;

      checkSpaceAndAddPage(doc, rowHeight + 10);

      // Ukuran gambar dengan rasio 2:1
      const imageWidth: number = 40; // Lebar gambar
      const imageHeight: number = 20; // Tinggi gambar

      // Mapping posisi tanda tangan berdasarkan role_sign
      const signatoryMap: { [key: string]: number } = {
        Pemohon: 0,
        'Atasan Pemohon': 1,
        Penerima: 2,
        'Atasan Penerima': 3,
      };

      // Inisialisasi array dengan posisi tetap
      const formattedSignatories: Signatory[] = new Array(4)
        .fill(null)
        .map(() => ({
          sign_uuid: '',
          signatory_name: '',
          signatory_position: '',
          role_sign: '',
          is_sign: false,
          sign_img: '',
        }));

      // Masukkan signatories ke dalam urutan yang benar
      signatories.forEach((signatory: Signatory) => {
        const index = signatoryMap[signatory.role_sign]; // Cari index berdasarkan role_sign
        if (index !== undefined) {
          formattedSignatories[index] = signatory;
        }
      });

      // Header Kolom
      const headers: string[] = [
        'Pemohon',
        'Atasan Pemohon',
        'Penerima',
        'Atasan Penerima',
      ];
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
        const signImg =
          typeof signatory.sign_img === 'string'
            ? signatory.sign_img
            : signatory.sign_img?.String || '';

        // Pastikan tidak ada string kosong
        const fullSignImg = signImg ? BASE_URL + signImg : '';

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
        }

        // Nama & Jabatan
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const textY = imageY + imageHeight + 10;
        doc.text(signatory.signatory_name || '', x + colWidth / 2, textY, {
          align: 'center',
        });
        doc.text(
          signatory.signatory_position || '',
          x + colWidth / 2,
          textY + 5,
          { align: 'center' }
        );
      });

      currentY += rowHeight + 10;
    };

    // Panggil fungsi tabel dengan data dari API
    addSignatureTable(doc);

    const fileName = `Form_DA_${formData.form_number}.pdf`;

    // Simpan PDF dengan nama file yang sudah ditentukan
    doc.save(fileName);

    // Segarkan halaman setelah download
    window.location.reload();
  }
}

export { formsDA };
