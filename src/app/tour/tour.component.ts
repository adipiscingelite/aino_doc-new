import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour.component.html',
  styleUrls: ['./tour.component.css']
})
export class TourComponent {
  popoverIndex: number | null = null;
  isModalAddOpen: boolean = false;

  halaman = [
    { id: 'dashboard', value: '#dashboard' },
    { id: 'formITCM', value: '#formITCM' },
  ];
  
  options = [
    { id: 'profile-img', value: '#profile-img', context: 'dashboard' },
    { id: 'header', value: '#header', context: 'dashboard' },
    { id: 'main-content', value: '#main-content', context: 'dashboard' },
    { id: 'sidebar', value: '#sidebar', context: 'dashboard' },
    { id: 'footer', value: '#footer', context: 'dashboard' },
    { id: 'search-bar', value: '#search-bar', context: 'dashboard' },
    { id: 'notification-bell', value: '#notification-bell', context: 'dashboard' },
    { id: 'user-menu', value: '#user-menu', context: 'dashboard' },
    { id: 'settings-panel', value: '#settings-panel', context: 'dashboard' },
    { id: 'dashboard-summary', value: '#dashboard-summary', context: 'dashboard' },
    { id: 'ticket-form', value: '#ticket-form', context: 'formITCM' },
    { id: 'request-details', value: '#request-details', context: 'formITCM' },
    { id: 'review-status', value: '#review-status', context: 'formITCM' },
  ];
  
  filteredOptions = [...this.options]; // Initial filter value
  
  selectedPage: string = '';
  
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
  }

  onPageChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedPage = selectElement.value;
    this.selectedPage = selectedPage;
    this.filteredOptions = this.options.filter(option => option.context === selectedPage);
  }
  
}
