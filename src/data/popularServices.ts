import { Category } from './types';

export type PopularService = {
  name: string;
  initials: string;
  color: string;
  category: Category;
  price?: number;
};

export const POPULAR_SERVICES: PopularService[] = [
  { name: 'Netflix', initials: 'NF', color: '#E5484D', category: 'Streaming', price: 15.49 },
  { name: 'Spotify', initials: 'SP', color: '#1DB954', category: 'Music', price: 11.99 },
  { name: 'Disney+', initials: 'D+', color: '#1159A9', category: 'Streaming', price: 13.99 },
  { name: 'YouTube Premium', initials: 'YT', color: '#E5484D', category: 'Streaming', price: 13.99 },
  { name: 'iCloud+', initials: 'iC', color: '#555E6B', category: 'Cloud', price: 2.99 },
  { name: 'Google One', initials: 'G1', color: '#3758F9', category: 'Cloud', price: 2.99 },
  { name: 'Notion', initials: 'NO', color: '#1C2230', category: 'Productivity', price: 8.0 },
  { name: 'Adobe CC', initials: 'Ai', color: '#E5484D', category: 'Productivity', price: 54.99 },
  { name: 'PlayStation Plus', initials: 'PS', color: '#1159A9', category: 'Gaming', price: 9.99 },
  { name: 'Xbox Game Pass', initials: 'XB', color: '#12875A', category: 'Gaming', price: 16.99 },
  { name: 'Apple Fitness+', initials: 'AF', color: '#F5A623', category: 'Fitness', price: 9.99 },
  { name: 'Amazon Prime', initials: 'AP', color: '#F5A623', category: 'Streaming', price: 14.99 },
];
