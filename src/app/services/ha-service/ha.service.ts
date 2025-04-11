import { Injectable } from '@angular/core';
import axios, { AxiosError } from 'axios';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HaService {
  async checkHaType(form_uuid: string): Promise<'ha' | 'ha-review'> {
    try {
      await axios.get(`${environment.apiUrl2}/ha/review/${form_uuid}`);
      return 'ha-review';
    } catch (error: any) {
      const axiosError = error as AxiosError;

      if (
        axiosError.response &&
        (axiosError.response.status === 404 ||
          axiosError.response.status === 500)
      ) {
        try {
          await axios.get(`${environment.apiUrl2}/ha/${form_uuid}`);
          return 'ha';
        } catch (error2: unknown) {
          const axiosError2 = error2 as AxiosError;

          if (
            axiosError2.response &&
            (axiosError2.response.status === 404 ||
              axiosError2.response.status === 500)
          ) {
            throw new Error('UUID tidak ditemukan di kedua API');
          }
        }
      }
      throw new Error('Terjadi kesalahan pada API');
    }
  }
}
