import { Component } from '@angular/core';

@Component({
  selector: 'app-hak-akses',
  standalone: true,
  imports: [],
  templateUrl: './hak-akses.component.html',
  styleUrl: './hak-akses.component.css'
})
export class HakAksesComponent {
  ngAfterViewInit() {
    // Pastikan kode JS dieksekusi setelah tampilan komponen dirender
    this.loadVideoScript();
  }

  loadVideoScript() {
    // Menggunakan jQuery di sini, pastikan jQuery sudah diimport jika perlu
    // Misalnya, bisa menggunakan CDN jQuery jika belum ada
    const script = document.createElement('script');
    script.src = 'assets/js/video-control.js'; // Jalur ke file JS
    script.onload = () => {
      console.log('Video control script loaded');
    };
    document.body.appendChild(script);
  }
}
