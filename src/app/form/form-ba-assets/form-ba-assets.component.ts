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
import axios from 'axios';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule, NgModel } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import SignaturePad from 'signature_pad';
interface Signatory {
  sign_uuid: string;
  signatory_name: string;
  signatory_position: string;
  role_sign: string;
  is_sign: boolean;
  sign_img: string | { String: string };
  is_guest: boolean;
}

interface BeritaAcara {
  form_uuid: string;
  form_number: string;
  form_status: string;
  document_name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
  deleted_by: string;
  deleted_at: string;
  asset_uuid: string;
  kode_asset: string;
  jenis: string;
  pihak_pertama: string;
  nama_pic: string;
  jabatan_pic: string;
}

@Component({
  selector: 'app-form-ba-assets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-ba-assets.component.html',
  styleUrl: './form-ba-assets.component.css',
})
export class FormBaAssetsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sigPad', { static: false })
  sigPad!: ElementRef<HTMLCanvasElement>;
  @ViewChild('modal', { static: false }) modal!: ElementRef<HTMLDivElement>;
  @ViewChild('closeButton', { static: false })
  closeButton!: ElementRef<HTMLButtonElement>;

  private signaturePad!: SignaturePad;

  img: string | null = null;
  penColor: string = '#262626';

  user_uuid: any;
  user_name: any;
  role_code: any;
  personal_name: string = '';

  form_uuid: string = '';
  form_number: string = '';
  form_status: string = '';
  document_uuid: string = '';
  document_name: string = '';
  created_by: string = '';
  created_at: string = '';
  pihak_pertama: string = '';
  jabatan_pihak_pertama: string = '';
  nama_pic: string = '';
  jabatan_pic: string = '';
  jenis: string = '';
  asset_uuid: string = '';
  asset_type: string = '';
  kondisi: string = '';
  aksesoris: string = '';
  reason: string = '';
  kode_asset: string = '';
  nama_asset: string = '';
  merk: string = '';
  model: string = '';
  spesifikasi_asset: string = '';
  serial_number: string = '';

  images: any;

  sign_uuid: string = '';
  is_guest: boolean = false;

  day: string = '';
  date: number = 0;
  month: string = '';
  year: number = 0;

  isModalAddOpen: boolean = false;
  isModalAddBeritaAcaraOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalSignOpen: boolean = false;
  isModalApproveOpen: boolean = false;

  isPreview: boolean = false;

  searchText: string = '';

  isSigned: boolean = false;
  mySignatory: Signatory | undefined;

  signatoryPositions: {
    [key: string]: {
      sign_uuid: string;
      name: string;
      position: string;
      is_sign: boolean;
      sign_img: string;
      is_guest: boolean;
    };
  } = {
    'Pihak Pertama': {
      sign_uuid: '',
      name: '',
      position: '',
      is_sign: false,
      sign_img: '',
      is_guest: false,
    },
    'Pihak Kedua': {
      sign_uuid: '',
      name: '',
      position: '',
      is_sign: false,
      sign_img: '',
      is_guest: false,
    },
  };

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  async ngOnInit(): Promise<void> {
    // ? mendapatkan role code
    await this.profileData();
    this.fetchDataBeritaAcara();
    this.fetchDocumentUUID();

    this.route.paramMap.subscribe((params) => {
      const form_uuid = params.get('form_uuid');
      if (form_uuid) {
        this.openPreviewPage(form_uuid);
      }
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

  matchesSearch(item: BeritaAcara): boolean {
    const searchText = this.searchText.toLowerCase();
    return (
      item.form_number.toLowerCase().includes(searchText) ||
      item.jenis.toLowerCase().includes(searchText) ||
      item.nama_pic.toLowerCase().includes(searchText) ||
      item.jabatan_pic.toLowerCase().includes(searchText) ||
      item.kode_asset.toLowerCase().includes(searchText) ||
      item.created_by.toLowerCase().includes(searchText) ||
      item.form_status.toLowerCase().includes(searchText)
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

  beritaAcaras: BeritaAcara[] = [];

  fetchDocumentUUID(): void {
    axios
      .get(`${environment.apiUrl2}/form/ba/code`)
      .then((response) => {
        this.document_uuid = response.data.document_uuid;
        console.log(this.document_uuid);
      })
      .catch((error) => {
        console.error('Error fetching document UUID:', error);
      });
  }

  fetchDataBeritaAcara() {
    axios
      .get(`${environment.apiUrl2}/form/beritaacara`)
      .then((response) => {
        this.beritaAcaras = response.data;
      })
      .catch((error) => {
        if (error.response) {
          console.error('Error:', error.response.data);
        } else {
          console.error('Error:', error.message);
        }
      });
  }

  popoverIndex: number | null = null;

  togglePopover(event: Event, index: number): void {
    event.stopPropagation();
    if (this.popoverIndex === index) {
      this.popoverIndex = null;
    } else {
      this.popoverIndex = index;
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
    console.log(`Key pressed: ${event.key}`);
    if (event.key === 'Escape') {
      console.log('Modals closed');
    }
  }

  openEditModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/form/beritaacara/${form_uuid}`)
      .then((response) => {
        this.isModalEditOpen = true;
        const formData = response.data.form;

        this.form_uuid = formData.form_uuid;
        this.form_number = formData.form_number;
        this.form_status = formData.form_status;
        this.document_name = formData.document_name;
        this.asset_uuid = formData.asset_uuid;
        this.kode_asset = formData.kode_asset;
        this.pihak_pertama = formData.pihak_pertama;
        this.jabatan_pihak_pertama = formData.jabatan_pihak_pertama;
        this.nama_pic = formData.nama_pic;
        this.jabatan_pic = formData.jabatan_pic;
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
    const data = {
      assetData: {
        asset_uuid: this.asset_uuid,
      },
    };

    axios
      .put(`${environment.apiUrl2}/api/asset/update/${this.asset_uuid}`, data, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
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
        // this.fetchDataAsset();
        // this.fetchDataFormHA();
        // this.fetchDataAdminFormHA();
        // this.fetchDataUserFormHA();
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

  publish(form_uuid: string) {
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
            this.fetchDataBeritaAcara();
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

  get currentUrl(): string {
    return this.router.url;
  }

  async openPreviewPage(form_uuid: string) {
    await this.profileData();
    axios
      .get(`${environment.apiUrl2}/form/beritaacara/${form_uuid}`)
      .then((response) => {
        console.log(response);
        
        const BASE_URL = environment.apiUrl2;
        const formData = response.data.form;

        // Parsing tanggal sekali saja
        const createdAt = new Date(formData.created_at);

        // Format tanggal dengan Intl.DateTimeFormat
        const formattedDate = new Intl.DateTimeFormat('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(createdAt);

        // Format tanggal dengan lokasi
        this.created_at = `Yogyakarta, ${formattedDate}`;

        // Nama hari & bulan dalam bahasa Indonesia
        const days = [
          'Minggu',
          'Senin',
          'Selasa',
          'Rabu',
          'Kamis',
          'Jumat',
          'Sabtu',
        ];
        const months = [
          'Januari',
          'Februari',
          'Maret',
          'April',
          'Mei',
          'Juni',
          'Juli',
          'Agustus',
          'September',
          'Oktober',
          'November',
          'Desember',
        ];

        // Mengisi variabel terpisah untuk tanggal
        this.day = days[createdAt.getDay()]; // Nama hari
        this.date = createdAt.getDate(); // Tanggal
        this.month = months[createdAt.getMonth()]; // Nama bulan
        this.year = createdAt.getFullYear(); // Tahun

        // Mengisi variabel dengan data dari form
        this.form_uuid = formData.form_uuid;
        this.form_number = formData.form_number;
        this.form_status = formData.form_status;
        this.document_name = formData.document_name;
        this.created_by = formData.created_by;
        this.asset_uuid = formData.asset_uuid;
        this.nama_asset = formData.nama_asset;
        this.merk = formData.merk;
        this.model = formData.model;
        this.kode_asset = formData.kode_asset;
        this.asset_type = formData.asset_type;
        this.kondisi = formData.kondisi;
        this.aksesoris = formData.aksesoris;
        this.jenis = formData.jenis;
        this.pihak_pertama = formData.pihak_pertama;
        this.reason = formData.reason;
        this.jabatan_pihak_pertama = formData.jabatan_pihak_pertama;
        this.nama_pic = formData.nama_pic;
        this.jabatan_pic = formData.jabatan_pic;
        this.spesifikasi_asset = formData.spesifikasi;
        this.serial_number = formData.serial_number;
        this.images = formData.image.map((img: string) => BASE_URL + img);

        this.isPreview = true;

        // Navigasi ke halaman preview
        const basePath = this.router.url.startsWith('/guest')
          ? '/guest/form/berita-acara'
          : '/form/berita-acara';
        this.router.navigate([`${basePath}/${form_uuid}`]);

        const signatories: Signatory[] = response.data.signatories || [];
        Object.keys(this.signatoryPositions).forEach((role) => {
          this.signatoryPositions[role] = {
            sign_uuid: '',
            name: '',
            position: '',
            is_sign: false,
            sign_img: '',
            is_guest: false,
          };
        });
        signatories.forEach((signatory: Signatory) => {
          const role = signatory.role_sign;
          if (this.signatoryPositions[role]) {
            this.signatoryPositions[role] = {
              sign_uuid: signatory.sign_uuid || '',
              name: signatory.signatory_name || '',
              position: signatory.signatory_position || '',
              is_sign: signatory.is_sign || false,
              sign_img:
                typeof signatory.sign_img === 'object' &&
                'String' in signatory.sign_img
                  ? BASE_URL + signatory.sign_img.String
                  : BASE_URL + signatory.sign_img,
              is_guest: signatory.is_guest || false,
            };
          }
        });
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

    this.router.navigate([`/form/ba-assets`]);
  }

  onDeleteBeritaAcara(form_uuid: string) {
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
        this.performDeleteBeritaAcara(form_uuid);
      }
    });
  }

  performDeleteBeritaAcara(form_uuid: string) {
    axios
      .put(
        `${environment.apiUrl2}/api/beritaacara/delete/${form_uuid}`,
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
        this.fetchDataBeritaAcara();
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

  openModal(form_uuid: string, sign_uuid: string, is_guest: boolean) {
    // selectedSignUser
    this.sign_uuid = sign_uuid;
    this.is_guest = is_guest;
    this.form_uuid = form_uuid;
    if (this.modal) {
      this.modal.nativeElement.classList.add('scale-100');
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.nativeElement.classList.remove('scale-100');
    }
    this.sign_uuid = '';
    this.is_guest = false;
    this.clear();
  }
  signature(form_uuid: string, sign_uuid: string, is_guest: boolean) {
    const dataURL = this.sigPad.nativeElement.toDataURL('image/png'); // Get the signature image

    axios
      .get(`${environment.apiUrl2}/form/beritaacara/${form_uuid}`)
      .then((response) => {
        const signatories: Signatory[] = response.data.signatories || [];
        // Find the signatory by sign_uuid
        const mySignatory = signatories.find(
          (signatory: Signatory) => signatory.sign_uuid === sign_uuid
        );

        if (mySignatory) {
          // Prepare payload to send, including the signature image
          const payload = {
            name: mySignatory.signatory_name, // Use the name from the signatory data
            position: mySignatory.signatory_position, // Use the position from the signatory data
            is_sign: true,
            sign_img: dataURL, // Include the Base64 signature image
          };

          // Send the update to the backend using the correct sign_uuid

          this.onSignature(mySignatory.sign_uuid, payload, is_guest);
        }
      })
      .catch((error) => {
        console.error('Error fetching signatories:', error);
      });
  }

  onSignature(sign_uuid: string, payload: any, is_guest: boolean) {
    const url = is_guest
      ? `${environment.apiUrl2}/guest/signature/update/${sign_uuid}`
      : `${environment.apiUrl2}/api/signature/update/${sign_uuid}`;

    const config = is_guest
      ? {} // Tanpa header jika guest
      : {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
          },
        };

    axios
      .put(url, payload, config)
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
        // this.fetchDataFormITCM();
        // this.fetchDataAdminFormITCM();
        // this.fetchDataUserFormITCM();
        // this.fetchDataAdminFormITCMDraft();
        // this.fetchDataUserFormITCMDraft();
        // // this.fetchDataAdminFormPublish();
        // // this.fetchDataUserFormPublish();
        // this.fetchUserSignature();
        this.openPreviewPage(this.form_uuid);
      })
      .catch((error) => {
        if (
          error.response.status === 404 ||
          error.response.status === 500 ||
          error.response.status === 422 ||
          error.response.status === 401 ||
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
  generateURL(form_uuid: string, is_guest: boolean) {
    // Cek apakah form status 'Published' untuk memilih URL Guest atau biasa
    const baseURL = window.location.origin;
    const isGuest = is_guest; // Atur kondisi sesuai dengan status
    const url = isGuest
      ? `${baseURL}/guest/form/berita-acara/${form_uuid}`
      : `${baseURL}/form/berita-acara/${form_uuid}`;

    // Menyalin URL ke clipboard menggunakan navigator.clipboard
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
    // Buat elemen textarea untuk menyalin teks
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
      // Tampilkan notifikasi sukses
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
      .get(`${environment.apiUrl2}/form/beritaacara/${form_uuid}`)
      .then((response) => {
        // const BASE_URL = environment.apiUrl2;
        const formData = response.data.form;
        const signatories = response.data.signatories || [];

        // Generate PDF dengan data dari API
        // this.generatePDF2(formData, signatories);
      })
      .catch((error) => {
        console.error('Gagal mengambil data:', error);
      });
  }
}
