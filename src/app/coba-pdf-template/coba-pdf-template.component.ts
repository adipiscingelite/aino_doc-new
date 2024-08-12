import { Component, OnInit } from '@angular/core';
import { PdfGenerationService } from '../services/pdf-generation.service';

@Component({
  selector: 'app-coba-pdf-template',
  templateUrl: './coba-pdf-template.component.html',
  styleUrls: ['./coba-pdf-template.component.css'] // Fixed to 'styleUrls' (not 'styleUrl')
})
export class CobaPdfTemplate implements OnInit {
  documentData: any;

  constructor(private pdfService: PdfGenerationService) { }

  ngOnInit(): void {
    // Fetch document data from API or service
    this.documentData = {
      ticketNumber: '3',
      status: 'Draft',
      documentNumber: '0013/PED/F/VII/2024',
      documentName: 'Dampak Analisa',
      date: '2024-07-10',
      signature: 'assets/images/qr.jpg' // Replace with actual signature path
    };
  }

  downloadPdf() {
    this.pdfService.generatePdf(this.documentData);
    console.log('p');
    
  }
}
