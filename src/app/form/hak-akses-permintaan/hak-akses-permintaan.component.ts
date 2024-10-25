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
} from '@angular/forms';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import SignaturePad from 'signature_pad';

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
  nama_tim: string;
  product_manager: string;
  nama_pengusul: string;
  tanggal_usul: string;
  form_type: string;
  form_status: string;
  approval_status: string;
}

interface HakAkses {
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

  document_uuid: string = '';

  form_uuid: string = '';
  form_number: string = '';
  form_type: string = 'Permintaan';
  nama_tim: string = '';
  product_manager: string = '';
  nama_pengusul: string = '';
  tanggal_usul: string = '';
  form_status: string = '';
  approval_status: string = '';

  reason: string = '';

  created_by: string = '';
  created_at: string = '';
  updated_by: string = '';
  updated_at: string = '';
  deleted_by: string = '';
  deleted_at: string = '';

  dataInfoHA: any[] = [];

  dataListAllUser: any = [];

  user_uuid: any;
  user_name: any;
  role_code: any;
  personal_name: string = 'finance user';

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

  constructor(
    private cookieService: CookieService,
    // private fb: FormBuilder,
    // public formItcmService: FormHaService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit(): void {
    this.profileData();

    this.fetchAllUser();

    this.fetchDataFormHA();
    this.fetchDataAdminFormHA();
    this.fetchDataUserFormHA();

    this.fetchDocumentUUID();

    this.route.paramMap.subscribe((params) => {
      const form_uuid = params.get('form_uuid');
      if (form_uuid) {
        this.openPreviewPage(form_uuid); // Panggil fungsi dengan UUID dari URL
      }
    });
  }

  dataListFormHA: formsHA[] = [];
  dataListFormAdminHA: formsHA[] = [];
  dataListFormUserHA: formsHA[] = [];

  hakAksesInfoData: HakAkses[] = [];

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

