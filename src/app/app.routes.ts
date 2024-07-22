import { Routes } from '@angular/router';
import { FirstComponent } from './first/first.component';
import { SecondComponent } from './second/second.component';
import { ProfileComponent } from './profile/profile.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { LoginComponent } from './login/login.component';
import { SidebarComponent } from './navigations/sidebar/sidebar.component';
import { FullComponent } from './layouts/full/full.component';

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
        path: 'user',
        children: [
          { path: 'profile', component: ProfileComponent },
          { path: 'favorite', component: FavoriteComponent },
        ]
      },
    ]
  },
  // { path: '**', component: PagenotfoundComponent }
];
