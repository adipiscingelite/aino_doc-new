import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  private apiUrl: string;
  private routerSub!: Subscription;

  @Input() isSidebarVisible!: boolean;
  @Output() close = new EventEmitter<void>();

  role_code = '';
  division_code = '';
  isAnyLinkActive: boolean = false;

  constructor(
    private cookieService: CookieService,
    private router: Router,
    @Inject('apiUrl') apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit() {
    this.fetchProfileData();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentUrl = this.router.url;
        this.isAnyLinkActive =
          currentUrl.includes('ha-permintaan') ||
          currentUrl.includes('hak-akses');
      });

    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.onNavigate();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isSidebarVisible']) {
    }
  }

  closeSidebar() {
    this.close.emit();
  }

  onNavigate() {
    this.closeSidebar();
  }

  fetchProfileData(): void {
    const token = this.cookieService.get('userToken');

    axios
      .get(`${this.apiUrl}/auth/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        this.division_code = response.data.division_code;
        this.role_code = response.data.role_code;
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
