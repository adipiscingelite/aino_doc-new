import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-coba-sign-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coba-sign-modal.component.html',
  styleUrls: ['./coba-sign-modal.component.css']
})
export class CobaSignModalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sigPad', { static: false }) sigPad!: ElementRef<HTMLCanvasElement>;
  private signaturePad!: SignaturePad;
  img: string | null = null;
  penColor: string = '#262626'; // Default pen color  

  ngAfterViewInit() {
    const canvas = this.sigPad.nativeElement;
    this.signaturePad = new SignaturePad(canvas);

    // Set initial pen color
    this.signaturePad.penColor = this.penColor;

    // Resize canvas to fit container
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
  }

  clear() {
    this.signaturePad.clear();
    this.img = null; // Clear the img property when the canvas is cleared
  }

  save() {
    const dataURL = this.sigPad.nativeElement.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'signature.png';
    link.click();
  }

  
  // save() {
  //   this.img = this.signaturePad.toDataURL('image/png');
  //   console.log(this.img);
  // }

  onColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.penColor = input.value;
    this.signaturePad.penColor = this.penColor;
  }

  private resizeCanvas() {
    const canvas = this.sigPad.nativeElement;
    const container = canvas.parentElement as HTMLElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    this.signaturePad.clear(); // Clear the canvas to fit new size
  }
}
