import { Component, OnInit, Inject } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { TourGuideService } from '../services/shepherd/shepherd.service';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule, NgxEchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
    // private tourGuideService: TourGuideService,
    @Inject('apiUrl') private apiUrl: string
  ) {}

  user: any = {};
  role_code: any;
  // private tour: any;
  recentTimelineHistory: any[] = [];
  olderTimelineHistory: any[] = [];
  // allOlderTimelineHistory: any[] = [];
  olderTimelineOffset: number = 0; // Offset untuk paginasi
  superadminOlderTimelineHistory: any[] = [];
  adminOlderTimelineHistory: any[] = [];
  hasMoreData: boolean = true;

  isLoading: boolean = false;
  noMoreDataMessage: string | null = null;

  //charts
  // chartOptions: EChartsOption = {};
  lineChartOptions: any;
  pieChartOptions: any;
  barChartOptions: any;
  documentCounts: { month: string; count: number }[] = [];
  documentStatusCounts: { status: string; count: number }[] = [];
  documentNameCounts: {
    month: string;
    document_name: string;
    count: number;
  }[] = [];

  // documentNameCounts: any[] = [];

  // user
  dataDALength: any;
  dataITCMLength: any;
  dataBALength: any;
  dataHALength: any;

  dataSignatureITCMLength: any;
  dataSignatureDALength: any;
  dataSignatureBALength: any;
  dataSignatureHALength: any;

  dataListAllFormDA: any[] = [];
  dataListFormITCM: any[] = [];
  dataListAllBA: any[] = [];
  dataListAllHA: any[] = [];

  dataListSignatureITCM: any[] = [];
  dataListSignatureDA: any[] = [];
  dataListSignatureBA: any[] = [];
  dataListSignatureHA: any[] = [];
  p: any;

  ngOnInit(): void {
    this.fetchProfileData();
    // Auto refresh setiap 3 menit
    setInterval(() => {
      if (this.role_code === 'SA' || this.role_code === 'A') {
        this.fetchRecentTimeline();
        this.fetchOlderTimeline();
      }
    }, 180000);
    this.fetchDocumentCounts();
    this.fetchDocumentStatusCounts();
    this.fetchDataFormDA();
    this.fetchDataFormITCM();
    this.fetchAllDataBA();
    this.fetchAllDataHA();

    this.fetchITCMSignature();
    this.fetchDASignature();
    this.fetchBASignature();
    this.fetchHASignature();
  }

  // startTour() {
  //   this.tourGuideService.startTour(); // Mulai tur saat tombol diklik
  // }

  fetchProfileData() {
    const token = this.cookieService.get('userToken');
    console.log('Token:', token);

    axios
      .get(`${this.apiUrl}/auth/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {

        if (response.data && response.data.role_code) {
          this.user = { role: response.data.role_code }; // Gunakan role_code
          this.role_code = response.data.role_code; // Tambahkan ini

          // Cek role sebelum fetch timeline
          if (this.user.role === 'SA' || this.user.role === 'A') {
            this.fetchRecentTimeline();
            this.fetchOlderTimeline();
            this.fetchDocumentCounts();
            this.fetchDocumentStatusCounts();
            this.fetchDocumentNameCounts();
          } else {
            console.warn(
              'Role bukan SA atau A, fetchTimelineHistory tidak dijalankan.'
            );
          }
        } else {
          console.error('Role tidak ditemukan dalam response');
        }
      })
      .catch((error) => {
        console.error('Error fetching profile data:', error);
      });
  }

  fetchRecentTimeline() {
    if (!this.user || !this.user.role) {
      return;
    }

    const endpoint =
      this.user.role === 'SA'
        ? `${environment.apiUrl2}/superadmin/timeline/recent`
        : `${environment.apiUrl2}/admin/timeline/recent`;

    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          this.recentTimelineHistory = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          this.recentTimelineHistory = response.data.data; // Kalau API pakai wrapper object
        } else {
          this.recentTimelineHistory = [];
        }
      })
      .catch((error) => {
        console.error('Error fetching timeline history:', error);
      });
  }

  fetchOlderTimeline() {
    if (!this.user || !this.user.role) {
      return;
    }

    const isSuperAdmin = this.user.role === 'SA';
    const endpoint = isSuperAdmin
      ? `${environment.apiUrl2}/superadmin/timeline/older`
      : `${environment.apiUrl2}/admin/timeline/older`;

    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
        params: {
          limit: 3,
          offset: isSuperAdmin
            ? this.superadminOlderTimelineHistory.length
            : this.adminOlderTimelineHistory.length,
        },
      })
      .then((response) => {
        if (response.data.message === 'no other data') {
          this.hasMoreData = false;
          this.noMoreDataMessage = 'Tidak ada data lagi yang dapat dimuat';
          this.cdr.detectChanges();
          return;
        }

        let newData = [];

        if (Array.isArray(response.data)) {
          newData = response.data;
        } else if (
          response.data?.data?.result &&
          Array.isArray(response.data.data.result)
        ) {
          newData = response.data.data.result;
        }

        if (Array.isArray(newData)) {
          if (isSuperAdmin) {
            this.superadminOlderTimelineHistory = [
              ...this.superadminOlderTimelineHistory,
              ...newData,
            ];
          } else {
            this.adminOlderTimelineHistory = [
              ...this.adminOlderTimelineHistory,
              ...newData,
            ];
          }

          // if (isSuperAdmin) {
          //   this.superadminOlderTimelineHistory.length += 3;
          // } else {
          //   this.adminOlderTimelineHistory.length += 3;
          // }

          if (newData.length < 3) {
            this.hasMoreData = false;
          }
        } else {
          this.hasMoreData = false;
          this.noMoreDataMessage = 'Tidak ada data lagi yang dapat dimuat';
        }

        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching timeline history:', error);
      })
      .finally(() => {
        // Set timeout untuk auto refresh setelah fetch selesai
        setTimeout(() => this.fetchDocumentCounts(), 180000); // 3 menit
      });
  }

  getOlderTimelineHistory(): any[] {
    return this.role_code === 'SA'
      ? this.superadminOlderTimelineHistory
      : this.adminOlderTimelineHistory;
  }

  loadMore() {
    if (this.hasMoreData) {
      this.fetchOlderTimeline();
    }
  }

  refreshTimeline() {
    this.isLoading = true;

    Promise.all([this.fetchRecentTimeline(), this.fetchOlderTimeline()])
      .then(() => {})
      .catch((error) => {
        console.error('Error refreshing timeline:', error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  // loadMore() {
  //   const currentLength = this.olderTimelineHistory.length;
  //   const nextData = this.allOlderTimelineHistory.slice(
  //     currentLength,
  //     currentLength + 3
  //   );
  //   this.olderTimelineHistory = [...this.olderTimelineHistory, ...nextData];
  // }

  fetchDocumentCounts() {
    if (!this.user || !this.user.role) {
      return;
    }

    const endpoint =
      this.user.role === 'SA'
        ? `${environment.apiUrl2}/superadmin/timeline/documents-per-month`
        : `${environment.apiUrl2}/admin/timeline/documents-per-month`;

    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data && Array.isArray(response.data.data)) {
          this.documentCounts = response.data.data;
          this.updateLineChartOptions();
        } else {
          console.warn('Format response tidak sesuai:');
        }
      })
      .catch((error) => {
        console.error('Error fetching document counts:', error);
      })
      .finally(() => {
        // Set timeout untuk auto refresh setelah fetch selesai
        setTimeout(() => this.fetchDocumentCounts(), 180000); // 3 menit
      });
  }

  updateLineChartOptions() {
    if (!this.documentCounts.length) {
      // Tampilkan pesan jika data kosong
      this.lineChartOptions = {
        title: {
          text: 'Form Generation Report',
          subtext: 'No data available',
          left: 'center',
        },
      };
      return;
    }
  
    // Daftar nama bulan
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
  
    // Ambil tahun dari data pertama atau gunakan tahun saat ini
    const year = this.documentCounts.length > 0 
      ? this.documentCounts[0].month.split('-')[0] 
      : new Date().getFullYear().toString();
  
    // Daftar 12 bulan lengkap dengan format YYYY-MM
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, '0'); // Format "01", "02", ..., "12"
      return `${year}-${month}`;
    });
  
    // Buat map dari data API
    const dataMap = new Map(
      this.documentCounts.map((item) => [item.month, item.count])
    );
  
    // Isi data yang kosong dengan 0
    const completeData = allMonths.map((month) => ({
      month,
      count: dataMap.get(month) || 0,
    }));
  
    // Hitung total dokumen
    const totalDocuments = completeData.reduce(
      (sum, item) => sum + item.count,
      0
    );
  
    // Hitung maxCount dengan default minimal 10
    const maxCount = Math.max(...completeData.map((item) => item.count), 10);
  
    // Buffer 20% untuk maxY
    const maxY = Math.ceil(maxCount * 1.2);
  
    // Format bulan dari YYYY-MM ke nama bulan
    const formattedMonths = completeData.map((item) => {
      const monthNumber = parseInt(item.month.split('-')[1], 10); // Ambil bagian bulan (1-12)
      return monthNames[monthNumber - 1]; // Konversi ke nama bulan
    });
  
    this.lineChartOptions = {
      title: {
        text: 'Form Generation Report',
        subtext: `Total: ${totalDocuments} Forms`,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: formattedMonths, // Gunakan nama bulan yang sudah diformat
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: maxY, // Gunakan maxY yang sudah dihitung
        interval: Math.ceil(maxY / 5),
      },
      series: [
        {
          name: 'Number of Forms :',
          type: 'line',
          data: completeData.map((item) => item.count),
          itemStyle: { color: '#007bff' },
        },
      ],
    };
  }

  fetchDocumentStatusCounts() {
    // Validasi user dan role
    if (!this.user || !this.user.role) {
      console.warn('User tidak ditemukan atau tidak memiliki role.');
      return;
    }

    // Tentukan endpoint berdasarkan role
    const endpoint =
      this.user.role === 'SA'
        ? `${environment.apiUrl2}/superadmin/timeline/documents-status`
        : `${environment.apiUrl2}/admin/timeline/documents-status`;

    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (!response.data || !Array.isArray(response.data.data)) {
          console.warn(
            'Format response tidak sesuai atau data kosong:',
            response.data
          );
          this.documentStatusCounts = []; // Reset agar chart tidak error
          return;
        }

        this.documentStatusCounts = response.data.data;
        this.updatePieChartOptions();
      })
      .catch((error) => {
        console.error('Error fetching document status counts:', error);
      })
      .finally(() => {
        // Set timeout untuk auto refresh setelah fetch selesai
        setTimeout(() => this.fetchDocumentStatusCounts(), 180000); // 3 menit
      });
  }

  updatePieChartOptions() {
    if (!this.documentStatusCounts.length)
       {
      this.pieChartOptions = {
        title: {
          text: 'Monthly Form Status Overview',
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
        },
        series: [
          {
            name: 'Form Status',
            type: 'pie',
            radius: '50%',
            data: [
              {
                name: 'No Data',
                value: 1, // Dummy value agar tetap terlihat
                itemStyle: {
                  color: '#E0E0E0', // Warna abu-abu untuk menunjukkan tidak ada data
                },
              },
            ],
            label: {
              show: true,
              position: 'center',
              formatter: 'No Data',
              fontSize: 14,
              color: '#666',
            },
            emphasis: {
              label: {
                show: false, // Jangan tampilkan highlight
              },
            },
          },
        ],
      };
      return;
    }

    // Jika ada data, tampilkan pie chart normal
    this.pieChartOptions = {
      title: {
        text: 'Monthly Form Status Overview',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          name: 'Form Status',
          type: 'pie',
          radius: '50%',
          data: this.documentStatusCounts.map((item) => ({
            name: item.status,
            value: item.count,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }

  fetchDocumentNameCounts() {
    // Validasi user dan role
    if (!this.user || !this.user.role) {
      console.warn('User tidak ditemukan atau tidak memiliki role.');
      return;
    }

    // Tentukan endpoint berdasarkan role
    const endpoint =
      this.user.role === 'SA'
        ? `${environment.apiUrl2}/superadmin/timeline/forms/count-per-document`
        : `${environment.apiUrl2}/admin/timeline/forms/count-per-document`;

    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (!response.data || !Array.isArray(response.data.data)) {
          console.warn(
            'Format response tidak sesuai atau data kosong:',
            response.data
          );
          this.documentNameCounts = []; // Reset agar chart tidak error
          return;
        }

        this.documentNameCounts = response.data.data;
        this.updateBarChartOptions();
      })
      .catch((error) => {
        console.error('Error fetching document status counts:', error);
      })
      .finally(() => {
        // Set timeout untuk auto refresh setelah fetch selesai
        setTimeout(() => this.fetchDocumentNameCounts(), 180000); // 3 menit
      });
  }

  updateBarChartOptions() {
    if (!this.documentNameCounts.length) {
      this.barChartOptions = {
        title: {
          text: 'Monthly Form Statistics',
          left: 'center',
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: 'No Data',
            fontSize: 16,
            fill: '#666',
          },
        },
      };
      return;
    }

    // Ambil bulan dari data pertama (default "N/A" jika kosong)
    const monthNumber = this.documentNameCounts[0]?.month || 'N/A';

    // Format bulan dari angka menjadi nama bulan
    const monthNames: { [key: string]: string } = {
      '1': 'Januari',
      '2': 'Februari',
      '3': 'Maret',
      '4': 'April',
      '5': 'Mei',
      '6': 'Juni',
      '7': 'Juli',
      '8': 'Agustus',
      '9': 'September',
      '10': 'Oktober',
      '11': 'November',
      '12': 'Desember',
    };

    const formattedMonth = monthNames[monthNumber] || 'Bulan Tidak Diketahui';

    // Daftar nama dokumen yang harus selalu ada di chart
    const allDocuments: { [key: string]: string } = {
      'IT Change Management': 'ITCM',
      'Berita Acara IT Change Management': 'BA ITCM',
      'Dampak Analisa': 'DA',
      'Hak Akses': 'HA',
    };

    // Mapping data API ke format yang diinginkan
    const documentMap = new Map<string, number>();

    // Inisialisasi semua kategori dengan count = 0
    Object.values(allDocuments).forEach((abbr) => documentMap.set(abbr, 0));

    // Isi data yang ada dari API
    this.documentNameCounts.forEach((item) => {
      const abbr = allDocuments[item.document_name] || item.document_name;
      documentMap.set(abbr, item.count);
    });

    // Total
    const totalDocuments = Array.from(documentMap.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    // Ubah ke array untuk chart
    const categories = Array.from(documentMap.keys());
    const counts = Array.from(documentMap.values());

    // Hitung maxCount dengan minimal 5 agar tetap ada skala yang bagus
    const maxCount = Math.max(...counts, 5);

    // Buffer 20% untuk maxY
    const maxY = Math.ceil(maxCount * 1.2);

    this.barChartOptions = {
      title: {
        text: `Monthly Form Statistics`, // Pakai nama bulan yang sudah diformat
        subtext: `Month: ${formattedMonth} | Total: ${totalDocuments} Documents`,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: 25,
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: maxY, // Gunakan maxY yang sudah dihitung
        interval: Math.ceil(maxY / 5),
      },
      series: [
        {
          name: 'Number of Forms :',
          type: 'bar',
          data: counts,
          itemStyle: {
            color: '#007bff',
          },
        },
      ],
    };
  }

  fetchDataFormDA(): void {
    axios
      .get(`${environment.apiUrl2}/api/my/form/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListAllFormDA = response.data;
          this.dataDALength = this.dataListAllFormDA.length;
        } else {
          this.dataDALength = 0;
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 500) {
            console.error(error.response.data.message);
          }
        } else {
          console.error(error);
        }
      });
  }

  fetchDataFormITCM(): void {
    axios
      .get(`${environment.apiUrl2}/api/my/form/itcm`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListFormITCM = response.data;
          this.dataITCMLength = this.dataListFormITCM.length;
        } else {
          this.dataITCMLength = 0;
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 500) {
            console.error(error.response.data.message);
          } else if (error.response.status === 404) {
            console.error(error.response.data.message);
          }
        } else {
          console.error(error);
        }
      });
  }

  fetchAllDataBA(): void {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ba`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListAllBA = response.data;

          this.dataBALength = this.dataListAllBA.length;
        } else {
          this.dataBALength = 0;
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 500) {
            console.error(error.response.data.message);
          }
        } else {
          console.error(error);
        }
      });
  }

  fetchAllDataHA(): void {
    axios
      .get(`${environment.apiUrl2}/api/my/form/ha`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListAllHA = response.data;

          this.dataHALength = this.dataListAllHA.length;
        } else {
          this.dataHALength = 0;
        }
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 500) {
            console.error(error.response.data.message);
          }
        } else {
          console.error(error);
        }
      });
  }

  fetchITCMSignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/itcm`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListSignatureITCM = response.data.filter(
            (item: any) => item.form_status === 'Published'
          );
          this.dataSignatureITCMLength = this.dataListSignatureITCM.length;
        } else {
          this.dataSignatureITCMLength = 0;
        }
      })
      .catch((error) => {
        console.error(error);
        this.dataSignatureITCMLength = 0;
      });
  }

  fetchDASignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/da`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListSignatureDA = response.data.filter(
            (item: any) => item.form_status === 'Published'
          );
          this.dataSignatureDALength = this.dataListSignatureDA.length;
        } else {
          this.dataSignatureDALength = 0;
        }
      })
      .catch((error) => {
        console.error(error);
        this.dataSignatureDALength = 0;
      });
  }

  fetchBASignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/ba`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListSignatureBA = response.data.filter(
            (item: any) => item.form_status === 'Published'
          );
          this.dataSignatureBALength = this.dataListSignatureBA.length;
        } else {
          this.dataSignatureBALength = 0;
        }
      })
      .catch((error) => {
        console.error(error);
        this.dataSignatureBALength = 0;
      });
  }

  fetchHASignature() {
    axios
      .get(`${environment.apiUrl2}/api/my/signature/ha`, {
        headers: {
          Authorization: `Bearer ${this.cookieService.get('userToken')}`,
        },
      })
      .then((response) => {
        if (response.data) {
          this.dataListSignatureHA = response.data.filter(
            (item: any) => item.form_status === 'Published'
          );
          this.dataSignatureHALength = this.dataListSignatureHA.length;
        } else {
          this.dataSignatureHALength = 0;
        }
      })
      .catch((error) => {
        console.error(error);
        this.dataSignatureHALength = 0;
      });
  }
}