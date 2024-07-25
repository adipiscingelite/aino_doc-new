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
import { QnaComponent } from './qna/qna.component';
import { UserControlComponent } from './control/user-control/user-control.component';
import { DocumentControlComponent } from './control/document-control/document-control.component';
import { ProductComponent } from './control/product/product.component';
import { ProjectComponent } from './control/project/project.component';
import { ApplicationComponent } from './control/application/application.component';
import { DivisionComponent } from './control/division/division.component';
import { AccessGroupComponent } from './control/access-group/access-group.component';
import { AuthorityComponent } from './control/authority/authority.component';
import { AuthGuard } from './auth/auth-guard.guard';

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
    canActivate: [AuthGuard],
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
        path: 'qna',
        component: QnaComponent
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
        path: 'control',
        children: [
          { path: 'user-control', component: UserControlComponent },
          { path: 'document-control', component: DocumentControlComponent },
          { path: 'product', component: ProductComponent },
          { path: 'project', component: ProjectComponent },
          { path: 'application', component: ApplicationComponent },
          { path: 'division', component: DivisionComponent },
          { path: 'access-group', component: AccessGroupComponent },
          { path: 'authority', component: AuthorityComponent },
          // { path: '', component: },
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
