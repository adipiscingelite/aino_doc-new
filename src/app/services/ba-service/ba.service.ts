import { Injectable } from '@angular/core';
import axios, { AxiosError } from 'axios';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BaService {
  async checkBaType(form_uuid: string): Promise<'ba' | 'ba-assets'> {
    console.log('BaService: Mengecek UUID:', form_uuid);

    try {
      console.log('Coba request ke API BA biasa...');
      await axios.get(`${environment.apiUrl2}/ba/${form_uuid}`);
      console.log('UUID ditemukan di BA biasa');
      return 'ba';
    } catch (error: any) {
      const axiosError = error as AxiosError;
      console.log('BA biasa tidak ditemukan, coba ke BA Asset...');

      if (axiosError.response && axiosError.response.status === 500) {
        try {
          console.log('Coba request ke API BA Asset...');
          await axios.get(
            `${environment.apiUrl2}/form/beritaacara/${form_uuid}`
          );
          console.log('UUID ditemukan di BA Asset');
          return 'ba-assets';
        } catch (error2: unknown) {
          const axiosError2 = error2 as AxiosError;
          if (axiosError2.response && axiosError2.response.status === 500) {
            console.log('UUID tidak ditemukan di kedua API');
            throw new Error('UUID tidak ditemukan di kedua API');
          }
        }
      }
      console.log('Terjadi kesalahan saat memeriksa API:', error);
      throw new Error('Terjadi kesalahan pada API');
    }
  }
}
