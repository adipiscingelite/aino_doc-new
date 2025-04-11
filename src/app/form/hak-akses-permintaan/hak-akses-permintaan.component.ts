import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
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
  form_name: string;
  nama_tim: string;
  product_manager: string;
  nama_pengusul: string;
  tanggal_usul: string;
  form_type: string;
  form_status: string;
  approval_status: string;
  created_by: string;
}

interface HakAkses {
  ha_uuid: string;
  nama_pengguna: string;
  ruang_lingkup: string;
  jangka_waktu: string;
}

@Component({
  selector: 'app-hak-akses-permintaan',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './hak-akses-permintaan.component.html',
  styleUrl: './hak-akses-permintaan.component.css',
})
export class HakAksesPermintaanComponent
  implements OnInit, AfterViewInit, OnDestroy
{
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

  document_uuid: string = '';

  form_uuid: string = '';
  form_number: string = '';
  form_type: string = 'Permintaan';
  form_name: string = '';
  nama_tim: string = '';
  product_manager: string = '';
  nama_pengusul: string = '';
  tanggal_usul: string = '';
  form_status: string = '';
  approval_status: string = '';

  ha_uuid: string = '';

  reason: string = '';

  created_by: string = '';
  created_at: string = '';
  updated_by: string = '';
  updated_at: string = '';
  deleted_by: string = '';
  deleted_at: string = '';

  userEmails: string[] = [];

  dataInfoHA: any[] = [];

  dataListAllUser: any = [];

  user_uuid: any;
  user_name: any;
  role_code: any;
  personal_name: string = '';

  signatories = [];
  name1: string = '';
  name2: string = '';
  name3: string = '';
  name4: string = '';

  position1: string = '';
  position2: string = '';
  position3: string = '';
  position4: string = '';

  roleSign1: string = 'Pengaju';
  roleSign2: string = 'Atasan Pengaju';
  roleSign3: string = 'Penerima';
  roleSign4: string = 'Atasan Penerima';

  is_sign: boolean = false;
  is_sign1: boolean = false;
  is_sign2: boolean = false;
  is_sign3: boolean = false;
  is_sign4: boolean = false;

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
    Pengaju: { name: '', position: '', is_sign: false, sign_img: '' },
    'Atasan Pengaju': { name: '', position: '', is_sign: false, sign_img: '' },
    Penerima: { name: '', position: '', is_sign: false, sign_img: '' },
    'Atasan Penerima': { name: '', position: '', is_sign: false, sign_img: '' },
  };

  isPreview: boolean = false;

  is_approve: boolean | null = null;
  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalSignOpen: boolean = false;
  isModalApproveOpen: boolean = false;

  dataListFormHA: formsHA[] = [];
  dataListFormAdminHA: formsHA[] = [];
  dataListFormUserHA: formsHA[] = [];

  dataListFormAdminHARequest: formsHA[] = [];
  dataListFormUserHARequest: formsHA[] = [];

  dataListFormAdminHADeletion: formsHA[] = [];
  dataListFormUserHADeletion: formsHA[] = [];

  hakAksesInfoData: HakAkses[] = [];
  deletedHakAksesInfoData: HakAkses[] = [];

  totalMyDocument: number = 0;
  totalReqRequest: number = 0;
  totalDelRequest: number = 0;

  constructor(
    private cookieService: CookieService,
    // private fb: FormBuilder,
    // public formItcmService: FormHaService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
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
    } else if (this.role_code === 'A') {
      this.adminOnly();
    } else if (this.role_code === 'M') {
      this.userOnly();
    }

    this.fetchAllUser();
    this.fetchDocumentUUID();

    this.route.paramMap.subscribe((params) => {
      const form_uuid = params.get('form_uuid');
      if (form_uuid) {
        this.openPreviewPage(form_uuid); // Panggil fungsi dengan UUID dari URL
      }
    });
  }

  superAdminOnly() {
    // document
    this.fetchDataFormHA();
  }

  adminOnly() {
    // document
    this.fetchDataAdminFormHA();
    this.fetchDataAdminFormHAReq();
    this.fetchDataAdminFormHADel();
  }

  userOnly() {
    // document
    this.fetchDataUserFormHA();
    this.fetchDataUserFormHAReq();
    this.fetchDataUserFormHADel();
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

  get dataRequestDocument(): formsHA[] {
    if (this.role_code === 'A') {
      return this.dataListFormAdminHARequest;
    } else if (this.role_code === 'M') {
      return this.dataListFormUserHARequest;
    }

    return [];
  }

  get dataDeletionDocument(): formsHA[] {
    if (this.role_code === 'A') {
      return this.dataListFormAdminHADeletion;
    } else if (this.role_code === 'M') {
      return this.dataListFormUserHADeletion;
    }

    return [];
  }

  matchesSearch(item: formsHA): boolean {
    const searchText = this.searchText.toLowerCase();

    return (
      item.form_number.toLowerCase().includes(searchText) ||
      item.form_type.toLowerCase().includes(searchText) ||
      item.nama_tim.toLowerCase().includes(searchText) ||
      item.product_manager.toLowerCase().includes(searchText) ||
      item.nama_pengusul.toLowerCase().includes(searchText) ||
      item.tanggal_usul.toLowerCase().includes(searchText)
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

  fetchDocumentUUID(): void {
    axios
      .get(`${environment.apiUrl2}/form/ha/code`)
      .then((response) => {
        this.document_uuid = response.data.document_uuid;
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
        this.cd.detectChanges(); // Force Angular to detect changes
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  fetchDataFormHA() {
    axios
      .get(`${environment.apiUrl2}/hak/akses`)
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListFormHA = response.data;

          this.totalMyDocument = this.dataListFormHA.length;
        }
        // console.log(response.data);
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
      .get(`${environment.apiUrl2}/admin/my/ha/req/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListFormAdminHA = response.data;

          this.totalMyDocument = this.dataListFormAdminHA.length;
        }
        console.log(response);
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  fetchDataUserFormHA() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ha`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListFormUserHA = response.data;

          this.totalMyDocument = this.dataListFormUserHA.length;
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  fetchDataAdminFormHAReq() {
    axios
      .get(`${environment.apiUrl2}/admin/my/ha/req/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListFormAdminHARequest = response.data.filter(
            (item: any) => item.form_type === 'Permintaan'
          );

          this.totalReqRequest = this.dataListFormAdminHARequest.length;
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  fetchDataUserFormHAReq() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ha`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListFormUserHARequest = response.data.filter(
            (item: any) => item.form_type === 'Permintaan'
          );

          this.totalReqRequest = this.dataListFormUserHARequest.length;
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  fetchDataAdminFormHADel() {
    axios
      .get(`${environment.apiUrl2}/admin/my/ha/req/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListFormAdminHADeletion = response.data.filter(
            (item: any) => item.form_type === 'Penghapusan'
          );

          this.totalDelRequest = this.dataListFormAdminHADeletion.length;
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
  }

  fetchDataUserFormHADel() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ha`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          this.dataListFormUserHADeletion = response.data.filter(
            (item: any) => item.form_type === 'Penghapusan'
          );

          this.totalDelRequest = this.dataListFormUserHADeletion.length;
        }
      })
      .catch((error) => {
        console.log(error.response);
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

  handleKeyDown(event: KeyboardEvent) {
    console.log(`Key pressed: ${event.key}`); // Debug output
    if (event.key === 'Escape') {
      this.closeAddModal();
      // this.closeEditModal();
      this.closeApproveModal();
      // this.closeSignModal();
      console.log('Modals closed');
    }
  }

  // infoHAForm: FormGroup = new FormGroup({
  //   data_info_ha: new FormArray([]),
  // });
  infoHAForm: FormGroup;

  getInfoHAField(): FormGroup {
    return this.fb.group({
      ha_uuid: new FormControl(''),
      nama_pengguna: new FormControl(''),
      ruang_lingkup: new FormControl(''),
      jangka_waktu: new FormControl(''),
    });
  }

  getInfoHAFieldsValue() {
    return this.infoHAForm?.get('data_info_ha')?.value.map((field: any) => {
      if (this.form_type === 'Permintaan') {
        return {
          ha_uuid: field.ha_uuid,
          nama_pengguna: field.nama_pengguna,
          ruang_lingkup: field.ruang_lingkup,
          jangka_waktu: field.jangka_waktu,
        };
      } else {
        return {
          ha_uuid: field.ha_uuid,
          nama_pengguna: field.nama_pengguna,
          ruang_lingkup: field.ruang_lingkup,
        };
      }
    });
  }

  get infoHAListArray(): FormArray {
    return this.infoHAForm.get('data_info_ha') as FormArray;
  }

  addInfoHAField() {
    const infoHaControl = this.fb.group({
      ha_uuid: ['', Validators.required],
      nama_pengguna: ['', Validators.required],
      ruang_lingkup: ['', Validators.required],
      jangka_waktu: [''],
    });
    this.infoHAListArray.push(infoHaControl);

    this.cd.detectChanges();

    // this.infoHAListArray.push(this.getInfoHAField());
  }

  removeInfoHAField(i: number) {
    this.infoHAListArray.removeAt(i);
  }

  data() {
    console.log(this.infoHAForm.value);
  }

  isAddButtonEnabled(): boolean {
    return this.infoHAListArray.controls.every((group) => {
      const isNamaPenggunaValid = group.get('nama_pengguna')?.valid;
      const isRuangLingkupValid = group.get('ruang_lingkup')?.valid;
      const isJangkaWaktuValid = group.get('jangka_waktu')?.valid || true; // Handle case where jangka_waktu is missing

      return isNamaPenggunaValid && isRuangLingkupValid && isJangkaWaktuValid;
    });
  }

  openAddModal() {
    this.isModalAddOpen = true;

    this.form_name = '';
    this.nama_tim = '';
    this.product_manager = '';
    this.nama_pengusul = '';
    this.tanggal_usul = '';

    this.name1 = '';
    this.name2 = '';
    this.name3 = '';
    this.name4 = '';

    this.position1 = '';
    this.position2 = '';
    this.position3 = '';
    this.position4 = '';

    const infoHAArray = this.infoHAListArray;
    infoHAArray.clear();

    this.addInfoHAField();

    this.cd.detectChanges();
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addFormDA() {
    if (
      !this.nama_tim ||
      !this.product_manager ||
      !this.nama_pengusul ||
      !this.tanggal_usul
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Form Tidak Lengkap',
        text: 'Pastikan semua field diisi sebelum melanjutkan!',
        timer: 1000,
        timerProgressBar: true,
        showCancelButton: false,
        showConfirmButton: false,
      });
      return; // Mencegah pengiriman data jika ada field yang kosong
    }

    const data = {
      isPublished: false,
      formData: {
        document_uuid: this.document_uuid,
        // form_status: "Draft"
      },
      haReq: {
        form_type: this.form_type,
        form_name: this.form_name,
        nama_tim: this.nama_tim,
        product_manager: this.product_manager,
        nama_pengusul: this.nama_pengusul,
        tanggal_usul: this.tanggal_usul,
      },
      data_info_ha_req: this.getInfoHAFieldsValue(),
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
      .post(`${environment.apiUrl2}/api/add/ha`, data, {
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
        this.fetchData();
        this.isModalAddOpen = false;
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
    // this.fetchDocumentUUID()
    // console.log('Document UUID 2:', this.document_uuid);
    axios
      .get(`${environment.apiUrl2}/ha/${form_uuid}`)
      .then((response) => {
        this.isModalEditOpen = true;
        const formData = response.data.form;

        this.hakAksesInfoData = response.data.data_info_ha;

        this.form_uuid = formData.form_uuid;
        this.document_uuid = this.document_uuid;
        this.form_name = formData.form_name;
        this.nama_tim = formData.nama_tim;
        this.product_manager = formData.product_manager;
        this.nama_pengusul = formData.nama_pengusul;
        this.tanggal_usul = formData.tanggal_usul;
        this.form_type = formData.form_type;

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

        if (response && response.data && response.data.data_info_ha) {
          this.hakAksesInfoData = response.data.data_info_ha.map(
            (info_ha: HakAkses) => ({
              ha_uuid: info_ha.ha_uuid,
              nama_pengguna: info_ha.nama_pengguna,
              ruang_lingkup: info_ha.ruang_lingkup,
              jangka_waktu: info_ha.jangka_waktu,
            })
          );

          this.infoHAForm.reset();
          this.infoHAListArray.clear();

          this.hakAksesInfoData.forEach((info_ha) => {
            this.infoHAListArray.push(
              this.fb.group({
                ha_uuid: new FormControl(info_ha.ha_uuid),
                nama_pengguna: new FormControl(info_ha.nama_pengguna),
                ruang_lingkup: new FormControl(info_ha.ruang_lingkup),
                jangka_waktu: new FormControl(info_ha.jangka_waktu || ''), // Pastikan jangka_waktu terdefinisi
              })
            );
          });
        } else {
          console.error('Error');
        }
      })
      .catch((error) => {
        // if (error.response.status === 404 || error.response.status === 500) {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        // }
      });
  }

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateFormHA() {
    const initialHakAkses: HakAkses[] = this.hakAksesInfoData;

    const newHakAkses: HakAkses[] = this.infoHAForm.value.data_info_ha;

    // Identifikasi data yang ditambahkan, tanpa ha_uuid
    const added: HakAkses[] = newHakAkses.filter(
      (newItem) =>
        !initialHakAkses.some(
          (existingItem) => existingItem.ha_uuid === newItem.ha_uuid
        )
    );

    // Identifikasi data yang dihapus, dengan ha_uuid
    const deleted: HakAkses[] = initialHakAkses.filter(
      (existingItem) =>
        !newHakAkses.some((newItem) => newItem.ha_uuid === existingItem.ha_uuid)
    );

    // Identifikasi data yang diupdate, dengan ha_uuid
    const updated: HakAkses[] = newHakAkses.filter((newItem) => {
      // Cari item yang memiliki ha_uuid yang sama di initialHakAkses
      const existingItem = initialHakAkses.find(
        (item) => item.ha_uuid === newItem.ha_uuid
      );

      // Hanya masukkan ke updated jika:
      // 1. ha_uuid tidak kosong (sudah ada di database)
      // 2. Ada perbedaan pada field yang relevan
      return (
        newItem.ha_uuid && // ha_uuid valid
        existingItem &&
        (newItem.nama_pengguna !== existingItem.nama_pengguna ||
          newItem.ruang_lingkup !== existingItem.ruang_lingkup ||
          newItem.jangka_waktu !== existingItem.jangka_waktu)
      );
    });

    // Menyiapkan data untuk dikirim
    const data = {
      formData: {
        form_uuid: this.form_uuid,
        form_name: this.form_name,
        nama_tim: this.nama_tim,
        product_manager: this.product_manager,
        nama_pengusul: this.nama_pengusul,
        tanggal_usul: this.tanggal_usul,
        form_type: this.form_type,
      },
      hakAksesInfoData: {
        info_ha: newHakAkses, // Daftar data setelah update
        added: added, // Data yang baru ditambahkan (tanpa ha_uuid)
        updated: updated, // Data yang diperbarui (dengan ha_uuid)
        deleted: deleted, // Data yang dihapus (dengan ha_uuid)
      },
      signatories: [
        {
          name: this.signatoryPositions['Pengaju'].name,
          position: this.signatoryPositions['Pengaju'].position,
          role_sign: 'Pengaju',
        },
        {
          name: this.signatoryPositions['Atasan Pengaju'].name,
          position: this.signatoryPositions['Atasan Pengaju'].position,
          role_sign: 'Atasan Pengaju',
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
        `${environment.apiUrl2}/api/hak/akses/update/${this.form_uuid}`,
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
        `${environment.apiUrl2}/ha/${form_uuid}`
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

  async openPreviewPage(form_uuid: any) {
    await this.profileData();
    axios
      .get(`${environment.apiUrl2}/ha/${form_uuid}`)
      .then((response) => {
        const BASE_URL = environment.apiUrl2;

        const formData = response.data.form;
        const infoData = response.data.data_info_ha;

        this.form_uuid = formData.form_uuid;
        this.form_number = formData.form_number;
        this.nama_tim = formData.nama_tim;
        this.product_manager = formData.product_manager;
        this.nama_pengusul = formData.nama_pengusul;
        this.tanggal_usul = formData.tanggal_usul;
        this.form_name = formData.form_name;
        this.form_type = formData.form_type;
        this.form_status = formData.form_status;
        this.approval_status = formData.approval_status;
        this.reason = formData.reason;

        this.dataInfoHA = infoData;

        this.isPreview = true;

        this.router.navigate([`/form/ha/${form_uuid}`]);

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
          } else if (error.response.status) {
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

    this.router.navigate([`/form/ha-permintaan`]);
  }

  openApproveModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/ha/${form_uuid}`)
      .then((response) => {
        console.log(response);
        const formData = response.data.form;
        this.created_at = formData.created_at;
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

    axios.get(`${environment.apiUrl2}/ha/${form_uuid}`).then((response) => {
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
        this.performDeleteFormHA(form_uuid);
      }
    });
  }

  performDeleteFormHA(form_uuid: string) {
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
    const url = `${window.location.origin}/form/ha/${form_uuid}`;

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
      .get(`${environment.apiUrl2}/ha/${form_uuid}`)
      .then((response) => {
        // const BASE_URL = environment.apiUrl2;
        const formData = response.data.form;
        const signatories = response.data.signatories || [];
        const dataInfoHA = response.data.data_info_ha || [];

        // Generate PDF dengan data dari API
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
      doc.text(
        `FORMULIR ${formData.form_type.toUpperCase()}`,
        textX2,
        textY2 - 5,
        {
          align: 'center',
        }
      );
      doc.text('HAK AKSES', textX2, textY2 + 5, {
        align: 'center',
      });

      doc.rect(tableX + 2 * boxWidth2, tableY, boxWidth2, boxHeight2);
      doc.setFontSize(9);
      const labelX3 = tableX + 2 * boxWidth2 + 2;
      const valueX3 = tableX + 2 * boxWidth2 + 28;
      let textY3 = tableY + boxHeight2 / 2 - 6;

      doc.text('No. Dokumen', labelX3, textY3);
      doc.text(`: AINO/PED/F/03/03`, valueX3, textY3);
      textY3 += 6;
      doc.text('Tanggal Terbit', labelX3, textY3);
      doc.text(': 6 Agustus 2019', valueX3, textY3);
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
    const titleText = `${formData.form_type.toUpperCase()} HAK AKSES`;
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
    doc.text(titleText, titleX, currentY);
    currentY += 5;

    // doc.setFontSize(9);
    // doc.setFont('helvetica', '', 700);
    // const nomorText = `Nomor : ${formData.form_number}`;
    // const nomorWidth = doc.getTextWidth(nomorText);
    // const nomorX = (doc.internal.pageSize.width - nomorWidth) / 2;
    // doc.text(nomorText, nomorX, currentY);
    // currentY += 5;

    doc.setFont('helvetica', 'normal');

    const lineWidth = (210 * 80) / 100;
    doc.setLineWidth(0.3);
    const lineX = (doc.internal.pageSize.width - lineWidth) / 2;
    doc.line(lineX, currentY, lineX + lineWidth, currentY);
    currentY += 10;

    doc.text('No. Formulir', 10, currentY);
    doc.text(`: ${formData.form_number}`, 60, currentY);
    currentY += 5;
    doc.text('Nama Tim', 10, currentY);
    doc.text(`: ${formData.nama_tim}`, 60, currentY);
    currentY += 5;
    doc.text('Product Manager', 10, currentY);
    doc.text(`: ${formData.product_manager}`, 60, currentY);
    currentY += 10;
    doc.text('Nama Pengusul', 10, currentY);
    doc.text(`: ${formData.nama_pengusul}`, 60, currentY);
    currentY += 5;
    doc.text('Tanggal Usul', 10, currentY);
    doc.text(`: ${formData.tanggal_usul}`, 60, currentY);
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

    const renderTable = (doc: jsPDF, dataInfoHA: any[]) => {
      const pageWidth = doc.internal.pageSize.width;
      const boxWidth = pageWidth * 0.9;
      const startX = (pageWidth - boxWidth) / 2; // Center the table

      const colWidths = [boxWidth * 0.4, boxWidth * 0.3, boxWidth * 0.3]; // Adjust column widths
      const rowHeight = 6; // Height of each row

      // Add space for the table and header
      checkSpaceAndAddPage(doc, rowHeight * (dataInfoHA.length + 1) + 10); // Adjust to fit table and row height

      // Draw the table border
      doc.rect(startX, currentY, boxWidth, rowHeight * (dataInfoHA.length + 1));

      // Draw the header line
      doc.line(
        startX,
        currentY + rowHeight,
        startX + boxWidth,
        currentY + rowHeight
      );

      // Header text
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      // Ubah teks menjadi uppercase
      const namaPengguna = 'Nama Pengguna'.toUpperCase();
      const ruangLingkup = 'Ruang Lingkup'.toUpperCase();
      const jangkaWaktu = 'Jangka Waktu'.toUpperCase();

      // Align teks ke tengah
      doc.text(namaPengguna, startX + colWidths[0] / 2 + 2, currentY + 4, {
        align: 'center',
      });
      doc.text(
        ruangLingkup,
        startX + colWidths[0] + colWidths[1] / 2 + 2,
        currentY + 4,
        { align: 'center' }
      );
      doc.text(
        jangkaWaktu,
        startX + colWidths[0] + colWidths[1] + colWidths[2] / 2 + 2,
        currentY + 4,
        { align: 'center' }
      );

      currentY += rowHeight;

      // Table content
      doc.setFont('helvetica', 'normal');
      dataInfoHA.forEach((item: any) => {
        checkSpaceAndAddPage(doc, rowHeight); // Ensure space for the row

        doc.text(item.nama_pengguna, startX + 2, currentY + 4);
        doc.text(item.ruang_lingkup, startX + colWidths[0] + 2, currentY + 4);
        doc.text(
          item.jangka_waktu,
          startX + colWidths[0] + colWidths[1] + 2,
          currentY + 4
        );

        // Draw the line separator for each row
        doc.line(
          startX,
          currentY + rowHeight,
          startX + boxWidth,
          currentY + rowHeight
        );
        currentY += rowHeight;

        // If there's not enough space, move to the next page
        if (currentY > 270) {
          doc.addPage();
          currentY = 20; // Reset to top of the new page
          doc.rect(
            startX,
            currentY,
            boxWidth,
            rowHeight * (dataInfoHA.length + 1)
          ); // Redraw table border
        }
      });

      // Draw column separators
      let colX = startX;
      colWidths.forEach((width) => {
        colX += width;
        doc.line(
          colX,
          currentY - rowHeight * dataInfoHA.length,
          colX,
          currentY
        );
      });
    };

    renderTable(doc, dataInfoHA);
    currentY += 10;

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
    // addTextWithBox(doc, 'Jenis Perubahan:', formData.jenis_perubahan);

    // addTextWithBox(
    //   doc,
    //   'Detail Dampak Perubahan:',
    //   formData.detail_dampak_perubahan
    // );

    // addTextWithBox(
    //   doc,
    //   'Rencana Pengembangan Perubahan:',
    //   formData.rencana_pengembangan_perubahan
    // );

    // addTextWithBox(
    //   doc,
    //   'Rencana Pengujian Perubahan Sistem:',
    //   formData.rencana_pengujian_perubahan_sistem
    // );

    // addTextWithBox(
    //   doc,
    //   'Rencana Rilis Perubahan dan Implementasi:',
    //   formData.rencana_rilis_perubahan_dan_implementasi
    // );

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
        Pengaju: 0,
        'Atasan Pengaju': 1,
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
        'Pengaju',
        'Atasan Pengaju',
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

    const fileName = `Form_HA_${formData.form_number}.pdf`;

    // Simpan PDF dengan nama file yang sudah ditentukan
    doc.save(fileName);

    // Segarkan halaman setelah download
    window.location.reload();
  }
}
