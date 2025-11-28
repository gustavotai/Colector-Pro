export interface Car {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category: string;
  imageUrl: string; // Main image (thumbnail)
  images?: string[]; // All images including the main one
  dateAdded: number;
}

export enum ViewMode {
  VERTICAL_GRID = 'VERTICAL_GRID',
  HORIZONTAL_SCROLL = 'HORIZONTAL_SCROLL',
}

export enum CarCategory {
  MUSCLE = 'Muscle',
  EXOTIC = 'Exotic',
  RACE = 'Race',
  TRUCK = 'Truck',
  FANTASY = 'Fantasy',
  CLASSIC = 'Classic',
  OTHER = 'Other'
}

export type SortOption = 'name' | 'date';