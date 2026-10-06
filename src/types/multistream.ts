export interface StreamSlot {
  id: string;
  username: string;
  isMuted: boolean;
  isFocused: boolean;
  quality?: string;
  addedAt: number;
}

export type GridLayout = 
  | 'auto' 
  | 'grid-2' 
  | 'grid-3' 
  | 'grid-4' 
  | 'focus-1' 
  | 'vertical' 
  | 'horizontal';

export interface EmoteItem {
  id: string;
  name: string;
  url: string;
  category: 'popular' | 'reactions' | 'pepe' | 'classic';
}

export interface StreamPreset {
  id: string;
  name: string;
  description: string;
  streams: string[];
  badge?: string;
}
