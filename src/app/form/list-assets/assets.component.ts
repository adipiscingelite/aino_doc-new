import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

import ExcelJS from 'exceljs';

import { AvatarModule, AvatarSource } from 'ngx-avatars';
import { HttpClientModule } from '@angular/common/http';
// import { HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';

interface Signatory {
  sign_uuid: string;
  signatory_name: string;
  signatory_position: string;
  role_sign: string;
  is_sign: boolean;
  sign_img: string | { String: string };
}

interface Assets {
  asset_uuid: string;
  asset_type: string;
  kode_asset: string;
  nama_asset: string;
  serial_number: string;
  spesifikasi: string;
  tgl_pengadaan: string;
  harga: string;
  deskripsi: string;
  klasifikasi: string;
  lokasi: string;
  status: string;
  pic: Pic[];
  created_at: string;
  created_by: string;
}

interface Pic {
  pic_uuid: string;
  nama_pic: string;
  keterangan: string;
  start_at: string;
  ended_at: string;
}

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AvatarModule,
  ],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.css',
})
export class AssetsComponent implements OnInit {
  maxPicCount: number = 0;
  avatarColors: { [key: string]: string } = {};

  // kode_asset: string = ''
  // nama_barang: string = ''

  role_code: any;

  document_uuid: string = '';

  asset_uuid: string = '';
  asset_type: string = '';
  kode_asset: string = '';
  nama_asset: string = '';
  merk: string = '';
  model: string = '';
  serial_number: string = '';
  spesifikasi: string = '';
  tgl_pengadaan: string = '';
  harga: string = '';
  deskripsi: string = '';
  klasifikasi: string = '';
  lokasi: string = '';
  status: string = '';
  selectedAssetType: string = '';
  kondisi: string = 'Baik';
  charger: boolean = false;
  battery: boolean = false;

  customLocation: string = '';
  image: string | null = null;
  imagePreview: string | null = null;

  imagePreviews: string[] = [];
  images: File[] = [];
  originalImages: string[] = [];
  addedImages: File[] = [];
  deletedImages: string[] = [];
  addedImagesBase64: string[] = [];

  selectedImage: string = '';

  // form ba
  pihak_pertama: string = '';
  jabatan_pihak_pertama: string = '';
  nama_pic: string = '';
  jabatan_pic: string = '';
  jenis: string = '';

  reason: string = '';

  start_at: string | null = null;
  ended_at: string | null = null;

  signatories = [];
  name1: string = '';
  name2: string = '';
  name3: string = '';
  name4: string = '';

  position1: string = '';
  position2: string = '';
  position3: string = '';
  position4: string = '';

  roleSign1: string = 'Pihak Pertama';
  roleSign2: string = 'Pihak Kedua';

  is_sign: boolean = false;
  is_sign1: boolean = false;
  is_sign2: boolean = false;
  is_sign3: boolean = false;
  is_sign4: boolean = false;

  isSigned: boolean = false;
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

  searchText: string = '';

  isPreview: boolean = false;

  isModalAddOpen: boolean = false;
  isModalAddBeritaAcaraOpen: boolean = false;
  isModalImportOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalEditCodeOpen: boolean = false;
  isModalSignOpen: boolean = false;
  isModalApproveOpen: boolean = false;

  isFilterPanelOpen: boolean = false;

  totalAsset: number = 0;

  excelData: any = null;

  isDragging = false;
  fileSelected = false;

  picInfoData: Pic[] = [];

  constructor(
    private cookieService: CookieService,
    // private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    // public formDaService: FormDaService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    // private pdfService: PdfGenerationService,
    @Inject('apiUrl') public apiUrl: string
  ) {
    this.apiUrl = apiUrl;

    this.infoPICForm = this.fb.group({
      data_info_pic: this.fb.array([]),
    });
  }

  assets: Assets[] = [];
  PICData: Pic[] = [];
  dataListAllUser: any = [];

