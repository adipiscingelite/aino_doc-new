import { Routes } from '@angular/router';
import { FirstComponent } from './first/first.component';
import { SecondComponent } from './second/second.component';
import { ProfileComponent } from './profile/profile.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { LoginComponent } from './login/login.component';
import { SidebarComponent } from './navigations/sidebar/sidebar.component';
import { FullComponent } from './layouts/full/full.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormDaComponent } from './form/form-da/form-da.component';
import { FormItcmComponent } from './form/form-itcm/form-itcm.component';
import { FormBaComponent } from './form/form-ba/form-ba.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HakAksesComponent } from './form/hak-akses/hak-akses.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: 'first-component',
        component: FirstComponent
      },
      {
        path: 'second-component',
        component: SecondComponent
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'form',
        children: [
          { path: 'da', component: FormDaComponent },
          { path: 'itcm', component: FormItcmComponent },
          { path: 'ba', component: FormBaComponent },
          { path: 'hak-akses', component: HakAksesComponent },

        ]
      },
      {
        path: 'user',
        children: [
          { path: 'profile', component: ProfileComponent },
          { path: 'favorite', component: FavoriteComponent },
        ]
      },
    ]
  },
  { path: '**', component: NotFoundComponent }
];
