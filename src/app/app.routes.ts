import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { FullComponent } from './layouts/full/full.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormDaComponent } from './form/form-da/form-da.component';
import { FormItcmComponent } from './form/form-itcm/form-itcm.component';
import { FormBaComponent } from './form/form-ba/form-ba.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HakAksesComponent } from './form/hak-akses-review/hak-akses.component';
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
import { AssetsComponent } from './form/list-assets/assets.component';
import { ThemesComponent } from './themes/themes.component';
import { SettingsComponent } from './settings/settings.component';
import { TourComponent } from './tour/tour.component';
import { NotificationComponent } from './notification/notification.component';
import { FormBaAssetsComponent } from './form/form-ba-assets/form-ba-assets.component';
import { HakAksesPermintaanComponent } from './form/hak-akses-permintaan/hak-akses-permintaan.component';
import { TesComponent } from './tes/tes.component';
import { FirstComponent } from './first/first.component';
import { GuestComponent } from './layouts/guest/guest.component';
import { BaResolver } from './resolvers/ba-resolver/ba.resolver';
import { HaResolver } from './resolvers/ha-resolver/ha.resolver';
import { RoleGuard } from './auth/role.guard';
import { QnaCustiomizationComponent } from './customization/qna-custiomization/qna-custiomization.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'guest',
    component: GuestComponent, // Atau bisa pakai komponen lain jika diperlukan
    children: [
      {
        path: 'form',
        children: [
          { path: 'berita-acara/:form_uuid', component: FormBaAssetsComponent },
        ],
      },
    ],
  },
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'notification',
        component: NotificationComponent,
        data: { breadcrumb: 'Notification' },
      },
      {
        path: 'help',
        component: QnaComponent,
        data: { breadcrumb: 'Qna' },
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { breadcrumb: 'Dashboard' },
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { breadcrumb: 'Settings' },
      },
      {
        path: 'themes',
        component: ThemesComponent,
        data: { breadcrumb: 'Themes' },
      },
      {
        path: 'tour',
        component: TourComponent,
      },
      {
        path: 'first-component',
        component: FirstComponent,
      },
      {
        path: 'chat',
        component: TesComponent,
      },
      {
        path: 'form',
        data: { breadcrumb: 'Form' },
        children: [
          {
            path: 'da',
            component: FormDaComponent,
            data: { breadcrumb: 'Form DA' },
          },
          {
            path: 'da/:form_uuid',
            component: FormDaComponent,
            data: { breadcrumb: 'Form DA Preview' },
          },
          {
            path: 'itcm',
            component: FormItcmComponent,
            data: { breadcrumb: 'Form ITCM' },
          },
          {
            path: 'itcm/:form_uuid',
            component: FormItcmComponent,
            data: { breadcrumb: 'Form ITCM Preview' },
          },
          {
            path: 'ba',
            component: FormBaComponent,
            data: { breadcrumb: 'Form BA' },
          },
          {
            path: 'ba/:form_uuid',
            component: FormBaComponent,
            resolve: {
              baType: BaResolver,
            },
            data: { breadcrumb: 'Form BA Preview' },
          },
          {
            path: 'ba-assets',
            component: FormBaAssetsComponent,
            canActivate: [RoleGuard],
            data: { breadcrumb: 'Form BA Asset' },
          },
          {
            path: 'berita-acara/:form_uuid',
            component: FormBaAssetsComponent,
            data: { breadcrumb: 'Form BA Preview' },
          },
          {
            path: 'assets/list',
            component: AssetsComponent,
            data: { breadcrumb: 'Asset' },
          },
          {
            path: 'assets/list/:asset_uuid',
            component: AssetsComponent,
            data: { breadcrumb: 'Asset' },
          },
          {
            path: 'hak-akses',
            component: HakAksesComponent,
            data: { breadcrumb: 'Form Hak Akses' },
          },
          {
            path: 'ha-review/:form_uuid',
            component: HakAksesComponent,
            data: { breadcrumb: 'Form HA Preview' },
          },
          {
            path: 'ha-permintaan',
            component: HakAksesPermintaanComponent,
            data: { breadcrumb: 'Form Hak Akses' },
          },
          {
            path: 'ha/:form_uuid',
            component: HakAksesPermintaanComponent,
            data: { breadcrumb: 'Form HA Preview' },
            resolve: { haType: HaResolver },
          },
        ],
      },
      {
        path: 'control',
        data: { breadcrumb: 'Control' },
        children: [
          {
            path: 'user-control',
            component: UserControlComponent,
            data: { breadcrumb: 'User Control' },
          },
          {
            path: 'document-control',
            component: DocumentControlComponent,
            data: { breadcrumb: 'Document Control' },
          },
          {
            path: 'product',
            component: ProductComponent,
            data: { breadcrumb: 'Product' },
          },
          {
            path: 'project',
            component: ProjectComponent,
            data: { breadcrumb: 'Project' },
          },
          {
            path: 'application',
            component: ApplicationComponent,
            data: { breadcrumb: 'Application' },
          },
          {
            path: 'division',
            component: DivisionComponent,
            data: { breadcrumb: 'Division' },
          },
          {
            path: 'access-group',
            component: AccessGroupComponent,
            data: { breadcrumb: 'Access Group' },
          },
          {
            path: 'authority',
            component: AuthorityComponent,
            data: { breadcrumb: 'Authority' },
          },
          // { path: '', component: },
        ],
      },
      {
        path: 'user',
        data: { breadcrumb: 'User' },
        children: [
          {
            path: 'profile',
            component: ProfileComponent,
            data: { breadcrumb: 'Profile' },
          },
          {
            path: 'change-password',
            component: ChangePasswordComponent,
            data: { breadcrumb: 'Change Password' },
          },
        ],
      },
      {
        path: 'customization',
        data: { breadcrumb: 'Control' },
        children: [
          {
            path: 'qna',
            component: QnaCustiomizationComponent,
            data: { breadcrumb: 'QnA' },
          },
        ],
      },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
