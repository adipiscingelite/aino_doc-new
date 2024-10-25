import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';

interface SignNotification {
  form_uuid: string;
  form_number: string;
  form_ticket: string;
  document_code: string;
  document_name: string;
  form_status: string;
  role_sign: string;
  is_sign: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  timeAgo?: string;
}

interface ApproveNotification {
  form_uuid: string;
  form_number: string;
  form_ticket: string;
  document_code: string;
  document_name: string;
  form_status: string;
  role_sign: string;
  is_sign: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  timeAgo?: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {
  notifications: SignNotification[] = [];
  approveNotifications: ApproveNotification[] = [];
  openTab = 1; 

  constructor(private cookieService: CookieService) {}

  ngOnInit(): void {
    this.fetchNotification();
    this.fetchApproveNotification();
  }

  timeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return rtf.format(-minutes, 'minute');
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return rtf.format(-hours, 'hour');
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return rtf.format(-days, 'day');
    }
  }

  fetchNotification() {
    const token = this.cookieService.get('userToken');
    axios
      .get(`${environment.apiUrl2}/api/my/notif`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const notifications = response.data as SignNotification[];
        this.notifications = notifications
          .filter((notification) => notification.form_status === 'Published')
          .map((notification) => {
            const createdAtLocal = new Date(
              new Date(notification.created_at).getTime() +
                new Date(notification.created_at).getTimezoneOffset() * 60000
            );
            return { ...notification, timeAgo: this.timeAgo(createdAtLocal) };
          })
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
      })
      .catch((error) => {
        if (error.response?.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  fetchApproveNotification() {
    const token = this.cookieService.get('userToken');
    axios
      .get(`${environment.apiUrl2}/api/my/approve/notif`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const notifications = response.data as ApproveNotification[];
        this.approveNotifications = notifications 
          .map((notification) => {
            const createdAtLocal = new Date(
              new Date(notification.created_at).getTime() +
                new Date(notification.created_at).getTimezoneOffset() * 60000
            );
            return { ...notification, timeAgo: this.timeAgo(createdAtLocal) };
          })
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          console.log('jawak',this.approveNotifications);
          
      })
      .catch((error) => {
        if (error.response?.status === 500) {
          console.log(error.response.data.message);
        }
      });
  }

  toggleTabs(tabNumber: number) {
    this.openTab = tabNumber;
  }
}
