import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  form_ticket: string | undefined;
  form_status: string | undefined;
  form_number: string | undefined;
  document_name: string | undefined;
  project_name: string | undefined;
  approval_status: string | undefined;
  reason: string | undefined;
  nama_analis: string | undefined;
  jabatan: string | undefined;
  departemen: string | undefined;
  jenis_perubahan: string | undefined;
  detail_dampak_perubahan: string | undefined;
  rencana_pengembangan_perubahan: string | undefined;
  rencana_pengujian_perubahan_sistem: string | undefined;
  rencana_rilis_perubahan_dan_implementasi: string | undefined;

  constructor() {}

  async downloadData(form_uuid: string) {
    console.log('downloadData called with', form_uuid);
    try {
      const response = await axios.get(`${environment.apiUrl2}/da/${form_uuid}`);
      const formData = response.data.form;

      if (formData) {
        this.form_ticket = formData.form_ticket;
        this.form_status = formData.form_status;
        this.form_number = formData.form_number;
        this.document_name = formData.document_name;
        this.project_name = formData.project_name;
        this.approval_status = formData.approval_status;
        this.reason = formData.reason?.String || '';
        this.nama_analis = formData.nama_analis;
        this.jabatan = formData.jabatan;
        this.departemen = formData.departemen;
        this.jenis_perubahan = formData.jenis_perubahan;
        this.detail_dampak_perubahan = formData.detail_dampak_perubahan;
        this.rencana_pengembangan_perubahan = formData.rencana_pengembangan_perubahan;
        this.rencana_pengujian_perubahan_sistem = formData.rencana_pengujian_perubahan_sistem;
        this.rencana_rilis_perubahan_dan_implementasi = formData.rencana_rilis_perubahan_dan_implementasi;

        // Panggil fungsi untuk menghasilkan PDF
        await this.downloadPdfAction();
      } else {
        console.error('Form data is not present in the response');
      }
    } catch (error) {
      console.error('Error fetching document data:', error);
    }
  }

  async downloadPdfAction() {
    if (this.form_ticket) {
      try {
        await this.generatePdf({
          form_ticket: this.form_ticket,
          form_status: this.form_status,
          form_number: this.form_number,
          document_name: this.document_name,
          project_name: this.project_name,
          approval_status: this.approval_status,
          reason: this.reason,
          nama_analis: this.nama_analis,
          jabatan: this.jabatan,
          departemen: this.departemen,
          jenis_perubahan: this.jenis_perubahan,
          detail_dampak_perubahan: this.detail_dampak_perubahan,
          rencana_pengembangan_perubahan: this.rencana_pengembangan_perubahan,
          rencana_pengujian_perubahan_sistem: this.rencana_pengujian_perubahan_sistem,
          rencana_rilis_perubahan_dan_implementasi: this.rencana_rilis_perubahan_dan_implementasi
        });
        console.log('PDF generation completed');
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    } else {
      console.error('Data is not ready for PDF generation');
    }
  }

  public async generatePdf(data: any) {
    const doc = new jsPDF();
    const margin = 8; // Margin
    const headerHeight = 40; // Header height
    const footerHeight = 20; // Footer height
    const logoUrl = 'assets/images/aino.png';
    const signUrl = 'assets/images/zani.png';
    const logoWidth = 25; // Logo width
    const logoHeight = 15; // Logo height
    const fontSizeHeader = 12; // Font size for header
    const fontSizeContent = 10; // Font size for content
    const fontSizeSubTitle = 11; // Font size for sub-title
  
    // Load images
    const [logoImage, signImage] = await Promise.all([
      this.loadImage(logoUrl),
      this.loadImage(signUrl)
    ]);
  
    // Function to add a header
    const addHeader = () => {
      doc.addImage(logoImage, 'PNG', margin, margin, logoWidth, logoHeight);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fontSizeHeader); // Smaller font size for header
      const title = 'Document Title';
      const docNumber = `Document No: ${data.form_number}`;
      const titleWidth = doc.getTextWidth(title);
      const docNumberWidth = doc.getTextWidth(docNumber);
  
      // Center title
      doc.text(title, (doc.internal.pageSize.getWidth() - titleWidth) / 2, margin + logoHeight + 5);
  
      // Right-aligned document number
      doc.text(docNumber, doc.internal.pageSize.getWidth() - margin - docNumberWidth, margin + 5);
  
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, headerHeight, doc.internal.pageSize.getWidth() - margin, headerHeight);
    };
  
    // Function to add footer with signature
    const addFooter = () => {
      const signWidth = 50; // Sign width
      const signHeight = 25; // Sign height
      const pageWidth = doc.internal.pageSize.getWidth();
      const signX = pageWidth - signWidth - margin;
      const signY = doc.internal.pageSize.getHeight() - footerHeight - signHeight - margin;
  
      doc.addImage(signImage, 'PNG', signX, signY, signWidth, signHeight);
    };
  
    // Function to add content to the PDF
    const addContent = (title: string, content: string, isSubTitle: boolean = false) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const titleFontSize = isSubTitle ? fontSizeSubTitle : fontSizeContent;
      const contentFontSize = fontSizeContent;
  
      // Adjust font size for title
      doc.setFont('helvetica', isSubTitle ? 'bold' : 'normal');
      doc.setFontSize(titleFontSize);
      doc.text(title, margin, contentMarginTop);
  
      contentMarginTop += 4; // Space after title
  
      // Adjust font size for content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(contentFontSize);
      const contentLines = doc.splitTextToSize(content, pageWidth - 2 * margin);
      const contentHeight = contentLines.length * sectionHeight;
  
      // Add a new page if the content exceeds the page height
      if (contentMarginTop + contentHeight > pageHeight - footerHeight - margin) {
        doc.addPage();
        addHeader(); // Add header to the new page
        contentMarginTop = headerHeight + 10;
      }
  
      contentLines.forEach((line: any, index: any) => {
        doc.text(line, margin, contentMarginTop + (index * sectionHeight));
      });
  
      contentMarginTop += contentHeight + 10; // Space after content
    };
  
    // Initial Header
    addHeader();
  
    let contentMarginTop = headerHeight + 10;
    const sectionHeight = 8; // Height between lines
  
    // Add Body Content
    addContent('Project Name', data.project_name);
    addContent('Analyst Name', data.nama_analis);
    addContent('Position', data.jabatan);
    addContent('Department', data.departemen);
    addContent('Type of Change', data.jenis_perubahan, true);
    addContent('Details', data.detail_dampak_perubahan);
    addContent('Development Plan', data.rencana_pengembangan_perubahan);
    addContent('Testing Plan', data.rencana_pengujian_perubahan_sistem);
    addContent('Release Plan', data.rencana_rilis_perubahan_dan_implementasi);
  
    // Add Footer to the last page
    addFooter();
  
    // Finalize PDF
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl);
    URL.revokeObjectURL(pdfUrl);
  }
  
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  }
  
}
