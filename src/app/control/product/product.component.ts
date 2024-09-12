import { Component, Inject, OnInit, HostListener } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ProductService } from '../../services/product/product.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Product {
  product_uuid: string;
  product_name: string;
  product_owner: string;
  product_order: number;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  deleted_by: string;
  deleted_at: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  
  popoverIndex: number | null = null;
  
  searchText: string = '';

  product_uuid: string = '';
  product_name: string = '';
  product_owner: string = '';
  product_order: string = '';
  created_by: string = '';
  created_at: string = '';
  updated_by: string = '';
  updated_at: string = '';
  deleted_by: string = '';
  deleted_at: string = '';
  user_uuid: any;
  user_name: any;
  role_code: any;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;

  constructor(
    private cookieService: CookieService,
    public productService: ProductService,
    @Inject('apiUrl') private apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  dataListProduct: any[] = [];

  ngOnInit(): void {
    this.fetchDataProduct();
    this.profileData();
  }

  matchesSearch(item: any): boolean {
    const searchLowerCase = this.searchText.toLowerCase();
    return (
      item.product_name.toLowerCase().includes(searchLowerCase) ||
      item.product_owner.toLowerCase().includes(searchLowerCase)
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

  fetchDataProduct(): void {
    axios
      .get(`${environment.apiUrl2}/product`)
      .then((response) => {
        this.dataListProduct = response.data;
        this.productService.updateDataListProduct(this.dataListProduct);
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
    this.isModalAddOpen = true;
    this.product_name = '';
    this.product_owner = '';
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  addProduct(): void {
    const token = this.cookieService.get('userToken');

    axios
      .post(
        `${environment.apiUrl2}/superadmin/product/add`,
        {
          product_name: this.product_name,
          product_owner: this.product_owner,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        this.fetchDataProduct();
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Product baru ditambahkan',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
        this.product_name = '';
        this.product_owner = '';
      })
      .catch((error) => {
        if (
          error.response.status === 400 ||
          error.response.status === 422 ||
          error.response.status === 500
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
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Terjadi kesalahan',
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

  openEditModal(product_uuid: string) {
    axios
      .get(`${environment.apiUrl2}/product/${product_uuid}`)
      .then((response) => {
        this.isModalEditOpen = true;
        this.product_uuid = response.data.product_uuid;
        this.product_name = response.data.product_name;
        this.product_owner = response.data.product_owner;
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 404) {
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

  closeEditModal() {
    this.isModalEditOpen = false;
  }

  updateProduct(): void {
    const token = this.cookieService.get('userToken');
    axios
      .put(
        `${environment.apiUrl2}/superadmin/product/update/${this.product_uuid}`,
        {
          product_name: this.product_name,
          product_owner: this.product_owner,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        this.fetchDataProduct();
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Produk diperbarui',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.log(error);
        if (
          error.response.status === 500 ||
          error.response.status === 404 ||
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

  onDeleteProduct(product_uuid: string): void {
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Anda yakin ingin menghapus Product ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDeleteProduct(product_uuid);
      }
    });
  }

  performDeleteProduct(product_uuid: string): void {
    const token = this.cookieService.get('userToken');

    axios
      .put(
        `${environment.apiUrl2}/superadmin/product/delete/${product_uuid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data.message);
        this.fetchDataProduct();
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

export { Product };