  ngOnInit(): void {
    this.fetchAllUser();
    this.fetchDocumentUUID();
    this.fetchDataAsset();

    this.route.paramMap.subscribe((params) => {
      const asset_uuid = params.get('asset_uuid');
      if (asset_uuid) {
        this.openPreviewPage(asset_uuid);
      }
    });

    this.assets.forEach((asset) => {
      asset.pic?.forEach((pic) => {
        if (!this.avatarColors[pic.nama_pic]) {
          this.avatarColors[pic.nama_pic] = this.getRandomColor();
        }
      });
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as any;
      this.importExcel(fakeEvent);
    }
  }

  formatHarga(harga: string): string {
    // Hapus spasi dan karakter non-numeric lainnya
    const sanitizedHarga = harga.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    const numberHarga = parseFloat(sanitizedHarga);

    // Cek apakah numberHarga valid
    if (isNaN(numberHarga)) {
      return 'Rp0'; // Atau bisa mengembalikan string kosong atau pesan error
    }

    // Format harga tanpa spasi sebelum 'Rp'
    return `Rp${numberHarga.toLocaleString('id-ID', {
      minimumFractionDigits: 0, // Tidak ada desimal
      maximumFractionDigits: 0, // Tidak ada desimal
    })}`;
  }

  previewImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.image = reader.result as string;
        this.imagePreview = this.image;
        console.log('imagePreview:', this.imagePreview);
      };
      reader.readAsDataURL(file);
    }
  }

  onMultipleImageUpload(event: any) {
    const files: FileList = event.target.files;

    if (files.length + this.imagePreviews.length > 3) {
      Swal.fire({
        title: 'Error',
        text: 'Maksimal hanya bisa mengupload 3 gambar',
        icon: 'error',
        timer: 1000,
        timerProgressBar: true,
        showCancelButton: false,
        showConfirmButton: false,
      });
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = () => {
        if (this.imagePreviews.length < 3) {
          this.imagePreviews.push(reader.result as string);
          this.addedImagesBase64.push(reader.result as string); // Simpan sebagai Base64
        }
      };

      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    const imageUrl = this.imagePreviews[index];

    if (this.originalImages.includes(imageUrl)) {
      // Jika gambar asli, tambahkan ke deletedImages
      this.deletedImages.push(imageUrl);
    } else {
      // Jika gambar baru, hapus dari addedImages
      const addedIndex = this.imagePreviews.indexOf(imageUrl);
      if (addedIndex !== -1) {
        this.addedImages.splice(addedIndex, 1);
      }
    }

    // Hapus dari preview
    this.imagePreviews.splice(index, 1);
  }

  changeImagePreview(image: string) {
    this.selectedImage = image;
  }

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
      // this.closeSignModal();
      console.log('Modals closed');
    }
  }

  infoPICForm: FormGroup;

  // getInfoHAField(): FormGroup {
  //   return new FormGroup({
  //     nama_pic: new FormControl('', Validators.required),
  //     keterangan: new FormControl('', Validators.required),
  //     start_at: new FormControl('', Validators.required),
  //     ended_at: new FormControl('', Validators.required),
  //   });
  // }

  getInfoPICField(): FormGroup {
    return this.fb.group({
      nama_pic: new FormControl(''),
      keterangan: new FormControl(''),
      start_at: new FormControl(''),
      ended_at: new FormControl(''),
    });
  }

  getInfoPICFieldsValue() {
    return this.infoPICForm?.get('data_info_pic')?.value.map((field: any) => {
      return {
        nama_pic: field.nama_pic,
        keterangan: field.keterangan,
        start_at: field.start_at,
        ended_at: field.ended_at,
      };
    });
  }

  get infoPICListArray(): FormArray {
    return this.infoPICForm.get('data_info_pic') as FormArray;
  }

  addInfoPICField() {
    const picCount = this.infoPICListArray.length + 1;
    const infoPicControl = this.fb.group({
      pic_uuid: ['', Validators.required],
      nama_pic: ['', Validators.required],
      keterangan: [`PIC ${picCount}`, Validators.required],
      start_at: ['', Validators.required],
      ended_at: ['', Validators.required],
    });
    this.infoPICListArray.push(infoPicControl);

    this.updateKeteranganNumbers();

    this.cd.detectChanges();

    console.log('Field baru telah ditambahkan');
  }

  removeInfoPICField(i: number) {
    this.infoPICListArray.removeAt(i);

    this.updateKeteranganNumbers();

    console.log('Field dihapus');
  }

  updateKeteranganNumbers() {
    this.infoPICListArray.controls.forEach((control, index) => {
      control.get('keterangan')?.setValue(`PIC ${index + 1}`);
    });
  }

  data() {
    console.log(this.infoPICForm.value);
  }

  matchesSearch(item: Assets): boolean {
    const searchText = this.searchText.toLowerCase();
    return (
      item.kode_asset.toLowerCase().includes(searchText) ||
      item.nama_asset.toLowerCase().includes(searchText) ||
      item.serial_number.toLowerCase().includes(searchText)
      // item..toLowerCase().includes(searchText)
      // item.nama_pemohon.toLowerCase().includes(searchText) ||
      // item.instansi.toLowerCase().includes(searchText) ||
      // item.tanggal.toLowerCase().includes(searchText) ||
      // item.perubahan_aset.toLowerCase().includes(searchText) ||
      // item.deskripsi.toLowerCase().includes(searchText)
    );
  }
  fetchDataAsset() {
    axios
      .get(`${environment.apiUrl2}/assets`)
      .then((response) => {
        this.assets = response.data; // Simpan data ke dalam variabel assets
        console.log('asset', this.assets);

        // Cek apakah this.assets valid dan tidak null sebelum memanggil map
        if (this.assets && Array.isArray(this.assets)) {
          // Cari jumlah PIC maksimum
          this.maxPicCount = Math.max(
            ...this.assets.map((asset) => (asset.pic ? asset.pic.length : 0)) // Periksa apakah asset.pic ada
          );
          console.log('Max PIC count:', this.maxPicCount);
        } else {
          console.warn('No assets available or data is not an array.');
          this.maxPicCount = 0; // Atur maxPicCount ke 0 jika tidak ada data
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error('Error:', error.response.data);
        } else {
          console.error('Error:', error.message);
        }
      });
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

  openTab = 1;
  toggleTabs($tabNumber: number) {
    this.openTab = $tabNumber;
  }

  getRandomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  getRemainingPicNames(pics: any[]): string {
    return (
      pics
        .slice(2)
        .map((pic) => pic.nama_pic)
        .join(', ') || '-'
    );
  }

  getAllPicNames(asset: Assets): string {
    return asset.pic?.map((pic) => pic.nama_pic).join(', ') || '-';
  }

  onAssetTypeChange() {
    // You can add any other logic when the dropdown value changes
    console.log(this.selectedAssetType);
  }

  isAddButtonEnabled(): boolean {
    return this.infoPICListArray.controls.every((group) => {
      const isNamaPicValid = group.get('nama_pic')?.valid;
      const isKeteranganValid = group.get('keterangan')?.valid;
      const isStartAtValid = group.get('start_at')?.valid;
      const isEndedAtValid = group.get('ended_at')?.valid || true;

      return (
        isNamaPicValid && isKeteranganValid && isStartAtValid && isEndedAtValid
      );
    });
  }

  openAddModal() {
    this.asset_type = '';
    this.nama_asset = '';
    this.merk = '';
    this.model = '';
    this.serial_number = '';
    this.spesifikasi = '';
    this.tgl_pengadaan = '';
    this.harga = '';
    this.deskripsi = '';
    this.klasifikasi = '';
    this.lokasi = '';
    this.status = '';

    this.isModalAddOpen = true;

    const infoPICArray = this.infoPICListArray;
    infoPICArray.clear();

    this.addInfoPICField();

    this.cd.detectChanges();
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addAsset() {
    const harga = this.harga.toString().replace(/[^0-9]/g, '');

    let dataPic = this.getInfoPICFieldsValue();

    if (dataPic.length === 0) {
      dataPic = [
        {
          nama_pic: 'IT Support',
          keterangan: 'PIC 1',
        },
      ];
    }

    this.nama_asset = (this.merk.trim() + ' ' + this.model).trim();

    const postData = {
      assetData: {
        asset_type: this.asset_type,
        nama_asset: this.nama_asset,
        serial_number: this.serial_number,
        spesifikasi: this.spesifikasi,
        tgl_pengadaan: this.tgl_pengadaan,
        harga: harga,
        deskripsi: this.deskripsi,
        klasifikasi: this.klasifikasi,
        lokasi: this.lokasi,
        status: this.status,
        image: this.imagePreviews.length > 0 ? this.imagePreviews : '',
      },
      data_pic: dataPic,
    };
    console.log('post data', postData);

    axios
      .post(`${environment.apiUrl2}/api/add/asset`, postData, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        console.log('Response:', response);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: response.data.message,
          timer: 1500,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });

        this.fetchDataAsset();
        this.isModalAddOpen = false;
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
          timer: 1500,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      });
  }

  openAddBeritaAcaraModal(
    asset_uuid: string,
    kode_asset: string,
    type: string
  ) {
    console.log('uuid', asset_uuid);
    console.log('kode', kode_asset);
    console.log('jenis', type);

    this.asset_uuid = asset_uuid;
    this.jenis = type;
    this.pihak_pertama = '';
    this.nama_pic = '';
    this.jabatan_pic = '';
    this.reason = '';
    this.kode_asset = kode_asset;

    this.isModalAddBeritaAcaraOpen = true;
  }

  closeAddBeritaAcaraModal() {
    this.isModalAddBeritaAcaraOpen = false;
  }

  addBeritaAcara() {
    if (!this.start_at) {
      this.start_at = null; // Set null jika kosong
    }
    if (!this.ended_at) {
      this.ended_at = null; // Set null jika kosong
    }
    if (!this.reason) {
      this.reason = ''; // Set null jika kosong
    }

    // Buat array aksesoris berdasarkan checkbox yang dicentang
    const aksesorisList = [];
    if (this.charger) aksesorisList.push('Charger');
    if (this.battery) aksesorisList.push('Battery');

    const postData = {
      isPublished: false,
      formData: {
        document_uuid: this.document_uuid,
        form_ticket: '1', // gatau butuh ini atau ga
      },
      beritaAcara: {
        asset_uuid: this.asset_uuid,
        jenis: this.jenis,
        pihak_pertama: this.pihak_pertama,
        jabatan_pihak_pertama: this.jabatan_pihak_pertama,
        nama_pic: this.nama_pic,
        jabatan_pic: this.jabatan_pic,
        kode_asset: this.kode_asset,
        start_at: this.start_at,
        ended_at: this.ended_at,
        reason: this.reason,
        image: this.image,
        kondisi: this.kondisi,
        aksesoris: aksesorisList.join(', '), // Gabungkan ke string
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
      ],
    };

    console.log('asset nij', postData);

    axios
      .post(`${environment.apiUrl2}/api/add/ba/asset`, postData, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        console.log('Response:', response);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: response.data.message,
          timer: 1500,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchDataAsset();
        this.isModalAddBeritaAcaraOpen = false;
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
            timer: 1500,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      });
  }

  openImportModal() {
    this.isModalImportOpen = true;
    this.excelData = [];
    this.fileSelected = false;
  }

  closeImportModal() {
    this.isModalImportOpen = false;
    this.excelData = [];
    this.fileSelected = false;
  }

  openEditModal(asset_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/asset/${asset_uuid}`)
      .then((response) => {
        console.log('plis coy', response.data);

        this.isModalEditOpen = true;
        const BASE_URL = environment.apiUrl2;
        const formData = response.data.asset;

        this.asset_type = formData.asset_type;
        this.kode_asset = formData.kode_asset;
        this.asset_uuid = formData.asset_uuid;
        this.nama_asset = formData.nama_asset;
        this.merk = formData.merk;
        this.model = formData.model;
        this.serial_number = formData.serial_number;
        this.spesifikasi = formData.spesifikasi;
        this.tgl_pengadaan = formData.tgl_pengadaan;
        this.harga = this.formatHarga(formData.harga);
        this.deskripsi = formData.deskripsi;
        this.klasifikasi = formData.klasifikasi;
        this.lokasi = formData.lokasi;
        this.status = formData.status;

        // this.imagePreviews = formData.image.map(
        //   (img: any) => environment.apiUrl2 + img
        // );

        this.originalImages = formData.image.map(
          (img: any) => environment.apiUrl2 + img
        );
        this.imagePreviews = [...this.originalImages];

        // Reset array tambahan
        this.addedImages = [];
        this.deletedImages = [];

        // Ensure this matches the template
        if (response && response.data && response.data.pic) {
          this.picInfoData = response.data.pic.map((pic: Pic) => ({
            pic_uuid: pic.pic_uuid,
            nama_pic: pic.nama_pic,
            keterangan: pic.keterangan,
            start_at: pic.start_at ? pic.start_at.slice(0, 10) : '',
            ended_at: pic.ended_at ? pic.ended_at.slice(0, 10) : '',
          }));

          this.infoPICForm.reset();
          this.infoPICListArray.clear();

          this.picInfoData.forEach((info_ha) => {
            this.infoPICListArray.push(
              this.fb.group({
                pic_uuid: new FormControl(info_ha.pic_uuid),
                nama_pic: new FormControl(info_ha.nama_pic),
                keterangan: new FormControl(info_ha.keterangan),
                start_at: new FormControl(info_ha.start_at),
                ended_at: new FormControl(info_ha.ended_at),
              })
            );
          });

          console.log('Data yang masuk ke FormArray:', this.infoPICForm.value);
        } else {
          console.error('Response tidak memiliki data_info_pic');
        }
      })
      .catch((error) => {
        console.log('err', error);

        // if (error.response.status === 404 || error.response.status === 500) {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
          timer: 1500,
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

  updateAssetList() {
    const initialPic: Pic[] = this.picInfoData;

    const newPic: Pic[] = this.infoPICForm.value.data_info_pic;

    const added: Pic[] = newPic.filter(
      (newItem) =>
        !initialPic.some(
          (existingItem) => existingItem.pic_uuid === newItem.pic_uuid
        )
    );

    console.log('added info ha', added);

    const deleted: Pic[] = initialPic.filter(
      (existingItem) =>
        !newPic.some((newItem) => newItem.pic_uuid === existingItem.pic_uuid)
    );

    const updated: Pic[] = newPic.filter((newItem) => {
      const existingItem = initialPic.find(
        (item) => item.pic_uuid === newItem.pic_uuid
      );

      return (
        newItem.pic_uuid &&
        existingItem &&
        (newItem.nama_pic !== existingItem.nama_pic ||
          newItem.keterangan !== existingItem.keterangan ||
          newItem.keterangan !== existingItem.keterangan ||
          newItem.start_at !== existingItem.start_at ||
          newItem.ended_at !== existingItem.ended_at)
      );
    });

    console.log('Added:', added);
    console.log('Updated:', updated);
    console.log('Deleted:', deleted);

    const harga = this.harga.toString().replace(/[^0-9]/g, '');
    this.PICData = this.infoPICListArray.getRawValue();

    this.nama_asset = (this.merk.trim() + ' ' + this.model).trim();

    const data = {
      asset: {
        asset_uuid: this.asset_uuid,
        asset_type: this.asset_type,
        nama_asset: this.nama_asset,
        serial_number: this.serial_number,
        spesifikasi: this.spesifikasi,
        tgl_pengadaan: this.tgl_pengadaan,
        harga: harga,
        deskripsi: this.deskripsi,
        klasifikasi: this.klasifikasi,
        lokasi: this.lokasi,
        status: this.status,
        images: {
          added: this.addedImagesBase64,
          deleted: this.deletedImages.map((img) =>
            img.replace(environment.apiUrl2, '')
          ),
          img: this.originalImages.filter(
            (img) => !this.deletedImages.includes(img)
          ),
        },
      },
      pic: {
        pics: newPic,
        added: added,
        updated: updated,
        deleted: deleted,
      },
    };

    console.log('data update', data);

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
          timer: 1500,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchDataAsset();
        // this.fetchDataFormHA();
        // this.fetchDataAdminFormHA();
        // this.fetchDataUserFormHA();
        this.isModalEditOpen = false;
      })
      .catch((error) => {
        if (error.response.status === 404 || error.response.status === 500) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 1500,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      });
  }

  riwayatPeminjaman: any[] = [];

  openEditCodeModal(asset_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/asset/${asset_uuid}`)
      .then((response) => {
        this.isModalEditCodeOpen = true;
        const BASE_URL = environment.apiUrl2;
        const formData = response.data.asset;

        this.kode_asset = formData.kode_asset;
        this.asset_uuid = formData.asset_uuid;
      })
      .catch((error) => {
        console.log('err', error);

        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
          timer: 1500,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      });
  }

  closeEditCodeModal() {
    this.isModalEditCodeOpen = false;
  }

  updateAssetCode() {
    const data = {
      kode_asset: this.kode_asset,
    };

    axios
      .put(
        `${environment.apiUrl2}/api/asset/code/update/${this.asset_uuid}`,
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
          timer: 1500,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchDataAsset();
        // this.fetchDataFormHA();
        // this.fetchDataAdminFormHA();
        // this.fetchDataUserFormHA();
        this.isModalEditCodeOpen = false;
      })
      .catch((error) => {
        if (error.response.status === 404 || error.response.status === 500) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 1500,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      });
  }

  openPreviewPage(asset_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/asset/${asset_uuid}`)
      .then((response) => {
        console.log('prevoew', response.data);

        const BASE_URL = environment.apiUrl2;
        const formData = response.data.asset;

        this.asset_uuid = formData.asset_uuid;
        this.asset_type = formData.asset_type;
        this.nama_asset = formData.nama_asset;
        this.serial_number = formData.serial_number;
        this.spesifikasi = formData.spesifikasi;
        this.tgl_pengadaan = formData.tgl_pengadaan;
        this.harga = this.formatHarga(formData.harga);
        this.deskripsi = formData.deskripsi;
        this.klasifikasi = formData.klasifikasi;
        this.lokasi = formData.lokasi;
        this.status = formData.status;
        this.riwayatPeminjaman = response.data.pic || [];
        this.isPreview = true;
        this.router.navigate([`/form/assets/list/${asset_uuid}`]);
        window.scrollTo(0, 0);

        this.imagePreviews = formData.image.map(
          (img: any) => environment.apiUrl2 + img
        );
        this.selectedImage =
          this.imagePreviews[0] ||
          'https://i.pinimg.com/474x/82/56/32/8256324f26d68b00563f301052207e88.jpg';

        // const infoHAArray = this.infoPICListArray;
        // infoHAArray.clear(); // Clear existing fields before adding new ones

        // response.data.pic.forEach((data: any) => {
        //   infoHAArray.push(
        //     new FormGroup({
        //       nama_pic: new FormControl(
        //         data.nama_pic || '',
        //         Validators.required
        //       ),
        //       keterangan: new FormControl(
        //         data.keterangan || '',
        //         Validators.required
        //       ),
        //       start_at: new FormControl(
        //         data.start_at || '',
        //         Validators.required
        //       ),
        //       ended_at: new FormControl(
        //         data.ended_at || '',
        //         Validators.required
        //       ),
        //     })
        //   );
        // });
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
          timer: 1500,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      });
  }

  onDeleteAsset(asset_uuid: string) {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Anda yakin ingin menghapus Asset ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteAsset(asset_uuid);
      }
    });
  }

  performDeleteAsset(asset_uuid: string) {
    axios
      .put(
        `${environment.apiUrl2}/api/asset/delete/${asset_uuid}`,
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
          timer: 1500,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchDataAsset();
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
          timer: 1500,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      });
  }

  openFilterPanel() {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }

  closeFilterPanel() {
    this.isFilterPanelOpen = false;
  }

  filterAsset(type: string) {}

  // exportToExcel() {
  //   if (!this.assets.length) {
  //     console.warn('Tidak ada data untuk diekspor!');
  //     return;
  //   }

  //   // **1️⃣ Cari jumlah maksimal PIC di seluruh asset**
  //   const maxPicCount = Math.max(
  //     ...this.assets.map((asset) => asset.pic.length),
  //     0
  //   );

  //   const headerTemplate = [
  //     [
  //       'AINO',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       'DAFTAR ASET HARDWARE',
  //       '',
  //       '',
  //       '',
  //     ], // A1-C1 (Logo/Text AINO)
  //     [
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       'No. Dokumen',
  //       'AINO/CHC/F/17/10',
  //       '',
  //       '',
  //     ], // A2-C2
  //     [
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       'Tanggal Terbit',
  //       '30-Sep-22',
  //       '',
  //       '',
  //     ], // A3-C3
  //     [
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       'No. Revisi',
  //       '1.0',
  //       '',
  //       '',
  //     ], // A4-C4
  //     [
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       '',
  //       'Halaman',
  //       '1 dari 1',
  //       '',
  //       '',
  //     ], // A5-C5
  //     [],
  //     [], // Baris Kosong (Spacer)
  //   ];

  //   // **2️⃣ Buat header Excel secara dinamis**
  //   const headers = [
  //     'No.',
  //     'Kode Asset',
  //     'Nama Barang',
  //     'Serial Number',
  //     'Spesifikasi',
  //     'Tgl. Pengadaan',
  //     'Status',
  //     'Lokasi',
  //     'Harga',
  //     'Keterangan',
  //     'Klasifikasi Sistem',
  //     ...Array.from({ length: maxPicCount }, (_, i) => `PIC ${i + 1}`), // ✅ Tambahkan header PIC 1, PIC 2, dst.
  //     'PIC Terakhir',
  //   ];

  //   const exportData = this.assets.map((asset, index) => {
  //     const rowData: any = {
  //       'No.': index + 1,
  //       'Kode Asset': asset.kode_asset,
  //       'Nama Barang': asset.nama_asset,
  //       'Serial Number': asset.serial_number,
  //       Spesifikasi: asset.spesifikasi,
  //       'Tgl. Pengadaan': asset.tgl_pengadaan
  //         ? asset.tgl_pengadaan.split('T')[0]
  //         : '-',
  //       Status: asset.status,
  //       Lokasi: asset.lokasi,
  //       Harga: asset.harga?.toString(),
  //       Keterangan: asset.deskripsi,
  //       // "Keterangan": asset.pic.length
  //       // ? asset.pic.map(p => p.keterangan || "-").join(', ')
  //       // : "-",
  //       'Klasifikasi Sistem': asset.klasifikasi,
  //     };

  //     console.log('Data PIC:', asset.pic);
  //     console.log(
  //       'Keterangan hasil mapping:',
  //       asset.pic.map((p) => p.keterangan || '-')
  //     );

  //     // **3️⃣ Tambahkan PIC secara dinamis**
  //     asset.pic.forEach((pic, i) => {
  //       rowData[`PIC ${i + 1}`] = pic.nama_pic;
  //     });

  //     // **4️⃣ Pastikan semua baris memiliki jumlah kolom yang sama**
  //     for (let i = asset.pic.length; i < maxPicCount; i++) {
  //       rowData[`PIC ${i + 1}`] = '-';
  //     }

  //     // **5️⃣ Tambahkan "PIC Terakhir"**
  //     rowData['PIC Terakhir'] = asset.pic.length
  //       ? asset.pic[asset.pic.length - 1].nama_pic
  //       : 'Tidak ada PIC';

  //     return rowData;
  //   });

  //   console.log('Data yang akan diekspor:', exportData); // Debugging

  //   // **6️⃣ Konversi JSON ke Worksheet**
  //   // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  //   const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(
  //     headerTemplate.concat([headers]) // Gabungkan header dokumen dan header kolom
  //   );

  //   // Tambahkan data aset setelah header
  //   XLSX.utils.sheet_add_aoa(ws, exportData.map(Object.values), { origin: -1 });

  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Assets');

  //   // Simpan sebagai File Excel
  //   XLSX.writeFile(wb, 'Data_List_Assets.xlsx');
  // }

  // getAllPicNames(asset: Assets): string {
  //   return asset.pic?.map((pic) => pic.nama_pic).join(', ') || '-';
  // }

  async generateExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assets Data', {
      views: [
        {
          state: 'frozen',
          xSplit: 5, // Pembekuan kolom A-E
          ySplit: 7, // Pembekuan baris 1-7
          showGridLines: false,
        },
      ],
    });

    // Menambahkan gambar dari folder assets (gunakan base64)
    const logoPath = 'assets/images/aino.png'; // Ganti dengan path gambar Anda
    const logoImageBase64 = await this.convertImageToBase64(logoPath); // Fungsi untuk mengubah gambar ke base64

    const logoImage = workbook.addImage({
      base64: logoImageBase64,
      extension: 'png',
    });

    worksheet.addImage(logoImage, 'C2:C5'); // Gambar di sel C2-C5
    worksheet.mergeCells('C2:C5');

    // Menambahkan border pada area gabungan tersebut
    worksheet.getCell('C2').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Merge cell untuk judul "DAFTAR ASET HARDWARE"
    worksheet.mergeCells('D2:M5');
    worksheet.getCell('D2').value = 'DAFTAR ASET HARDWARE';
    worksheet.getCell('D2').font = {
      bold: true,
      size: 16,
      name: 'Trebuchet MS',
      color: { argb: '000000' },
    }; // Font hitam
    worksheet.getCell('D2').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('D2').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Menambahkan informasi dokumen di baris 2-5 (No. Dokumen, Tanggal Terbit, No. Revisi, Halaman)
    // worksheet.getCell('N2').value = 'No. Dokumen';
    // worksheet.getCell('N2').alignment = {
    //   horizontal: 'center',
    //   vertical: 'middle',
    // };
    // worksheet.getCell('N2').border = {
    //   top: { style: 'thin' },
    //   left: { style: 'thin' },
    //   right: { style: 'thin' },
    //   bottom: { style: 'thin' },
    // };

    // No. Dokumen (Merged Cell)
    worksheet.mergeCells('O2:P2');
    worksheet.getCell('O2').value = 'No. Dokumen';
    worksheet.getCell('O2').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('O2').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Tanggal Terbit (Merged Cell)
    worksheet.mergeCells('O3:P3');
    worksheet.getCell('O3').value = 'Tanggal Terbit';
    worksheet.getCell('O3').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('O3').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // No. Revisi (Merged Cell)
    worksheet.mergeCells('O4:P4');
    worksheet.getCell('O4').value = 'No. Revisi';
    worksheet.getCell('O4').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('O4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Halaman (Merged Cell)
    worksheet.mergeCells('O5:P5');
    worksheet.getCell('O5').value = 'Halaman';
    worksheet.getCell('O5').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('O5').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Menambahkan nilai untuk No. Dokumen
    worksheet.mergeCells('Q2:R2');
    worksheet.getCell('Q2').value = 'AINO/CHC/F/17/10'; // Ganti dengan nilai yang sesuai
    worksheet.getCell('Q2').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('Q2').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Menambahkan nilai untuk Tanggal Terbit, No. Revisi, dan Halaman
    worksheet.mergeCells('Q3:R3');
    worksheet.getCell('Q3').value = '30-Sep-2022'; // Ganti dengan nilai yang sesuai
    worksheet.getCell('Q3').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('Q3').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    worksheet.mergeCells('Q4:R4');
    worksheet.getCell('Q4').value = '0'; // Ganti dengan nilai yang sesuai
    worksheet.getCell('Q4').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('Q4').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    worksheet.mergeCells('Q5:R5');
    worksheet.getCell('Q5').value = '1 dari 1'; // Ganti dengan nilai yang sesuai
    worksheet.getCell('Q5').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('Q5').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Define columns, skipping the first column (A)
    // worksheet.columns = [
    //   {}, // Skipping column A
    //   { header: 'No.', key: 'no' },
    //   { header: 'Kode Asset', key: 'kode_asset' },
    //   { header: 'Nama Asset', key: 'nama_asset' },
    //   { header: 'Serial Number', key: 'serial_number' },
    //   { header: 'Spesifikasi', key: 'spesifikasi' },
    //   { header: 'Tanggal Pengadaan', key: 'tgl_pengadaan' },
    //   { header: 'Harga', key: 'harga' },
    //   { header: 'Deskripsi', key: 'deskripsi' },
    //   { header: 'Klasifikasi', key: 'klasifikasi' },
    //   { header: 'Lokasi', key: 'lokasi' },
    //   { header: 'Status', key: 'status' },
    //   { header: 'PIC 1', key: 'pic1' },
    //   { header: 'PIC 2', key: 'pic2' },
    //   { header: 'PIC 3', key: 'pic3' },
    //   { header: 'PIC 4', key: 'pic4' },
    //   { header: 'Created At', key: 'created_at' },
    //   { header: 'Created By', key: 'created_by' }
    // ];

    // Add Header row at row 7// Add Header row at row 7
    worksheet.addRow([
      '',
      'No.',
      'Kode Asset',
      'Nama Barang', // Header
      '',
      'Serial Number',
      'Spesifikasi',
      'Tanggal Pengadaan',
      ...Array.from({ length: this.maxPicCount }, (_, i) => `PIC ${i + 1}`), // Dinamis berdasarkan maxPicCount
      'Lokasi',
      'Harga',
      'Keterangan',
      'Klasifikasi',
      // 'Status',
      // 'Created At',
      // 'Created By',
    ]);

    // Merge D7 and E7 for "Nama Barang" header
    worksheet.mergeCells('D7:E7');
    worksheet.getCell('D7').value = 'Nama Barang';
    worksheet.getCell('D7').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getCell('D7').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
      bottom: { style: 'thin' },
    };

    // Apply Style to Header (Baris 7)
    worksheet.getRow(7).eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: '000000' },
        name: 'Trebuchet MS',
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' },
      }; // Header kuning
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
        bottom: { style: 'thin' },
      };
    });

    // Add Data Rows
    this.assets.forEach((asset, index) => {
      // Ambil jumlah PIC yang ada pada asset, maksimal 3 (maxPicCount)
      const picCount = asset.pic.length;
      const picNames = asset.pic
        .slice(0, this.maxPicCount) // Ambil hingga maxPicCount PIC pertama
        .map((p: any) => p.nama_pic) // Ambil nama PIC (pastikan properti nama_pic ada)
        .concat(new Array(this.maxPicCount - picCount).fill('')); // Isi dengan string kosong jika kurang dari maxPicCount

      // Format Tanggal Pengadaan
      const tglPengadaan = new Date(asset.tgl_pengadaan);
      const formattedDate = `${tglPengadaan
        .getDate()
        .toString()
        .padStart(2, '0')}/${(tglPengadaan.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${tglPengadaan.getFullYear()}`;

      // Format Harga
      const formattedHarga = asset.harga
        ? `Rp${Number(asset.harga).toLocaleString('id-ID')}`
        : '';

      const rowData = [
        '',
        index + 1,
        asset.kode_asset,
        asset.asset_type,
        asset.nama_asset, // Nama Barang (merge cell)
        asset.serial_number,
        asset.spesifikasi,
        formattedDate, // Tanggal Pengadaan
        ...picNames, // Menggabungkan PIC yang ada (maksimal maxPicCount)
        asset.lokasi,
        formattedHarga, // Harga
        asset.deskripsi,
        asset.klasifikasi,
        // asset.status,
        // asset.created_at,
        // asset.created_by,
      ];

      const row = worksheet.addRow(rowData);

      // Set alignment to center for "Nama Barang" in column D
      row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };

      // Apply border to all cells in the row (termasuk PIC)
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
          bottom: { style: 'thin' },
        };
      });
    });

    // Atur Lebar Kolom Secara Manual untuk Menghindari Ukuran Kecil
    worksheet.getColumn(1).width = 5; // No.
    worksheet.getColumn(2).width = 10; // Kode Asset
    worksheet.getColumn(3).width = 30; // Nama Asset
    worksheet.getColumn(4).width = 20; // Serial Number
    worksheet.getColumn(5).width = 20; // Spesifikasi
    worksheet.getColumn(6).width = 20; // Tanggal Pengadaan
    worksheet.getColumn(7).width = 20; // Harga
    worksheet.getColumn(8).width = 20; // Deskripsi
    worksheet.getColumn(9).width = 20; // Klasifikasi
    worksheet.getColumn(10).width = 20; // Lokasi
    worksheet.getColumn(11).width = 20; // Status
    worksheet.getColumn(12).width = 20; // PIC
    worksheet.getColumn(13).width = 20; // Created At
    worksheet.getColumn(14).width = 20; // Created By

    // Simpan Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Dapatkan tanggal hari ini dengan format "dd-MM-yyyy"
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    // Nama file yang akan disimpan
    const fileName = `Daftar Asset Hardware AINO_${formattedDate}.xlsx`;

    // Membuat URL dari blob
    const url = URL.createObjectURL(blob);

    // Membuat elemen <a> untuk memulai unduhan dengan nama file yang ditentukan
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // Nama file yang akan disimpan
    document.body.appendChild(a); // Menambahkan elemen <a> ke DOM
    a.click(); // Memicu klik untuk memulai unduhan
    document.body.removeChild(a); // Menghapus elemen <a> setelah klik

    // Menyimpan file
    URL.revokeObjectURL(url); // Membebaskan URL yang telah dibuat
  }

  importExcel(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
      });

      const parseDate = (date: any): string => {
        if (!date) return '0001-01-01';

        if (typeof date === 'number') {
          const excelEpoch = new Date(1899, 11, 30);
          const parsedDate = new Date(excelEpoch.getTime() + date * 86400000);
          const year = parsedDate.getFullYear();
          const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const day = String(parsedDate.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }

        const parts = date.split('/');
        if (parts.length === 3) {
          const [month, day, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        return '0001-01-01';
      };

      const parsed = jsonData.map((row) => {
        const assetData = {
          asset_type: row['Nama Barang'] || '',
          nama_asset: row['Merk'] || '',
          kode_asset: String(row['Kode']) || '',
          serial_number: String(row['Serial Number']) || '',
          spesifikasi: row['Spesifikasi'] || '',
          tgl_pengadaan: parseDate(row['Tgl. Pengadaan']),

          harga: row['Harga'] ? String(row['Harga']) : '0',
          deskripsi: row['Keterangan'] || '',
          klasifikasi: row['Klasifikasi Sistem'] || '',
          lokasi: row['Lokasi'] || '',
          status: 'Tersedia',
          image: [
            'data:image/jpeg;base64,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',
          ],
        };

        const data_pic: {
          nama_pic: string;
          keterangan: string;
          start_at: string;
          ended_at: string;
        }[] = [];

        Object.keys(row).forEach((key) => {
          if (key.toLowerCase().includes('pic')) {
            const nama_pic = row[key];
            if (nama_pic) {
              const picNumber = key.match(/\d+/)?.[0];
              const keterangan = picNumber ? `PIC ${picNumber}` : 'PIC';
              const now = new Date().toISOString();

              data_pic.push({
                nama_pic,
                keterangan,
                start_at: now,
                ended_at: now,
              });
            }
          }
        });

        return {
          assetData,
          data_pic,
        };
      });

      this.excelData = parsed;
      this.fileSelected = true;

      // this.uploadAssets(parsed);
    };

    reader.readAsArrayBuffer(file);
  }

  resetImport() {
    this.fileSelected = false;
    this.excelData = [];
  }

  uploadAssets(parsedData: any[]) {
    const postData = parsedData.map((data) => ({
      assetData: data.assetData,
      data_pic: data.data_pic,
    }));

    console.log('Mengirim data seluruhnya:', postData);

    axios
      .post(`${environment.apiUrl2}/api/add/import/asset`, postData, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        console.log('Response:', response);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: response.data.message,
          timer: 1500,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchDataAsset();
        this.closeImportModal();
        this.fileSelected = false;
      })
      .catch((error) => {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Terjadi kesalahan saat mengirim data.',
        });
      });
  }

  convertImageToBase64(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();
      img.src = imagePath;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };
      img.onerror = (err) => {
        console.error('Failed to load image:', imagePath, err);
        resolve(''); // Resolusi dengan string kosong jika gagal
      };
    });
  }

  belum() {
    Swal.fire({
      title: 'Info',
      text: 'Fitur masih dalam pengembangan',
      icon: 'info',
      timer: 2000,
      timerProgressBar: true,
      showCancelButton: false,
      showConfirmButton: false,
    });
  }
}
