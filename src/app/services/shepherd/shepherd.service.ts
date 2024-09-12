import { Injectable } from '@angular/core';
import Shepherd from 'shepherd.js';

@Injectable({
  providedIn: 'root'
})
export class ShepherdService {
  private tours: { [key: string]: any } = {}; // Use 'any' as a workaround
  private tourQueue: { name: string; redirectUrl?: string }[] = [];
  private isTourRunning = false;

  constructor() {}

  createTour(name: string) {
    this.tours[name] = new (Shepherd as any).Tour({
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shadow-md bg-purple-dark',
        scrollTo: { behavior: 'smooth', block: 'center' }
      },
      useModalOverlay: true
    });
  }

  addStep(name: string, stepOptions: any) { // Use 'any' for stepOptions
    if (this.tours[name]) {
      this.tours[name].addStep(stepOptions);
    }
  }

  startTour(name: string, redirectUrl?: string) {
    // Check if the tour has already been shown
    if (!localStorage.getItem(`${name}-shown`)) {
      if (this.tours[name]) {
        this.tourQueue.push({ name, redirectUrl });
        if (!this.isTourRunning) {
          this.isTourRunning = true;
          this.runNextTour();
        }
      }
    } else if (redirectUrl) {
      // Redirect immediately if tour is already shown
      window.location.href = redirectUrl;
    }
  }

  private runNextTour() {
    if (this.tourQueue.length > 0) {
      const { name, redirectUrl } = this.tourQueue.shift()!;
      if (this.tours[name]) {
        this.tours[name].start().then(() => {
          // Mark the tour as shown
          localStorage.setItem(`${name}-shown`, 'yes');
          this.isTourRunning = false;
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            this.runNextTour();
          }
        }).catch((error: any) => {
          console.error('Error starting tour:', error);
        });
      }
    } else {
      this.isTourRunning = false;
    }
  }

  completeTour(name: string) {
    if (this.tours[name]) {
      this.tours[name].complete();
    }
  }

  cancelTour(name: string) {
    if (this.tours[name]) {
      this.tours[name].cancel();
    }
  }
}
