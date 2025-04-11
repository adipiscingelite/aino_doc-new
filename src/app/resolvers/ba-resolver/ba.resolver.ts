import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { BaService } from '../../services/ba-service/ba.service';

@Injectable({
  providedIn: 'root',
})
export class BaResolver implements Resolve<string> {
  constructor(private baService: BaService, private router: Router) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<string> {
    const form_uuid = route.paramMap.get('form_uuid');

    if (!form_uuid) {
      this.router.navigate(['/']);
      return '';
    }

    try {
      const type = await this.baService.checkBaType(form_uuid);

      if (type === 'ba') {
        const targetUrl = `/form/ba/${form_uuid}`;
        if (state.url !== targetUrl) {
          this.router.navigate([targetUrl]);
        }
      } else if (type === 'ba-assets') {
        const targetUrl = `/form/berita-acara/${form_uuid}`;
        if (state.url !== targetUrl) {
          this.router.navigate([targetUrl]);
        }
      }

      return type;
    } catch (error) {
      this.router.navigate(['/not-found']);
      return '';
    }
  }
}
