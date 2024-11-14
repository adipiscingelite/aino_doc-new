import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-status-info.component.html',
  styleUrls: ['./form-status-info.component.css']
})
export class FormStatusInfoComponent {
  @Input() status: string = ''; // menerima status sebagai input
}