  fetchDataFormHA() {
    axios
      .get(`${environment.apiUrl2}/hak/akses`)
      .then((response) => {
        this.dataListFormHA = response.data;
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
        this.dataListFormAdminHA = response.data;
        console.log('prii', response);
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
        this.dataListFormUserHA = response.data;
        console.log('punya user ', response);
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
        this.cd.detectChanges(); // Force Angular to detect changes
      })
      .catch((error) => {
        console.log(error.response.data.message);
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

  infoHAForm: FormGroup = new FormGroup({
    data_info_ha: new FormArray([]),
  });

  getInfoHAField(): FormGroup {
    return new FormGroup({
      nama_pengguna: new FormControl(''),
      ruang_lingkup: new FormControl(''),
      jangka_waktu: new FormControl(''),
    });
  }

  getInfoHAFieldsValue() {
    return this.infoHAForm?.get('data_info_ha')?.value.map((field: any) => {
      if (this.form_type === 'Permintaan') {
        return {
          nama_pengguna: field.nama_pengguna,
          ruang_lingkup: field.ruang_lingkup,
          jangka_waktu: field.jangka_waktu,
        };
      } else {
        return {
          nama_pengguna: field.nama_pengguna,
          ruang_lingkup: field.ruang_lingkup,
        };
      }
    });
  }

  infoHAListArray() {
    return this.infoHAForm.get('data_info_ha') as FormArray;
  }

  addInfoHAField() {
    this.infoHAListArray().push(this.getInfoHAField());
    console.log('halo');
  }

  removeInfoHAField(i: number) {
    this.infoHAListArray().removeAt(i);
  }

  data() {
    console.log(this.infoHAForm.value);
  }

  openAddModal() {
    this.isModalAddOpen = true;

    const infoHAArray = this.infoHAListArray();
    infoHAArray.clear();

    this.addInfoHAField();

    this.cd.detectChanges();
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addFormDA() {
    // const postData = {
    //   isPublished: false,
    //   formData: {
    //     document_uuid: '089837413947',
    //     // form_status: "Draft"
    //   },
    //   haReq: {
    //     form_type: this.form_type,
    //     nama_tim: this.nama_tim,
    //     product_manager: this.product_manager,
    //     nama_pengusul: this.nama_pengusul,
    //     tanggal_usul: this.tanggal_usul,
    //   },
    //   data_info_ha: this.getInfoHAFieldsValue(),
    //   signatories: [
    //     {
    //       name: 'member',
    //       position: 'Manager',
    //       role_sign: 'Disusun oleh',
    //     },
    //   ],
    // };

    // console.log('data yg dipost',postData);
    console.log('laaa', this.getInfoHAFieldsValue());

    axios
      .post(
        `${environment.apiUrl2}/api/add/ha`,
        {
          isPublished: false,
          formData: {
            document_uuid: this.document_uuid,
            // form_status: "Draft"
          },
          haReq: {
            form_type: this.form_type,
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
          title: 'Berhasil',
          text: response.data.message,
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchDataFormHA();
        this.fetchDataAdminFormHA();
        this.fetchDataUserFormHA();
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

  openEditModal(form_uuid: string) {
    // this.fetchDocumentUUID()
    // console.log('Document UUID 2:', this.document_uuid);
    axios
      .get(`${environment.apiUrl2}/ha/${form_uuid}`)
      .then((response) => {
        console.log('plis coy', response.data);
        // console.log('plis laah', response.data.form.document_uuid);
        console.log('log', response.data.data_info_ha);

        this.isModalEditOpen = true;
        const formData = response.data.form;

        this.hakAksesInfoData = response.data.data_info_ha;

        this.form_uuid = formData.form_uuid;
        this.document_uuid = this.document_uuid;
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

        // Ensure this matches the template
        const infoHAArray = this.infoHAListArray();
        infoHAArray.clear(); // Clear existing fields before adding new ones

        // Push new data from API response
        response.data.data_info_ha.forEach((data: any) => {
          infoHAArray.push(
            new FormGroup({
              nama_pengguna: new FormControl(data.nama_pengguna || ''),
              ruang_lingkup: new FormControl(data.ruang_lingkup || ''),
              jangka_waktu: new FormControl(data.jangka_waktu || ''),
            })
          );
        });

        console.log('InfoHAArray after pushing', this.infoHAForm.value); // Debugging log
        console.log('jawi');

        console.log('signdata', signData);
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
    this.hakAksesInfoData = this.infoHAListArray().getRawValue();

    const data = {
      formData: {
        form_uuid: this.form_uuid,
        nama_tim: this.nama_tim,
        product_manager: this.product_manager,
        nama_pengusul: this.nama_pengusul,
        tanggal_usul: this.tanggal_usul,
        form_type: this.form_type,
      },
      hakAksesInfoData: this.hakAksesInfoData.map((info) => ({
        nama_pengguna: info.nama_pengguna,
        ruang_lingkup: info.ruang_lingkup,
        jangka_waktu: info.jangka_waktu,
      })),
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

    // Log data yang akan dikirim
    console.log('Data yang akan dikirim untuk update Form HA:', data);

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
        this.fetchDataFormHA();
        this.fetchDataAdminFormHA();
        this.fetchDataUserFormHA();
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
            this.fetchDataFormHA();
            this.fetchDataAdminFormHA();
            this.fetchDataUserFormHA();
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
    await this.profileData();
    axios
      .get(`${environment.apiUrl2}/ha/${form_uuid}`)
      .then((response) => {
        console.log('cik', response);
        const BASE_URL = environment.apiUrl2;

        const formData = response.data.form;
        const infoData = response.data.data_info_ha;
        // const
        console.log('bejir', formData);
        console.log('angjas', infoData);

        this.form_uuid = formData.form_uuid;
        this.form_number = formData.form_number;
        this.nama_tim = formData.nama_tim;
        this.product_manager = formData.product_manager;
        this.nama_pengusul = formData.nama_pengusul;
        this.tanggal_usul = formData.tanggal_usul;
        this.form_type = formData.form_type;
        this.form_status = formData.form_status;
        this.approval_status = formData.approval_status;

        this.dataInfoHA = infoData;

        this.isPreview = true;

        this.router.navigate([`/form/hak-ha/${form_uuid}`]);

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
        this.fetchDataFormHA();
        this.fetchDataAdminFormHA();
        this.fetchDataUserFormHA();
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
        this.fetchDataFormHA();
        this.fetchDataAdminFormHA();
        this.fetchDataUserFormHA();
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
        this.fetchDataFormHA();
        this.fetchDataAdminFormHA();
        this.fetchDataUserFormHA();
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
