import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { DatePipe } from '@angular/common';
import { routes } from './app.routes';
import { TourMatMenuModule, TourService } from 'ngx-ui-tour-md-menu';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: 'apiUrl', useValue: environment.apiUrl },
    DatePipe,
    TourMatMenuModule, // Tambahkan module di sini
    TourService // Jika perlu untuk inject
  ],
};
