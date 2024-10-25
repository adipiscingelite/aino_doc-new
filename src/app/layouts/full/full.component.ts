import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from '../../navigations/sidebar/sidebar.component';
import { HeaderComponent } from '../../navigations/header/header.component';
import { CommonModule } from '@angular/common';
// import { TourGuideService } from '../../services/shepherd/shepherd.service';
// import { ShepherdService } from 'angular-shepherd';
// import Shepherd from 'shepherd.js';
// import { filter, Subscription } from 'rxjs';
// import Shepherd from '../../../../pp/types/shepherd';


@Component({
  selector: 'app-full',
  standalone: true,
  imports: [ CommonModule,RouterOutlet, SidebarComponent, HeaderComponent,],
  templateUrl: './full.component.html',
  styleUrl: './full.component.css'
})
export class FullComponent {
  
}