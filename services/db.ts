
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Car, CarCategory } from '../types';

interface DirceuDB extends DBSchema {
  cars: {
    key: string;
    value: Car;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'dirceu-db';
const STORE_NAME = 'cars';

// Initialize the database
const dbPromise = openDB<DirceuDB>(DB_NAME, 1, {
  upgrade(db) {
    const store = db.createObjectStore(STORE_NAME, {
      keyPath: 'id',
    });
    store.createIndex('by-date', 'dateAdded');
  },
});

// Mock data to insert if DB is empty
const INITIAL_CARS: Car[] = [
  {
    id: '1',
    name: 'Twin Mill',
    brand: 'Hot Wheels',
    model: 'Twin Mill III',
    category: CarCategory.FANTASY,
    imageUrl: 'https://picsum.photos/400/300?random=1',
    images: ['https://picsum.photos/400/300?random=1'],
    dateAdded: Date.now() - 10000000
  },
  {
    id: '2',
    name: 'Mustang GT',
    brand: 'Ford',
    model: 'Mustang GT',
    category: CarCategory.MUSCLE,
    imageUrl: 'https://picsum.photos/400/300?random=2',
    images: ['https://picsum.photos/400/300?random=2'],
    dateAdded: Date.now() - 5000000
  }
];

export const carService = {
  async getAllCars(): Promise<Car[]> {
    const db = await dbPromise;
    const cars = await db.getAllFromIndex(STORE_NAME, 'by-date');
    // Return in descending order (newest first)
    return cars.reverse();
  },

  async addCar(car: Car): Promise<void> {
    const db = await dbPromise;
    await db.put(STORE_NAME, car);
  },

  // In IndexedDB, put acts as insert or update if key exists
  async updateCar(car: Car): Promise<void> {
    const db = await dbPromise;
    await db.put(STORE_NAME, car);
  },

  async deleteCar(id: string): Promise<void> {
    const db = await dbPromise;
    await db.delete(STORE_NAME, id);
  },

  async initMockData(): Promise<Car[]> {
    const db = await dbPromise;
    const count = await db.count(STORE_NAME);
    
    if (count === 0) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      await Promise.all(INITIAL_CARS.map(car => tx.store.add(car)));
      await tx.done;
      return INITIAL_CARS;
    }
    return this.getAllCars();
  }
};