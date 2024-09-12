import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
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
import { LoginGuard } from './auth/login-guard.guard';
import { ChangePasswordComponent } from './profile/change-password/change-password.component';
import { CobaSignModalComponent } from './coba-sign-modal/coba-sign-modal.component';
import { CobaPdfTemplate,} from './coba-pdf-template/coba-pdf-template.component';
import { TesComponent } from './form/tes/tes.component';
import { ThemesComponent } from './themes/themes.component';
import { SettingsComponent } from './settings/settings.component';
import { TourComponent } from './tour/tour.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    // canActivate: [LoginGuard]
  },
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'pdf',
        component: CobaPdfTemplate,
      },
      {
        path: 'coba-gambar',
        component: CobaSignModalComponent,
      },
      {
        path: 'qna',
        component: QnaComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'themes',
        component: ThemesComponent,
      },
      {
        path: 'tour',
        component: TourComponent,
      },
      {
        path: 'form',
        children: [
          { path: 'da', component: FormDaComponent },
          { path: 'da/:form_uuid', component: FormDaComponent }, 
          { path: 'itcm', component: FormItcmComponent },
          { path: 'itcm/:form_uuid', component: FormItcmComponent }, 
          { path: 'ba', component: FormBaComponent },
          { path: 'ba/:form_uuid', component: FormBaComponent }, 
          { path: 'hak-akses', component: HakAksesComponent },
          { path: 'tes', component: TesComponent},
        ],
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
        ],
      },
      {
        path: 'user',
        children: [
          { path: 'profile', component: ProfileComponent },
          // { path: 'favorite', component: FavoriteComponent },
          { path: 'change-password', component: ChangePasswordComponent },
        ],
      },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
