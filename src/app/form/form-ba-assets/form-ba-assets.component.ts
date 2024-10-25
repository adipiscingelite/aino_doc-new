import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule, NgModel } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';

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
  imports: [CommonModule, FormsModule, ],
  templateUrl: './form-ba-assets.component.html',
  styleUrl: './form-ba-assets.component.css',
})
export class FormBaAssetsComponent implements OnInit {
  form_uuid: string = '';
  form_number: string = '';
  form_status: string = '';
  document_name: string = '';
  created_by: string = '';
  created_at: string = '';
  pihak_pertama: string = '';
  jabatan_pihak_pertama: string = '';
  nama_pic: string = '';
  jabatan_pic: string = '';
  jenis: string = '';
  asset_uuid: string = '';
  kode_asset: string = 'LP/201';
  nama_asset: string = 'laptop dell';
  spesifikasi_asset: string = 'intel i5';
  serial_number: string = '130948';

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

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.fetchDataBeritaAcara();

    this.route.paramMap.subscribe((params) => {
      const form_uuid = params.get('form_uuid');
      if (form_uuid) {
        this.openPreviewPage(form_uuid); // Panggil fungsi dengan UUID dari URL
      }
    });
  }

  beritaAcaras: BeritaAcara[] = [];

  fetchDataBeritaAcara() {
    axios
      .get(`${environment.apiUrl2}/form/beritaacara`)
      .then((response) => {
        console.log('ini list asset', response);

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
      // this.closeAddModal();
      // this.closeEditModal();
      // this.closeApproveModal();
      // this.closeSignModal();
      console.log('Modals closed');
    }
  }

  openEditModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/form/beritaacara/${form_uuid}`)
      .then((response) => {
        console.log('plis coy', response.data);

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
        // this.jenis = formData.jenis;
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

    // console.log('update', data);
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
                form_ticket: '1',
                // masih salah dibagian ini, kalo ha gaada form ticket, jadi kubikin statis aja dulu
                // tp harus string
                document_uuid: 'f97b1dbe-0366-4ec5-aeff-bdf1f288e347',
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

  async openPreviewPage(form_uuid: any) {
    // Menampilkan pesan di console
    await console.log('hai');

    axios
      .get(`${environment.apiUrl2}/form/beritaacara/${form_uuid}`)
      .then((response) => {
        console.log('Response:', response);

        const formData = response.data.form;

        // Mengisi variabel dengan data dari form
        this.form_uuid = formData.form_uuid;
        this.form_number = formData.form_number;
        this.form_status = formData.form_status;
        this.document_name = formData.document_name;
        this.created_by = formData.created_by;
        this.asset_uuid = formData.asset_uuid;
        this.kode_asset = formData.kode_asset;
        this.jenis = formData.jenis;
        this.pihak_pertama = formData.pihak_pertama;
        this.jabatan_pihak_pertama = formData.jabatan_pihak_pertama;
        this.nama_pic = formData.nama_pic;
        this.jabatan_pic = formData.jabatan_pic;
        this.kode_asset;
        this.nama_asset
        this.spesifikasi_asset
        this.serial_number

        // Memformat tanggal
        const createdAt = new Date(formData.created_at);
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

        this.isPreview = true;

        // Navigasi ke halaman preview
        this.router.navigate([`/form/berita-acara/${form_uuid}`]);

        // const signatories: Signatory[] = response.data.signatories || [];
        // Object.keys(this.signatoryPositions).forEach((role) => {
        //   this.signatoryPositions[role] = {
        //     name: '',
        //     position: '',
        //     is_sign: false,
        //     sign_img: '',
        //   };
        // });
        // signatories.forEach((signatory: Signatory) => {
        //   const role = signatory.role_sign;
        //   if (this.signatoryPositions[role]) {
        //     this.signatoryPositions[role] = {
        //       name: signatory.signatory_name || '',
        //       position: signatory.signatory_position || '',
        //       is_sign: signatory.is_sign || false,
        //       sign_img:
        //         typeof signatory.sign_img === 'object' &&
        //         'String' in signatory.sign_img
        //           ? BASE_URL + signatory.sign_img.String
        //           : BASE_URL + signatory.sign_img,
        //     };
        //   }
        // });

        // if (signatories && signatories.length > 0) {
        //   const mySignatory = signatories.find(
        //     (signatory: Signatory) =>
        //       signatory?.signatory_name === this.personal_name
        //   );
        //   console.log('plis', mySignatory);

        //   if (mySignatory) {
        //     console.log('Sign UUID:', mySignatory.sign_uuid);
        //     this.isSigned = mySignatory.is_sign;
        //   } else {
        //     console.log(
        //       'Signatory not found for personal_name:',
        //       this.personal_name
        //     );
        //   }
        // } else {
        //   console.log('Signatories array is empty or undefined');
        // }
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
}
