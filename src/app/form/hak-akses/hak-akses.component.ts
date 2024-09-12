import {
  Component,
  OnInit,
  Inject,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormArray,
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
import { FormHaService } from '../../services/form-ha/form-ha.service';
import { CommonModule } from '@angular/common';

interface Signatory {
  sign_uuid: string;
  signatory_name: string;
  signatory_position: string;
  role_sign: string;
  is_sign: boolean;
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

interface Projects {
  project_uuid: string;
  project_name: string;
}

export interface HakAksesInfo {
  info_uuid: string;
  info_name: string;
  instansi: string;
  position: string;
  username: string;
  password: string;
  scope: string;
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
export class HakAksesComponent implements OnInit {
  isPreview: boolean = false; // State untuk menampilkan preview atau tabel

  searchText: string = '';

  form!: FormGroup;
  user_uuid: any;
  user_name: any;
  role_code: any;

  dataListAllDoc: Documents[] = [];
  dataListAllProject: Projects[] = [];

  form_uuid: any;

  document_uuid: string = '';
  //768e9241-c9ca-411f-8b91-4fb3ca7728bf
  document_name: string = '';
  form_ticket: string = '';
  form_ticket_update: string = '';
  form_name: string = '';
  project_uuid: string = '';
  project_name: string = '';

  formatted_form_number: string = '';
  form_status: string = '';
  project_manager: string = '';
  approval_status: string = '';

  created_by: string = '';
  created_at: string = '';
  updated_by: string = '';
  updated_at: string = '';
  deleted_by: string = '';
  deleted_at: string = '';

  info_uuid: string = '';
  info_name: string = '';

  dataListAllUser: any = [];

  no_da: string = '';
  nama_pemohon: string = '';
  instansi: string = '';
  tanggal: string = '';
  perubahan_aset: string = '';
  deskripsi: string = '';

  // instansi: string = '';
  name: string = '';
  position: string = '';
  username: string = '';
  password: string = '';
  scope: string = '';

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

  is_sign: boolean = false;
  is_sign1: boolean = false;
  is_sign2: boolean = false;
  is_sign3: boolean = false;
  is_sign4: boolean = false;
  is_sign5: boolean = false;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalApproveOpen: boolean = false;

  signatoryPositions: {
    [key: string]: { name: string; position: string; is_sign: boolean };
  } = {
    Pemohon: { name: '', position: '', is_sign: false },
    'Atasan Pemohon': { name: '', position: '', is_sign: false },
    Penerima: { name: '', position: '', is_sign: false },
    'Atasan Penerima': { name: '', position: '', is_sign: false },
  };

  constructor(
    private cookieService: CookieService,
    private fb: FormBuilder,
    public formItcmService: FormHaService,
    private cd: ChangeDetectorRef,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit(): void {
    this.fetchDataFormHA();
    this.fetchDataAdminFormHA();
    this.fetchDataUserFormHA();
    this.profileData();

    this.fetchAllUser();
    this.fetchAllDocument();
    this.fetchAllProject();
    this.fetchDocumentUUID();

    // draft
    this.fetchDataAdminFormITCMDraft();
    this.fetchDataUserFormITCMDraft();

    // signature
    this.fetchUserSignature();
  }

  dataListDocument: Documents[] = [];
  dataListProject: Projects[] = [];

  dataListFormITCM: formsITCM[] = [];
  dataListFormAdminITCM: formsITCM[] = [];
  dataListFormUserITCM: formsITCM[] = [];

  dataListFormHA: formsHA[] = [];
  dataListFormAdminHA: formsHA[] = [];
  dataListFormUserHA: formsHA[] = [];

  // draft
  dataListFormAdminHADraft: formsHA[] = [];
  dataListFormUserHADraft: formsHA[] = [];

  // signature
  dataListFormHASignature: formsHA[] = [];

  hakAksesInfoData: HakAksesInfo[] = [];

  matchesSearch(item: formsHA): boolean {
    const searchText = this.searchText.toLowerCase();
    return (
      item.form_number.toLowerCase().includes(searchText) ||
      item.form_ticket.toLowerCase().includes(searchText) ||
      item.document_name.toLowerCase().includes(searchText)
      // item.project_name.toLowerCase().includes(searchText) ||
      // item.project_manager.toLowerCase().includes(searchText) ||
      // item.no_da.toLowerCase().includes(searchText) ||
      // item.nama_pemohon.toLowerCase().includes(searchText) ||
      // item.instansi.toLowerCase().includes(searchText) ||
      // item.tanggal.toLowerCase().includes(searchText) ||
      // item.perubahan_aset.toLowerCase().includes(searchText) ||
      // item.deskripsi.toLowerCase().includes(searchText)
    );
  }

  profileData(): void {
    const token = this.cookieService.get('userToken');

    axios
      .get(`${this.apiUrl}/auth/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // console.log(response);
        this.user_uuid = response.data.user_uuid;
        this.user_name = response.data.user_name;
        this.role_code = response.data.role_code;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchDataFormHA() {
    axios
      .get(`${environment.apiUrl2}/hak/akses`)
      .then((response) => {
        this.dataListFormHA = response.data;
        console.log(response.data);
        // this.formItcmService.updateDataListFormITCM(this.dataListFormITCM);
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
      .get(`${environment.apiUrl2}/admin/my/ha/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListFormAdminHA = response.data;
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
    ``;
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

  // signature
  fetchUserSignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/ha`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListFormHASignature = response.data.filter(
          (item: any) => item.form_status === 'Published'
        );
        console.log('ooooo', response);

        // cuma menampilkan yg udh published aja
        // console.log('wirrrrrrrrrr', response);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error.response.data);
        } else {
          console.log(error.response.data);
        }
      });
  }

  //! my document yg draft
  // draft admin
  fetchDataAdminFormITCMDraft(): void {
    axios
      .get(`${environment.apiUrl2}/admin/my/ha/division`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListFormAdminHADraft = response.data.filter(
          (item: any) => item.form_status === 'Draft'
        );
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
  fetchDataUserFormITCMDraft() {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ha`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        this.dataListFormUserHADraft = response.data.filter(
          (item: any) => item.form_status === 'Draft'
        );
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
    // console.log(Handling ${action} for:, item);
    this.closePopover();
  }

  // input dinamis coy
  infoHAForm: FormGroup = new FormGroup({
    data_info_ha: new FormArray([]),
  });

  getInfoHAField(): FormGroup {
    return new FormGroup({
      info_name: new FormControl(''),
      instansi: new FormControl(''),
      position: new FormControl(''),
      username: new FormControl(''),
      password: new FormControl(''),
      scope: new FormControl(''),
    });
  }

  getInfoHAFieldsValue(): any[] {
    return this.infoHAListArray().controls.map((control) => control.value);
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

  approveForm(form_uuid: any) {}

  signature(form_uuid: any) {}

  openPreviewPage(form_uuid: any) {}

  openAddModal() {
    this.isModalAddOpen = true;
    
    // Reset form array
    const infoHAArray = this.infoHAListArray();
    infoHAArray.clear(); // Clear existing fields
    
    // Add a new empty field
    this.addInfoHAField();
  
    // Detect changes to update the UI
    this.cd.detectChanges();
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addFormHA() {
    // const postData = {
    //   isPublished: false,
    //   formData: {
    //     document_uuid: this.document_uuid,
    //     // form_status: "Draft"
    //   },
    //   ha: {
    //     // form_ticket: this.form_ticket,
    //     form_name: this.form_name,
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

    axios
      .post(
        `${environment.apiUrl2}/api/add/ha`,
        {
          isPublished: false,
          formData: {
            document_uuid: this.document_uuid,
            // form_status: "Draft"
          },
          ha: {
            // form_ticket: this.form_ticket,
            form_name: this.form_name,
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
            // {
            //   name: this.name5,
            //   postion: this.position5,
            //   role_sign: this.roleSign5,
            // },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
          },
        }
      )
      .then((response) => {
        console.log('Response:', response);
        this.fetchDataFormHA();
        this.fetchDataAdminFormHA();
        this.fetchDataUserFormHA();
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

  openEditModal(form_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/ha/${form_uuid}`)
      .then((response) => {
        // Buka modal edit
        this.isModalEditOpen = true;
        console.log('edit ha', response);

        const formData = response.data;
        this.hakAksesInfoData = formData.data_info_ha;

        this.form_uuid = formData.form.form_uuid;
        this.form_name = formData.form.form_name;

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

        formData.data_info_ha.forEach((data: any) => {
          infoHAArray.push(
            new FormGroup({
              info_name: new FormControl(data.info_name || ''), // Ensure this matches your template
              instansi: new FormControl(data.instansi || ''),
              position: new FormControl(data.position || ''),
              username: new FormControl(data.username || ''),
              password: new FormControl(data.password || ''),
              scope: new FormControl(data.scope || ''),
            })
          );
        });

        console.log('signdata', signData);
        console.log('Data info HA setelah di-set:', this.infoHAListArray().getRawValue());
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
        form_name: this.form_name,
      },
      hakAksesInfoData: this.hakAksesInfoData.map((info) => ({
        info_name: info.info_name,
        instansi: info.instansi,
        position: info.position,
        username: info.username,
        password: info.password,
        scope: info.scope,
      })),
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

  openApproveModal(form_uuid: string) {
    axios.get(`${environment.apiUrl2}/itcm/${form_uuid}`).then((response) => {
      this.isModalAddOpen = true;
      this.form_ticket = response.data.form_ticket;
      this.formatted_form_number = response.data.formatted_form_number;
      this.form_status = response.data.form_status;
      this.document_name = response.data.document_name;
      this.project_name = response.data.project_name;
      this.project_manager = response.data.project_manager;
      this.approval_status = response.data.approval_status;
      this.no_da = response.data.no_da;
      this.nama_pemohon = response.data.nama_pemohon;
      this.instansi = response.data.instansi;
      this.tanggal = response.data.tanggal;
      this.perubahan_aset = response.data.perubahan_aset;
      this.deskripsi = response.data.deskripsi;
      this.created_by = response.data.created_by;
      this.created_at = response.data.created_at;
      this.updated_by = response.data.updated_by;
      this.updated_at = response.data.updated_at;
      this.deleted_by = response.data.deleted_by;
      this.deleted_at = response.data.deleted_at;
    });
  }

  closeApproveModal() {
    this.isModalApproveOpen = false;
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

export { formsHA };
