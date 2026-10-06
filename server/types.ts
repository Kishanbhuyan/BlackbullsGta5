export type UserRole = 'fan' | 'streamer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  streamerId?: string; // Links to streamer profile if role === 'streamer'
  avatar?: string;
  kickUsername?: string;
  createdAt: string;
}

export interface Streamer {
  id: string;
  name: string; // e.g. "MOTA BHAI"
  inGameCharacter: string; // e.g. "Krish Malik" or "Kancha Bhau"
  realName: string; // e.g. "Krish Malik" or "Ansh Mehta"
  bio: string;
  youtubeUrl: string;
  youtubeHandle: string; // e.g. "@MOTABHAI"
  youtubeChannelId?: string;
  kickUrl: string;
  kickUsername: string; // e.g. "motabhai"
  instagramUrl: string;
  photo: string;
  coverImage?: string;
  isActive: boolean;
  order: number;
}

export interface LiveStatus {
  streamerId: string;
  streamerName: string;
  inGameCharacter: string;
  platform: 'youtube' | 'kick';
  isLive: boolean;
  title: string;
  viewerCount: number;
  thumbnailUrl: string;
  streamUrl: string;
  embedUrl: string;
  startedAt?: string;
  gameName: string; // "Grand Theft Auto V"
  lastOfflineVideo?: {
    title: string;
    embedUrl: string;
    thumbnailUrl: string;
    publishedAt: string;
  };
}

export interface VideoClip {
  id: string;
  streamerId: string;
  streamerName: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  embedUrl: string;
  platform: 'youtube' | 'kick';
  type: 'stream' | 'clip' | 'highlight';
  duration?: string;
  views?: string;
  publishedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Hoodies' | 'T-Shirts' | 'Caps' | 'Mugs' | 'Accessories';
  images: string[];
  sizes: string[];
  inStock: boolean;
  stockQuantity: number;
  featured?: boolean;
  rating?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  size?: string;
  quantity: number;
  image: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export type CommentStatus = 'approved' | 'pending' | 'rejected';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  streamerId: string;
  streamerName: string;
  content: string;
  status: CommentStatus;
  isFavorite: boolean;
  createdAt: string;
}

export interface StoryChapter {
  id: string;
  title: string;
  summary: string;
  content: string;
  image?: string;
}

export interface GangStory {
  id: string;
  title: string;
  tagline: string;
  leadParagraph: string;
  fullLore: string;
  heroImage: string;
  chapters: StoryChapter[];
  lastUpdated: string;
}

export interface LiveChatMessage {
  id: string;
  streamerId: string;
  userId?: string;
  username: string;
  role: 'fan' | 'streamer' | 'admin' | 'guest';
  message: string;
  avatar?: string;
  color?: string;
  kickUsername?: string;
  createdAt: string;
}

