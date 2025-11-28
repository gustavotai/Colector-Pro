
import { Car } from '../types';

export const apiService = {
  baseUrl: 'http://localhost:3001', // Default, can be changed via UI

  setBaseUrl(url: string) {
    // Remove trailing slash if present
    this.baseUrl = url.replace(/\/$/, '');
  },

  async getAllCars(): Promise<Car[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.baseUrl}/api/cars`, { 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error("API Error fetching cars:", error);
      throw error;
    }
  },

  async addCar(car: Car): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/cars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(car),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Failed to save car');
    } catch (error) {
      console.error("API Error adding car:", error);
      throw error;
    }
  },

  async updateCar(car: Car): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/cars/${car.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(car),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Failed to update car');
    } catch (error) {
      console.error("API Error updating car:", error);
      throw error;
    }
  },

  async deleteCar(id: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/cars/${id}`, {
        method: 'DELETE',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Failed to delete car');
    } catch (error) {
      console.error("API Error deleting car:", error);
      throw error;
    }
  },
  
  // No mock data needed for server mode, it should just return empty if new
  async initMockData(): Promise<Car[]> {
    return this.getAllCars();
  }
};
