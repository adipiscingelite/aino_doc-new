import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-form-itcm',
  standalone: true,
  imports: [CommonModule],
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

  
}
