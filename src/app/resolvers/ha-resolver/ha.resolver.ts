import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { HaService } from '../../services/ha-service/ha.service';

@Injectable({
  providedIn: 'root',
})
export class HaResolver implements Resolve<string> {
  constructor(private haService: HaService, private router: Router) {}

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
      const type = await this.haService.checkHaType(form_uuid);

      if (type === 'ha') {
        const targetUrl = `/form/ha/${form_uuid}`;
        if (state.url !== targetUrl) {
          this.router.navigate([targetUrl]);
        }
      } else if (type === 'ha-review') {
        const targetUrl = `/form/ha-review/${form_uuid}`;
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
