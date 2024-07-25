import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-itcm',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './form-itcm.component.html',
  styleUrl: './form-itcm.component.css'
})
export class FormItcmComponent {
  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalApproveOpen: boolean = false;

  openAddModal() {
    this.isModalAddOpen = true;
  };
  closeAddModal() {
    this.isModalAddOpen = false;
  };
  openEditModal() {
    this.isModalEditOpen = true;
  };
  closeEditModal() {
    this.isModalEditOpen = false;
  };
  openApproveModal() {
    this.isModalApproveOpen = true;
  };
  closeApproveModal() {
    this.isModalApproveOpen = false;
  };

  onDeleteFormDA() {
    Swal.fire({
      title: "Konfirmasi",
      text: "Anda yakin ingin menghapus Formulir ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then(() => {
      this.performDeleteBA();
    })
  }

  performDeleteBA() {
        Swal.fire({
          title: 'Success',
          text: 'Berhasil' ,
          icon: 'success',
          timer: 3000
        });
  }
}
