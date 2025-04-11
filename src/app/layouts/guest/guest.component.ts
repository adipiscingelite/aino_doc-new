import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../navigations/sidebar/sidebar.component';
import { HeaderComponent } from '../../navigations/header/header.component';

@Component({
  selector: 'app-guest',
  standalone: true,
  imports: [CommonModule,RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './guest.component.html',
  styleUrl: './guest.component.css'
})
export class GuestComponent {

}
