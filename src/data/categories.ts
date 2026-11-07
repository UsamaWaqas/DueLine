import { Category } from './types';

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'Streaming', label: 'Streaming' },
  { key: 'Music', label: 'Music' },
  { key: 'Cloud', label: 'Cloud storage' },
  { key: 'Productivity', label: 'Productivity' },
  { key: 'Gaming', label: 'Gaming' },
  { key: 'Fitness', label: 'Fitness' },
  { key: 'News', label: 'News' },
  { key: 'Other', label: 'Other' },
];

export const CATEGORY_COLOR: Record<Category, string> = {
  Streaming: '#E5484D',
  Music: '#1DB954',
  Cloud: '#3758F9',
  Productivity: '#F5A623',
  Gaming: '#9B59F6',
  Fitness: '#12875A',
  News: '#555E6B',
  Other: '#8891A0',
};
