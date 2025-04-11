import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { DatePipe, IMAGE_CONFIG } from '@angular/common';
import { routes } from './app.routes';
import { TourMatMenuModule, TourService } from 'ngx-ui-tour-md-menu';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideEchartsCore } from 'ngx-echarts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),
    provideEchartsCore({
      echarts: () => import('echarts')
    }),
    provideRouter(routes),
    { provide: 'apiUrl', useValue: environment.apiUrl },
    { provide: 'apiUrl2', useValue: environment.apiUrl2 },
    DatePipe,
    // TourMatMenuModule,
    // TourService,
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
  ],
};
