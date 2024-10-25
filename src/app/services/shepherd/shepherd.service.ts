import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  // Define the index signature here
  private toursCompleted: { [key: string]: boolean } = {
    dashboard: false,
    sidebar: false
  };

  constructor() {}

  isTourCompleted(tourName: string): boolean {
    return this.toursCompleted[tourName] || false; // Provide default value
  }

  setTourCompleted(tourName: string): void {
    this.toursCompleted[tourName] = true;
  }
}
