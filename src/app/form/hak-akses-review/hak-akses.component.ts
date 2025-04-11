import {
  Component,
  OnInit,
  Inject,
  HostListener,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { FormHaService } from '../../services/form-ha/form-ha.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import SignaturePad from 'signature_pad';
import jsPDF from 'jspdf';

interface Signatory {
  sign_uuid: string;
  signatory_name: string;
  signatory_position: string;
  role_sign: string;
  is_sign: boolean;
  sign_img: string | { String: string };
}

interface formsHA {
  form_uuid: string;
  form_number: string;
  form_ticket: string;
  form_name: string;
  form_status: string;
  document_name: string;
  approval_status: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  deleted_by: string;
  deleted_at: string;
}

interface Documents {
  document_uuid: string;
  document_name: string;
}

export interface HakAksesInfo {
  info_uuid: string;
  host: string;
  info_name: string;
  instansi: string;
  position: string;
  username: string;
  password: string;
  scope: string;
  type: string;
  matched: string;
  description: string;
}

@Component({
  selector: 'app-hak-akses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './hak-akses.component.html',
  styleUrl: './hak-akses.component.css',
})
export class HakAksesComponent implements OnInit, AfterViewInit, OnDestroy {
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

  isPreview: boolean = false; // State untuk menampilkan preview atau tabel

  searchText: string = '';

  form!: FormGroup;
  user_uuid: any;
  user_name: any;
  role_code: any;
  personal_name: any;

  dataListAllDoc: Documents[] = [];

  dataInfoHA: any[] = [];

  form_uuid: any;

  document_uuid: string = '';
  //768e9241-c9ca-411f-8b91-4fb3ca7728bf
  form_name: string = '';
  pada: string = '';
  start_at: string = '';
  ended_at: string = '';

  created_by: string = '';
  created_at: string = '';
  updated_by: string = '';
  updated_at: string = '';
  deleted_by: string = '';
  deleted_at: string = '';

  info_uuid: string = '';
  info_name: string = '';

  dataListAllUser: any = [];

  userEmails: string[] = [];

  form_number: string = '';

  host: string = '';
  name: string = '';
  instansi: string = '';
  jabatan: string = '';
  username: string = '';
  password: string = '';
  scope: string = '';
  type: string = '';
  matched: string = '';
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

  roleSign1: string = 'Direview oleh';
  roleSign2: string = 'Diketahui oleh';
  roleSign3: string = '';
  roleSign4: string = '';
  roleSign5: string = '';

  is_sign: boolean = false;
  is_sign1: boolean = false;
  is_sign2: boolean = false;
  is_sign3: boolean = false;
  is_sign4: boolean = false;
  is_sign5: boolean = false;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalApproveOpen: boolean = false;

  dataListDocument: Documents[] = [];

  dataListFormHA: formsHA[] = [];
  dataListFormAdminHA: formsHA[] = [];
  dataListFormUserHA: formsHA[] = [];

  // draft
  dataListFormAdminHADraft: formsHA[] = [];
  dataListFormUserHADraft: formsHA[] = [];

  // signature
  dataListFormHASignature: formsHA[] = [];

  hakAksesInfoData: HakAksesInfo[] = [];

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
    'Direview oleh': { name: '', position: '', is_sign: false, sign_img: '' },
    'Diketahui oleh': { name: '', position: '', is_sign: false, sign_img: '' },
    // Penerima: { name: '', position: '', is_sign: false },
    // 'Atasan Penerima': { name: '', position: '', is_sign: false },
  };

  totalMyDocument: number = 0;
  totalDraft: number = 0;
  totalMySignature: number = 0;
  totalApproved: number = 0;
  totalRejected: number = 0;

  constructor(
    private cookieService: CookieService,
    private fb: FormBuilder,
    public formHaService: FormHaService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;

    this.infoHAForm = this.fb.group({
      data_info_ha: this.fb.array([]),
    });
  }

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

    this.fetchAllUser();
    this.fetchAllDocument();
    this.fetchDocumentUUID();

    // signature
    this.fetchUserSignature();

    this.route.paramMap.subscribe((params) => {
      const form_uuid = params.get('form_uuid');
      if (form_uuid) {
        this.openPreviewPage(form_uuid); // Panggil fungsi dengan UUID dari URL
      }
    });

    this.route.queryParams.subscribe((params) => {
      this.openTab = params['tab'] ? Number(params['tab']) : 1;
    });
  }

  superAdminOnly() {
    // document
    this.fetchDataFormHA();
  }

  adminOnly() {
    // document
    this.fetchDataAdminFormHA();
    // draft
    this.fetchDataAdminFormHADraft();
    // approve
    // this.fetchDataAdminFormBAApproved();
    // // rejected
    // this.fetchDataAdminFormBARejected();
  }

  userOnly() {
    // document
    this.fetchDataUserFormHA();
    // draft
    this.fetchDataUserFormHADraft();
    // approve
    // this.fetchDataUserFormBAApproved();
    // // rejected
    // this.fetchDataUserFormBARejected();
  }

  // * untuk tabel
  get dataMyDocument(): formsHA[] {
    if (this.role_code === 'SA') {
      return this.dataListFormHA;
    } else if (this.role_code === 'A') {
      return this.dataListFormAdminHA;
    } else if (this.role_code === 'M') {
      return this.dataListFormUserHA;
    }

    return [];
  }

  get dataFormHADraft(): formsHA[] {
    if (this.role_code === 'SA') {
      return this.dataListFormAdminHADraft;
    } else if (this.role_code === 'A') {
      return this.dataListFormAdminHADraft;
    } else if (this.role_code === 'M') {
      return this.dataListFormUserHADraft;
    }

    return [];
  }

  matchesSearch(item: formsHA): boolean {
    const searchText = this.searchText.toLowerCase();
    return (
      item.form_number.toLowerCase().includes(searchText) ||
      item.form_ticket.toLowerCase().includes(searchText) ||
      item.form_name.toLowerCase().includes(searchText) ||
      item.document_name.toLowerCase().includes(searchText)
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

  fetchDataFormHA() {
    axios
      .get(`${environment.apiUrl2}/hak/akses/review`)
      .then((response) => {
        this.dataListFormHA = response.data;
        this.totalMyDocument = this.dataListFormHA.length;
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data.message);
        } else if (error.response.status === 404) {
          console.log(error.response.data.message);
        }
      });
  }

  fetchDataAdminFormHA() {
    axios
      .get(`${environment.apiUrl2}/admin/my/ha/review/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListFormAdminHA = response.data;
        this.totalMyDocument = this.dataListFormAdminHA.length;
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  fetchDataUserFormHA() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ha/review`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          this.dataListFormUserHA = response.data;
          this.totalMyDocument = this.dataListFormUserHA.length;
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  fetchDocumentUUID(): void {
    axios
      .get(`${environment.apiUrl2}/form/ha/code`)
      .then((response) => {
        this.document_uuid = response.data.document_uuid;
      })
      .catch((error) => {
        console.error('Error fetching document UUID:', error);
      });
    ``;
  }

  fetchAllUser() {
    axios
      .get(`${this.apiUrl}/personal/name/all`)
      .then((response) => {
        this.dataListAllUser = response.data;
        this.cd.detectChanges();
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

  // signature
  fetchUserSignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/ha`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          this.dataListFormHASignature = response.data.filter(
            (item: any) => item.form_status === 'Published'
          );

          this.totalMySignature = this.dataListFormHASignature.length;
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 500) {
            console.log(error.response.data);
          } else {
            console.log(error.response.data);
          }
        } else {
          console.error('Error Message:', error.message);
        }
      });
  }

  //! my document yg draft
  // draft admin
  fetchDataAdminFormHADraft(): void {
    axios
      .get(`${environment.apiUrl2}/admin/my/ha/review/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          this.dataListFormAdminHADraft = response.data.filter(
            (item: any) => item.form_status === 'Draft'
          );

          this.totalDraft = this.dataListFormAdminHADraft.length;
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

  // draft user
  fetchDataUserFormHADraft() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ha/review`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          this.dataListFormUserHADraft = response.data.filter(
            (item: any) => item.form_status === 'Draft'
          );

          this.totalDraft = this.dataListFormUserHADraft.length;
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
    this.closePopover();
  }

  // input dinamis coy

  infoHAForm: FormGroup;

  getInfoHAField(): FormGroup {
    return this.fb.group({
      host: new FormControl(''),
      info_name: new FormControl(''),
      instansi: new FormControl(''),
      position: new FormControl(''),
      username: new FormControl(''),
      password: new FormControl(''),
      scope: new FormControl(''),
      type: new FormControl(''),
      matched: new FormControl(''),
      description: new FormControl(''),
    });
  }

  getInfoHAFieldsValue() {
    return this.infoHAForm?.get('data_info_ha')?.value.map((field: any) => {
      return {
        info_name: field.info_name,
        host: field.host,
        instansi: field.instansi,
        position: field.position,
        username: field.username,
        password: field.password,
        scope: field.scope,
        type: field.type,
        matched: field.matched,
        description: field.description,
      };
    });
  }

  get infoHAListArray(): FormArray {
    return this.infoHAForm.get('data_info_ha') as FormArray;
  }

  addInfoHAField() {
    const infoHaControl = this.fb.group({
      host: ['', Validators.required],
      info_uuid: ['', Validators.required],
      info_name: ['', Validators.required],
      instansi: ['', Validators.required],
      position: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      scope: ['', Validators.required],
      type: ['', Validators.required],
      matched: ['', Validators.required],
      description: ['', Validators.required],
    });
    this.infoHAListArray.push(infoHaControl);

    this.cd.detectChanges();
  }

  removeInfoHAField(i: number) {
    this.infoHAListArray.removeAt(i);
  }

  data() {
    console.log(this.infoHAForm.value);
  }

  approveForm(form_uuid: any) {}

  isAddButtonEnabled(): boolean {
    return this.infoHAListArray.controls.every((group) => {
      const isNamaPenggunaValid = group.get('info_name')?.valid;
      const isRuangLingkupValid = group.get('instansi')?.valid;
      const isJangkaWaktuValid = group.get('position')?.valid;
      const isUsernameValid = group.get('username')?.valid;
      const isPasswordValid = group.get('password')?.valid;
      const isScopeValid = group.get('scope')?.valid;
      const isTypeValid = group.get('type')?.valid;
      const isMatchedValid = group.get('matched')?.valid;
      const isDescriptionValid = group.get('description')?.valid;

      return (
        isNamaPenggunaValid &&
        isRuangLingkupValid &&
        isJangkaWaktuValid &&
        isUsernameValid &&
        isPasswordValid &&
        isScopeValid &&
        isTypeValid &&
        isMatchedValid &&
        isDescriptionValid
      );
    });
  }

  openAddModal() {
    this.form_name = '';
    this.pada = '';
    this.start_at = '';
    this.ended_at = '';

    this.name1 = '';
    this.name2 = '';
    this.name3 = '';
    this.name4 = '';

    this.position1 = '';
    this.position2 = '';
    this.position3 = '';
    this.position4 = '';

    this.isModalAddOpen = true;

    const infoHAArray = this.infoHAListArray;
    infoHAArray.clear();

    this.addInfoHAField();

    this.cd.detectChanges();
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addFormHA() {
    if (!this.form_name) {
      Swal.fire({
        icon: 'error',
        title: 'Form Tidak Lengkap',
        text: 'Pastikan semua field diisi sebelum melanjutkan!',
        timer: 1000,
        timerProgressBar: true,
        showCancelButton: false,
        showConfirmButton: false,
      });
      return;
    }

    const postData = {
      isPublished: false,
      formData: {
        document_uuid: this.document_uuid,
      },
      ha: {
        form_name: this.form_name,
        form_type: 'Review',
        pada: this.pada,
        start_at: this.start_at,
        ended_at: this.ended_at,
      },
      data_info_ha: this.getInfoHAFieldsValue(),
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
      ],
    };

    axios
      .post(`${environment.apiUrl2}/api/add/ha/review`, postData, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: response.data.message,
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.isModalAddOpen = false;
        this.fetchData();
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
  }

  openEditModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/ha/review/${form_uuid}`)
      .then((response) => {
        const formData = response.data;

        if (formData.form.form_status === 'Published') {
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
        } else if (formData.form.form_status === 'Draft') {
          this.isModalEditOpen = true;
        }

        this.hakAksesInfoData = formData.data_info_ha;

        this.form_uuid = formData.form.form_uuid;
        this.form_name = formData.form.form_name;
        this.pada = formData.form.pada;

        this.start_at = formData.form.start_at;
        this.ended_at = formData.form.ended_at;

        this.hakAksesInfoData = response.data.data_info_ha;

        const signData: Signatory[] = response.data.signatories;
        signData.forEach((sign: Signatory) => {
          const role = sign.role_sign;

          // Ensure the key exists before assigning values
          if (this.signatoryPositions[role]) {
            this.signatoryPositions[role].name = sign.signatory_name;
            this.signatoryPositions[role].position = sign.signatory_position;
            this.signatoryPositions[role].is_sign = sign.is_sign;
          }
        });

        // Ensure this matches the template
        if (response && response.data && response.data.data_info_ha) {
          this.hakAksesInfoData = response.data.data_info_ha.map(
            (info_ha: HakAksesInfo) => ({
              host: info_ha.host,
              info_uuid: info_ha.info_uuid,
              info_name: info_ha.info_name,
              instansi: info_ha.instansi,
              position: info_ha.position,
              username: info_ha.username,
              password: info_ha.password,
              scope: info_ha.scope,
              type: info_ha.type,
              matched: info_ha.matched === 'Sesuai' ? true : false,
              description: info_ha.description,
            })
          );

          this.infoHAForm.reset();
          this.infoHAListArray.clear();

          this.hakAksesInfoData.forEach((info_ha) => {
            this.infoHAListArray.push(
              this.fb.group({
                host: new FormControl(info_ha.host),
                info_uuid: new FormControl(info_ha.info_uuid),
                info_name: new FormControl(info_ha.info_name),
                instansi: new FormControl(info_ha.instansi),
                position: new FormControl(info_ha.position),
                username: new FormControl(info_ha.username),
                password: new FormControl(info_ha.password),
                scope: new FormControl(info_ha.scope),
                type: new FormControl(info_ha.type),
                matched: new FormControl(info_ha.matched ? 'true' : 'false'), // Perbaikan di sini
                description: new FormControl(info_ha.description),
              })
            );
          });
        } else {
          console.error('Response tidak memiliki data_info_ha');
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

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateFormHA() {
    const initialHakAkses: HakAksesInfo[] = this.hakAksesInfoData;

    const newHakAkses: HakAksesInfo[] = this.infoHAForm.value.data_info_ha;

    const added: HakAksesInfo[] = newHakAkses.filter(
      (newItem) =>
        !initialHakAkses.some(
          (existingItem) => existingItem.info_uuid === newItem.info_uuid
        )
    );

    const deleted: HakAksesInfo[] = initialHakAkses.filter(
      (existingItem) =>
        !newHakAkses.some(
          (newItem) => newItem.info_uuid === existingItem.info_uuid
        )
    );

    const updated: HakAksesInfo[] = newHakAkses.filter((newItem) => {
      const existingItem = initialHakAkses.find(
        (item) => item.info_uuid === newItem.info_uuid
      );

      return (
        newItem.info_uuid &&
        existingItem &&
        (newItem.info_name !== existingItem.info_name ||
          newItem.instansi !== existingItem.instansi ||
          newItem.position !== existingItem.position ||
          newItem.username !== existingItem.username ||
          newItem.password !== existingItem.password ||
          newItem.scope !== existingItem.scope ||
          newItem.type !== existingItem.type ||
          newItem.matched !== existingItem.matched ||
          newItem.description !== existingItem.description)
      );
    });

    const data = {
      formData: {
        form_uuid: this.form_uuid,
        form_name: this.form_name,
        pada: this.pada,
        form_type: 'Review',
        start_at: this.start_at,
        ended_at: this.ended_at,
      },
      hak_akses_info_data: {
        info_ha_review: newHakAkses,
        added: added,
        updated: updated,
        deleted: deleted,
      },
      signatories: [
        {
          name: this.signatoryPositions['Direview oleh'].name,
          position: this.signatoryPositions['Direview oleh'].position,
          role_sign: 'Direview oleh',
        },
        {
          name: this.signatoryPositions['Diketahui oleh'].name,
          position: this.signatoryPositions['Diketahui oleh'].position,
          role_sign: 'Diketahui oleh',
        },
      ],
    };

    axios
      .put(
        `${environment.apiUrl2}/api/hak/akses/review/update/${this.form_uuid}`,
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

  async fetchUserEmail(form_uuid: string): Promise<void> {
    try {
      const response = await axios.get(
        `${environment.apiUrl2}/ha/review/${form_uuid}`
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

      const link = `${window.location.origin}/form/ha/${form_uuid}`;

      await axios.post(
        `${environment.apiUrl2}/send-email`,
        {
          to: this.userEmails,
          subject: 'Formulir Baru dari Woila untuk Ditandatangani - HA',
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

  async publish(form_uuid: string) {
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
              form_ticket: '',
              // masih salah dibagian ini, kalo ha gaada form ticket, jadi kubikin statis aja dulu
              // tp harus string
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

  openPreviewPage(form_uuid: any) {
    axios
      .get(`${environment.apiUrl2}/ha/review/${form_uuid}`)
      .then((response) => {
        const BASE_URL = environment.apiUrl2;

        const formData = response.data.form;
        const infoData = response.data.data_info_ha;

        this.form_uuid = formData.form_uuid;
        this.form_number = formData.form_number;
        this.form_name = formData.form_name;
        this.pada = formData.pada;

        this.start_at = Intl.DateTimeFormat('id-ID', {
          month: 'long',
          year: 'numeric',
        }).format(new Date(formData.start_at));
        this.ended_at = Intl.DateTimeFormat('id-ID', {
          month: 'long',
          year: 'numeric',
        }).format(new Date(formData.ended_at));

        this.dataInfoHA = infoData;

        this.isPreview = true;

        this.router.navigate([`/form/ha-review/${form_uuid}`]);

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
              signatory?.signatory_name?.trim().toLowerCase() ===
              this.personal_name?.trim().toLowerCase()
          );

          if (this.mySignatory) {
            this.isSigned = this.mySignatory.is_sign;
          } else {
            console.log('Signatory not found');
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

    this.router.navigate([`/form/hak-akses`]);
  }

  // openApproveModal(form_uuid: string) {
  //   axios.get(`${environment.apiUrl2}/itcm/${form_uuid}`).then((response) => {
  //     this.isModalAddOpen = true;
  //     this.form_ticket = response.data.form_ticket;
  //     this.formatted_form_number = response.data.formatted_form_number;
  //     this.form_status = response.data.form_status;
  //     this.document_name = response.data.document_name;
  //     this.project_name = response.data.project_name;
  //     this.project_manager = response.data.project_manager;
  //     this.approval_status = response.data.approval_status;
  //     this.deskripsi = response.data.deskripsi;
  //     this.created_by = response.data.created_by;
  //     this.created_at = response.data.created_at;
  //     this.updated_by = response.data.updated_by;
  //     this.updated_at = response.data.updated_at;
  //     this.deleted_by = response.data.deleted_by;
  //     this.deleted_at = response.data.deleted_at;
  //   });
  // }

  // closeApproveModal() {
  //   this.isModalApproveOpen = false;
  // }

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

    axios
      .get(`${environment.apiUrl2}/ha/review/${form_uuid}`)
      .then((response) => {
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
            sign_img: dataURL, // Include the Base64 signature image
          };

          // Send the update to the backend
          this.onSignature(mySignatory.sign_uuid, payload);
        } else {
          console.log('Signatory not found');
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

  onDeleteFormHA(form_uuid: string) {
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

  // copy
  generateURL(form_uuid: string) {
    // Generate URL
    const url = `${window.location.origin}/form/ha-review/${form_uuid}`;

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
      .get(`${environment.apiUrl2}/ha/review/${form_uuid}`)
      .then((response) => {
        // const BASE_URL = environment.apiUrl2;
        const formData = response.data.form;
        const signatories = response.data.signatories || [];
        const dataInfoHA = response.data.data_info_ha || [];

        this.generatePDF2(formData, dataInfoHA, signatories);
      })
      .catch((error) => {
        console.error('Gagal mengambil data:', error);
      });
  }

  generatePDF2(formData: any, dataInfoHA: any, signatories: any) {
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
      doc.text(`FORMULIR REVIEW`, textX2, textY2 - 5, {
        align: 'center',
      });
      doc.text('HAK AKSES', textX2, textY2 + 5, {
        align: 'center',
      });

      doc.rect(tableX + 2 * boxWidth2, tableY, boxWidth2, boxHeight2);
      doc.setFontSize(9);
      const labelX3 = tableX + 2 * boxWidth2 + 2;
      const valueX3 = tableX + 2 * boxWidth2 + 25;
      let textY3 = tableY + boxHeight2 / 2 - 6;

      doc.text('No. Dokumen', labelX3, textY3);
      doc.text(`: AINO/PRODEV/F/06/03`, valueX3, textY3);
      textY3 += 6;
      doc.text('Tanggal Terbit', labelX3, textY3);
      doc.text(': 1 Maret 2017', valueX3, textY3);
      textY3 += 6;
      doc.text('No. Revisi', labelX3, textY3);
      doc.text(': 0.0', valueX3, textY3);
      textY3 += 6;
      doc.text('Halaman', labelX3, textY3);
      doc.text(`: ${pageNumber}`, valueX3, textY3);
    };

    let pageNumber = 1;
    addHeader(doc, pageNumber);

    doc.setFontSize(10);
    doc.setFont('helvetica', '', 700);
    const titleText = `FORMULIR HAK AKSES`;
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

    doc.text('Nama', 10, currentY);
    doc.text(`: ${formData.form_name}`, 30, currentY);
    currentY += 5;
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
      };
      return date.toLocaleDateString('id-ID', options);
    };

    doc.text(
      `Peninjauan hak akses Periode ${formatDate(
        formData.start_at
      )} - ${formatDate(formData.ended_at)} pada ${
        formData.pada
      } sebagai berikut:  `,
      10,
      currentY
    );

    currentY += 5;

    const checkSpaceAndAddPage = (doc: jsPDF, requiredSpace: number) => {
      if (currentY + requiredSpace > pageHeight - 10) {
        doc.addPage();
        pageNumber++;
        addHeader(doc, pageNumber);
        doc.setFont('helvetica', 'normal');
        currentY = 50;
      }
    };

    const renderTable = (doc: jsPDF, dataInfoHA: any) => {
      const pageWidth = doc.internal.pageSize.width * 0.9;
      const margin = (doc.internal.pageSize.width - pageWidth) / 2;
      const boxWidth = pageWidth;
      const rowHeight = 6;
      const startX = margin;

      const colWidthsRatio = [1, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.3, 1.1, 2, 1];
      const colWidths = colWidthsRatio.map(
        (ratio) => (boxWidth * ratio) / colWidthsRatio.reduce((a, b) => a + b)
      );

      const headers = [
        'No',
        'Host',
        'NAMA PEMEGANG HAK AKSES',
        'Type',
        'Sesuai/Tidak Sesuai',
        'Ket',
      ];
      const subHeaders = [
        '',
        '',
        'Nama',
        'Instansi',
        'Jabatan',
        'Username',
        'Password',
        'Scope',
        '',
        '',
        '',
      ];
      const headerWidths = [
        colWidths[0],
        colWidths[1],
        colWidths.slice(2, 8).reduce((a, b) => a + b),
        13.5,
        24.5,
        12.5,
      ];
      checkSpaceAndAddPage(doc, rowHeight * (dataInfoHA.length + 2) + 10);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');

      let colX = startX;
      headers.forEach((header, i) => {
        const width = headerWidths[i];
        doc.rect(colX, currentY, width, rowHeight);
        doc.text(header, colX + width / 2, currentY + rowHeight / 2, {
          align: 'center',
          baseline: 'middle',
        });
        colX += width;
      });

      currentY += rowHeight;

      colX = startX;
      subHeaders.forEach((subHeader, i) => {
        const width = colWidths[i];
        doc.rect(colX, currentY, width, rowHeight);
        if (subHeader) {
          doc.text(subHeader, colX + width / 2, currentY + rowHeight / 2, {
            align: 'center',
            baseline: 'middle',
          });
        }
        colX += width;
      });

      currentY += rowHeight;

      doc.setFontSize(8);

      doc.setFont('helvetica', 'normal');
      dataInfoHA.forEach((item: any, index: number) => {
        checkSpaceAndAddPage(doc, rowHeight);

        const values = [
          (index + 1).toString(),
          item.host || '',
          item.info_name || '',
          item.instansi || '',
          item.position || '',
          item.username || '',
          '*****',
          item.scope || '',
          item.type || '',
          item.matched || '',
          item.description || '',
        ];

        colX = startX;
        values.forEach((value, i) => {
          const width = colWidths[i];
          doc.rect(colX, currentY, width, rowHeight); // Garis kotak untuk setiap sel
          doc.text(value, colX + width / 2, currentY + rowHeight / 2, {
            align: 'center',
            baseline: 'middle',
          });
          colX += width;
        });

        currentY += rowHeight;
      });
    };

    renderTable(doc, dataInfoHA);
    currentY += 10;

    const addSignatureTable = (doc: jsPDF): void => {
      const tableWidth: number = doc.internal.pageSize.width * 0.9;
      const tableX: number = (doc.internal.pageSize.width - tableWidth) / 2;
      const rowHeight: number = 50;
      const colWidth: number = tableWidth * 0.25;

      checkSpaceAndAddPage(doc, rowHeight + 10);

      const imageWidth: number = 40;
      const imageHeight: number = 20;

      const signatoryMap: { [key: string]: number } = {
        'Direview oleh': 0,
        'Diketahui oleh': 1,
      };

      const formattedSignatories: Signatory[] = new Array(2)
        .fill(null)
        .map(() => ({
          sign_uuid: '',
          signatory_name: '',
          signatory_position: '',
          role_sign: '',
          is_sign: false,
          sign_img: '',
        }));

      signatories.forEach((signatory: Signatory) => {
        const index = signatoryMap[signatory.role_sign];
        if (index !== undefined) {
          formattedSignatories[index] = signatory;
        }
      });

      const headers: string[] = ['Direview oleh', 'Diketahui oleh'];
      doc.setFont('helvetica', 'bold');
      headers.forEach((header: string, i: number) => {
        const x: number = tableX + (i + 2) * colWidth;
        doc.rect(x, currentY, colWidth, 10);
        doc.text(header, x + colWidth / 2, currentY + 7, { align: 'center' });
      });

      currentY += 10;
      headers.forEach((_header: string, i: number) => {
        const x: number = tableX + (i + 2) * colWidth;
        doc.rect(x, currentY, colWidth, rowHeight);
      });

      // Tambahkan tanda tangan, nama, dan jabatan
      currentY += 5;
      formattedSignatories.forEach((signatory, i) => {
        const x: number = tableX + (i + 2) * colWidth; // Agar berada di sebelah kanan (menambahkan 2 kolom kosong)
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

    const pdfBlob = doc.output('blob');

    const pdfUrl = URL.createObjectURL(pdfBlob);

    window.open(pdfUrl, '_blank');
  }
}

export { formsHA };
