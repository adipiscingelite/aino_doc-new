import { Component, OnInit, Inject, HostListener } from '@angular/core';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { ProjectService } from '../../services/project/poject.service';

import { FormsModule, ReactiveFormsModule, FormGroupDirective, FormBuilder,FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Project {
  project_uuid: string;
  product_name: string;
  project_name: string;
  project_code: string;
  project_manager: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  deleted_by: string;
  deleted_at: string;
}

interface Product {
  product_uuid: string;
  product_name: string;
}

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
})
export class ProjectComponent implements OnInit {

  popoverIndex: number | null = null;
  searchText: string = '';

  product!: FormGroup;

  itemProduct!: FormGroup;
  project_uuid: string = '';
  product_uuid: string = '';
  product_name: string = '';
  project_name: string = '';
  project_code: string = '';
  project_manager: string = '';
  created_by: string = '';
  created_at: string = '';
  updated_by: string = '';
  updated_at: string = '';
  deleted_by: string = '';
  deleted_at: string = '';

  dataListProduct: Product[] = [];
  user_uuid: any;
  user_name: any;
  role_code: any;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;

  constructor(
    private cookieService: CookieService,
    public projectService: ProjectService,
    private fb: FormBuilder,
    // private formGroupDirective: FormGroupDirective,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  dataListProject: any[] = [];

  ngOnInit(): void {
    this.fetchDataProject();
    this.fetchDataProduct();
    this.profileData();

    this.product = this.fb.group({
      product_uuid: [''],
      product_name: [''],
    });

    this.fetchDataProduct();
  }

  matchesSearch(item: any): boolean {
    const searchLowerCase = this.searchText.toLowerCase();
    return (
      item.product_name.toLowerCase().includes(searchLowerCase) ||
      item.project_name.toLowerCase().includes(searchLowerCase) ||
      item.project_code.toLowerCase().includes(searchLowerCase) ||
      item.project_manager.toLowerCase().includes(searchLowerCase)
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
        console.log(response);
        this.user_uuid = response.data.user_uuid;
        this.user_name = response.data.user_name;
        this.role_code = response.data.role_code;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fetchDataProject(): void {
    axios
      .get(`${environment.apiUrl2}/project`)
      .then((response) => {
        console.log(response);
        this.dataListProject = response.data;
        this.projectService.updateDataListProject(this.dataListProject);
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
        }
      });
  }

  fetchDataProduct(): void {
    axios
      .get(`${environment.apiUrl2}/product`)
      .then((response) => {
        this.dataListProduct = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        if (error.response.status === 500) {
          console.log(error);
        }
      });
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

  openAddModal() {
    this.fetchDataProduct();
    this.isModalAddOpen = true;
    this.project_name = '';
    this.project_code = '';
    this.project_manager = '';
  }

  closeAddModal() {
    this.isModalEditOpen = false;
  }

  addProject(): void {
    axios
      .post(
        `${environment.apiUrl2}/superadmin/project/add`,
        {
          product_uuid: this.product_uuid,
          project_name: this.project_name,
          project_code: this.project_code,
          project_manager: this.project_manager,
        },
        {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
          },
        }
      )
      .then((response) => {
        this.dataListProject = response.data;
        this.fetchDataProject();
        // $('#addProjectModal').modal('hide');
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Project baru ditambahkan',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.fetchDataProduct();
        this.project_name = '';
        this.project_code = '';
        this.project_manager = '';
      })
      .catch((error) => {
        if (
          error.response.status === 500 ||
          error.response.status === 400 ||
          error.response.status === 422
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

  openEditModal(project_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/project/${project_uuid}`)
      .then((response) => {
        this.project_uuid = response.data.project_uuid;
        this.project_name = response.data.project_name;
        this.project_code = response.data.project_code;
        this.project_manager = response.data.project_manager;
  
        const existingProduct = this.dataListProduct.find(
          (product) => product.product_name === response.data.product_name
        );
  
        // Ensure to set the default value before opening the modal
        if (existingProduct) {
          this.product_uuid = existingProduct.product_uuid;
          this.product.patchValue({
            product_uuid: existingProduct.product_uuid,
          });
        }
  
        // Open the modal after setting the default value
        this.isModalEditOpen = true;
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
          });
        }
      });
  }
  

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateProject(): void {
    const projectData = {
      product_uuid: this.product_uuid,
      project_name: this.project_name,
      project_code: this.project_code,
      project_manager: this.project_manager,
    };
    console.log(projectData);

    axios
      .put(
        `${environment.apiUrl2}/superadmin/project/update/${this.project_uuid}`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${this.cookieService.get('userToken')}`,
          },
        }
      )
      .then((response) => {
        this.dataListProject = response.data;
        this.fetchDataProject();
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Project berhasil diperbarui',
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
    this.isModalEditOpen = false;
  }

  onDeleteProject(project_uuid: string): void {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Anda yakin ingin menghapus Project ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteProject(project_uuid);
      }
    });
  }

  performDeleteProject(project_uuid: string): void {
    const token = this.cookieService.get('userToken');

    axios
      .put(
        `${environment.apiUrl2}/superadmin/project/delete/${project_uuid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataProject();
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
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

export { Project };
