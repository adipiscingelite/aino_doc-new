import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  HostListener,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { FormBaService } from '../../services/form-ba/form-ba.service';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FormStatusInfoComponent } from '../../template/form-status-info/form-status-info.component';
import SignaturePad from 'signature_pad';
import {
  AngularEditorConfig,
  AngularEditorModule,
} from '@kolkov/angular-editor';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as DOMPurify from 'dompurify';
interface Point {
  x: number;
  y: number;
  vx: number; // Velocity pada sumbu X
  vy: number; // Velocity pada sumbu Y
  size: number; // Ukuran partikel
  color: string; // Warna partikel dalam format rgba
}

interface Signatory {
  sign_uuid: string;
  signatory_name: string;
  signatory_position: string;
  role_sign: string;
  is_sign: boolean;
  sign_img: string | { String: string };
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
  itcm_uuid?: string;
  da_uuid?: string;
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
  da_uuid: string;
}

interface formsITCMNumber {
  itcm_form_number: string;
  itcm_uuid: string;
}

@Component({
  selector: 'app-form-ba',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormStatusInfoComponent,
    AngularEditorModule,
    HttpClientModule,
    RouterLink,
  ],
  templateUrl: './form-ba.component.html',
  styleUrls: ['./form-ba.component.css'],
})
export class FormBaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sigPad', { static: false })
  sigPad!: ElementRef<HTMLCanvasElement>;
  @ViewChild('modal', { static: false }) modal!: ElementRef<HTMLDivElement>;
  @ViewChild('closeButton', { static: false })
  closeButton!: ElementRef<HTMLButtonElement>;

  private signaturePad!: SignaturePad;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private points: Point[] = [];
  private pointCount = 100;
  private maxVelocity = 2;

  dataTree: any[] = [];
  isExpanded: boolean[] = [];

  // Generate Random Numbers for ITCM and DA
  generateRandomNumber(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit random number
  }

  // Pad Number for IDs
  padNumber(num: number): string {
    return num.toString().padStart(3, '0'); // Ensure 3-digit numbers
  }

  // Toggle Node
  toggleNode(index: number): void {
    this.isExpanded[index] = !this.isExpanded[index];
  }

  img: string | null = null;
  uploadedImage: string | ArrayBuffer | null = null;
  penColor: string = '#262626';

  isPreview: boolean = false;

  searchText: string = '';
  user_uuid: any;
  user_name: any;
  role_code: any;

  personal_name: string = '';

  form_uuid: string = '';
  form_number: string = '';
  form_ticket: string = '';
  form_status: string = '';

  da_form_number: string = '';
  itcm_form_number: string = '';
  da_uuid: string = '';
  itcm_uuid: string = '';

  approval_status: string = '';
  reason: string = '';
  updated_at: string = '';
  update_by: string = '';
  created_at: string = '';
  created_by: string = '';
  updated_by: string = '';
  deleted_at: string = '';
  deleted_by: string = '';

  document_uuid: string = '';
  document_name: string = '';
  project_uuid: string = '';
  project_name: string = '';

  judul: string = '';
  tanggal: string = '';
  nama_aplikasi: string = '';
  no_da: string = '';
  no_itcm: string = '';
  pelaksana: string = '';
  dilakukan_oleh: string = '';
  didampingi_oleh: string = '';

  keterangan: SafeHtml = '';

  resizedImage: string | null = null;

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

  // roleSign6: string = 'Pemohon';
  // roleSign7: string = 'Atasan Pemohon';
  // roleSign8: string = 'Penerima';
  // roleSign4: string = 'Atasan Penerima';
  // roleSign5: string = 'Atasan Pemohon';
  roleSign1: string = 'Pelaksana';
  roleSign2: string = 'Mengetahui1';
  roleSign3: string = 'Mengetahui2';

  userEmails: string[] = [];

  dataListAllDoc: Documents[] = [];
  dataListAllProject: Projects[] = [];

  dataListDANumber: formsDANumber[] = [];
  dataListITCMNumber: formsITCMNumber[] = [];

  dataListAllUser: Users[] = [];

  dataListAllBA: formsBA[] = [];
  dataListUserBA: formsBA[] = [];
  dataListAdminBA: formsBA[] = [];

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
    Pelaksana: { name: '', position: '', is_sign: false, sign_img: '' },
    Mengetahui1: { name: '', position: '', is_sign: false, sign_img: '' },
    Mengetahui2: { name: '', position: '', is_sign: false, sign_img: '' },
  };

  totalMyDocument: number = 0;
  totalDraft: number = 0;
  totalMySignature: number = 0;
  totalApproved: number = 0;
  totalRejected: number = 0;

  constructor(
    private sanitizer: DomSanitizer,
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

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: false,
    minHeight: '20',
    enableToolbar: true,
    showToolbar: true,
    defaultFontName: 'Arial',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'georgia', name: 'Georgia' },
      { class: 'helvetica', name: 'Helvetica' },
      { class: 'myriad-pro', name: 'Myriad Pro' },
    ],
  };

  async ngOnInit(): Promise<void> {
    this.dataTree = Array.from({ length: 5 }, (_, i) => ({
      id: `${this.padNumber(i + 1)}/BA/GA/III/2025`,
      itcmNumber: this.generateRandomNumber(),
      daNumber: this.generateRandomNumber(),
    }));

    // Initialize the expanded state
    this.isExpanded = Array(this.dataTree.length).fill(false);
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
    this.listAllProject();
    // console.log('bjir', this.listAllProject());

    this.fetchDocumentUUID();

    try {
      await Promise.all([this.fetchDAFormNumber(), this.fetchITCMFormNumber()]);

      this.mergeUUIDWithDocuments();
    } catch (error) {
      console.error('Error fetching DA or ITCM form numbers:', error);
    }

    // ? fetch signature setiap user
    this.fetchUserSignature();

    // ? untuk membuka preview
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

    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.resizeCanvas2();
    this.createPoints();
    this.animate();
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
    // document
    this.fetchAllDataBA();
  }

  adminOnly() {
    // document
    this.fetchDataAdminBA();
    // draft
    this.fetchDataAdminFormBADraft();
    // approve
    this.fetchDataAdminFormBAApproved();
    // rejected
    this.fetchDataAdminFormBARejected();
  }

  userOnly() {
    // document
    this.fetchDataUserBA();
    // draft
    this.fetchDataUserFormBADraft();
    // approve
    this.fetchDataUserFormBAApproved();
    // rejected
    this.fetchDataUserFormBARejected();
  }

  // * untuk tabel
  get dataMyDocument(): formsBA[] {
    if (this.role_code === 'SA') {
      return this.dataListAllBA;
    } else if (this.role_code === 'A') {
      return this.dataListAdminBA;
    } else if (this.role_code === 'M') {
      return this.dataListUserBA;
    }

    return [];
  }

  get dataFormBADraft(): formsBA[] {
    if (this.role_code === 'SA') {
      return this.dataListAdminFormBADraft;
    } else if (this.role_code === 'A') {
      return this.dataListAdminFormBADraft;
    } else if (this.role_code === 'M') {
      return this.dataListUserFormBADraft;
    }

    return [];
  }

  get dataFormBAApproved(): formsBA[] {
    if (this.role_code === 'A') {
      return this.dataListAdminFormBAApproved;
    } else if (this.role_code === 'M') {
      return this.dataListUserFormBAApproved;
    }

    return [];
  }

  get dataFormBARejected(): formsBA[] {
    if (this.role_code === 'A') {
      return this.dataListAdminFormBARejected;
    } else if (this.role_code === 'M') {
      return this.dataListUserFormBARejected;
    }

    return [];
  }

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

        this.resizedImage = canvas.toDataURL('image/jpeg', 0.9);
      }
    };
  }

  setKeterangan(htmlString: string) {
    const cleanHtml = DOMPurify.default.sanitize(htmlString);
    this.keterangan = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.resizeCanvas2();
    this.createPoints();
  }

  private resizeCanvas2(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private createPoints(): void {
    this.points = [];
    for (let i = 0; i < this.pointCount; i++) {
      this.points.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.maxVelocity,
        vy: (Math.random() - 0.5) * this.maxVelocity,
        size: Math.random() * 3 + 1,
        color: `rgba(0, 0, 0, ${Math.random()})`,
      });
    }
  }

  private drawPoints(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.points.forEach((point) => {
      point.x += point.vx;
      point.y += point.vy;

      // Wrap points around edges
      if (point.x < 0) point.x = this.canvas.width;
      if (point.x > this.canvas.width) point.x = 0;
      if (point.y < 0) point.y = this.canvas.height;
      if (point.y > this.canvas.height) point.y = 0;

      // Draw point
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      this.ctx.fillStyle = point.color;
      this.ctx.fill();
    });
  }

  private animate(): void {
    this.drawPoints();
    requestAnimationFrame(() => this.animate());
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

  fetchDocumentUUID(): void {
    axios
      .get(`${environment.apiUrl2}/form/ba/code`)
      .then((response) => {
        this.document_uuid = response.data.document_uuid;
      })
      .catch((error) => {
        console.error('Error fetching document UUID:', error);
      });
  }

  async fetchDAFormNumber(): Promise<void> {
    return axios
      .get(`${environment.apiUrl2}/api/my/form/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListDANumber = response.data.map((form: any) => ({
            da_form_number: form.form_number,
            da_uuid: form.form_uuid,
          }));
        } else {
          this.dataListDANumber = [];
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  async fetchITCMFormNumber(): Promise<void> {
    return axios
      .get(`${environment.apiUrl2}/api/my/form/itcm`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListITCMNumber = response.data.map((form: any) => ({
            itcm_form_number: form.form_number,
            itcm_uuid: form.form_uuid,
          }));
        } else {
          this.dataListITCMNumber = [];
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  mergeUUIDWithDocuments() {
    this.dataMyDocument.forEach((document: any) => {
      // Mencocokkan ITCM UUID
      const matchingITCM = this.dataListITCMNumber.find(
        (itcm: any) => itcm.itcm_form_number === document.no_itcm
      );
      if (matchingITCM) {
        document.itcm_uuid = matchingITCM.itcm_uuid;
      }

      // Mencocokkan DA UUID
      const matchingDA = this.dataListDANumber.find(
        (da: any) => da.da_form_number === document.no_da
      );
      if (matchingDA) {
        document.da_uuid = matchingDA.da_uuid;
      }
    });
  }

  fetchAllDataBA(): void {
    axios
      .get(`${environment.apiUrl2}/form/ba`)
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListAllBA = response.data;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
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
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListAdminBA = response.data;
          this.totalMyDocument = Array.isArray(response.data)
            ? response.data.length
            : 0;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  fetchDataUserBA() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ba`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        console.log(response);

        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListUserBA = response.data;
          this.totalMyDocument = Array.isArray(response.data)
            ? response.data.length
            : 0;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  fetchUserSignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/ba`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListFormBASignature = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.form_status === 'Published'
              )
            : [];
          this.totalMySignature = this.dataListFormBASignature.length;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  // draft admin
  fetchDataAdminFormBADraft(): void {
    axios
      .get(`${environment.apiUrl2}/admin/my/ba/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListAdminFormBADraft = Array.isArray(response.data)
            ? response.data.filter((item: any) => item.form_status === 'Draft')
            : [];
          this.totalDraft = this.dataListAdminFormBADraft.length;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
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
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListUserFormBADraft = Array.isArray(response.data)
            ? response.data.filter((item: any) => item.form_status === 'Draft')
            : [];
          this.totalDraft = this.dataListUserFormBADraft.length;
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
      });
  }

  // Approved admin
  fetchDataAdminFormBAApproved(): void {
    axios
      .get(`${environment.apiUrl2}/admin/ba/all`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListAdminFormBAApproved = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.approval_status === 'Disetujui'
              )
            : [];
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
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
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListUserFormBAApproved = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.approval_status === 'Disetujui'
              )
            : [];
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
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
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListAdminFormBARejected = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.approval_status === 'Tidak Disetujui'
              )
            : [];
        }
      })
      .catch((error) => {
        console.error(error.response ? error.response.data : error.message);
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
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListUserFormBARejected = Array.isArray(response.data)
            ? response.data.filter(
                (item: any) => item.approval_status === 'Tidak Disetujui'
              )
            : [];
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
    this.pelaksana = '';
    this.dilakukan_oleh = '';
    this.didampingi_oleh = '';

    this.keterangan = '';

    this.name1 = '';
    this.position1 = '';
    this.roleSign1 = this.roleSign1;
    this.name2 = '';
    this.position2 = '';
    this.roleSign2 = this.roleSign2;
    this.name3 = '';
    this.position3 = '';
    this.roleSign3 = this.roleSign3;

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
        keterangan: this.keterangan,
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
      ],
    };
    console.log(data);

    axios
      .post(`${environment.apiUrl2}/api/add/ba`, data, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
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
        this.isModalAddOpen = false;
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
  }

  openEditModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/ba/${form_uuid}`)
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
        this.project_uuid = formData.project_uuid;
        this.project_name = formData.project_name;
        this.tanggal = formData.tanggal;
        this.nama_aplikasi = formData.nama_aplikasi;
        this.no_da = formData.no_da;
        this.no_itcm = formData.no_itcm;
        this.dilakukan_oleh = formData.dilakukan_oleh;
        this.didampingi_oleh = formData.didampingi_oleh;
        this.keterangan = DOMPurify.default.sanitize(formData.keterangan || '');

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
        keterangan: this.keterangan,
      },
      signatories: [
        {
          name: this.signatoryPositions['Pelaksana'].name,
          position: this.signatoryPositions['Pelaksana'].position,
          role_sign: 'Pelaksana',
        },
        {
          name: this.signatoryPositions['Mengetahui1'].name,
          position: this.signatoryPositions['Mengetahui1'].position,
          role_sign: 'Mengetahui1',
        },
        {
          name: this.signatoryPositions['Mengetahui2'].name,
          position: this.signatoryPositions['Mengetahui2'].position,
          role_sign: 'Mengetahui2',
        },
      ],
    };

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

        this.isModalEditOpen = false;
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

  async fetchUserEmail(form_uuid: string): Promise<void> {
    try {
      const response = await axios.get(
        `${environment.apiUrl2}/ba/${form_uuid}`
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

      const link = `${window.location.origin}/form/ba/${form_uuid}`;

      await axios.post(
        `${environment.apiUrl2}/send-email`,
        {
          to: this.userEmails,
          subject: 'Formulir Baru dari Woila untuk Ditandatangani - BA',
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
      .get(`${environment.apiUrl2}/ba/${form_uuid}`)
      .then((response) => {
        const BASE_URL = environment.apiUrl2;

        const formData = response.data.form;
        const rawDate = new Date(formData.tanggal);

        this.form_uuid = formData.form_uuid;
        this.form_status = formData.form_status;
        this.judul = formData.judul;
        this.nama_aplikasi = formData.nama_aplikasi;
        this.project_name = formData.project_name;

        this.tanggal = new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(rawDate);

        this.dilakukan_oleh = formData.dilakukan_oleh;
        this.didampingi_oleh = formData.didampingi_oleh;
        this.setKeterangan(formData.keterangan);
        this.reason = formData.reason?.String || '';

        this.no_da = formData.no_da;
        this.no_itcm = formData.no_itcm;

        this.isPreview = true;
        this.router.navigate([`/form/ba/${form_uuid}`]);

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
        } else {
          console.log('Signatories array is empty or undefined');
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 404) {
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
      this.img = this.sigPad.nativeElement.toDataURL('image/png');
    } else if (this.openTab2 === 2) {
      this.img = this.resizedImage;
    }

    if (!this.img) {
      console.error('No signature image found');
      return;
    }

    axios.get(`${environment.apiUrl2}/ba/${form_uuid}`).then((response) => {
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
        const payload = {
          name: mySignatory.signatory_name,
          position: mySignatory.signatory_position,
          is_sign: true,
          sign_img: this.img,
        };

        this.onSignature(mySignatory.sign_uuid, payload);
      } else {
        console.error('Error');
      }
    });
  }

  onSignature(sign_uuid: string, payload: any) {
    axios
      .put(
        `${environment.apiUrl2}/api/signature/update/${sign_uuid}`,
        payload,
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

  // Generate URL
  generateURL(form_uuid: string) {
    const url = `${window.location.origin}/form/ba/${form_uuid}`;

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
      .get(`${environment.apiUrl2}/ba/${form_uuid}`)
      .then((response) => {
        const BASE_URL = environment.apiUrl2;
        const formData = response.data.form;
        const signatories = response.data.signatories || [];

        // this.generatePDF2(formData, signatories);
      })
      .catch((error) => {
        console.error('Gagal mengambil data:', error);
      });
  }
}

export { formsBA };
