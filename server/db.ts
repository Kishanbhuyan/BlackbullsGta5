import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Streamer, Product, GangStory, Comment, Order, LiveChatMessage } from './types.js';
import { getInitialSeedData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  streamers: Streamer[];
  products: Product[];
  story: GangStory;
  comments: Comment[];
  orders: Order[];
  liveMessages?: LiveChatMessage[];
  mockLiveStates?: Record<string, { youtubeLive: boolean; kickLive: boolean }>;
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadOrSeed();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadOrSeed(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.users && parsed.streamers && parsed.products && parsed.story) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading db.json, re-seeding:', err);
    }

    const initial = getInitialSeedData();
    const seededData: DatabaseSchema = {
      ...initial,
      mockLiveStates: {
        streamer_motabhai: { youtubeLive: true, kickLive: false },
        streamer_thunderbolt: { youtubeLive: false, kickLive: true },
      }
    };
    this.saveData(seededData);
    return seededData;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save to db.json:', err);
    }
  }

  // --- Users ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveData();
    return this.data.users[idx];
  }

  // --- Streamers ---
  getStreamers(): Streamer[] {
    return [...this.data.streamers].sort((a, b) => a.order - b.order);
  }

  getStreamerById(id: string): Streamer | undefined {
    return this.data.streamers.find(s => s.id === id);
  }

  createStreamer(streamer: Streamer): Streamer {
    this.data.streamers.push(streamer);
    this.saveData();
    return streamer;
  }

  updateStreamer(id: string, updates: Partial<Streamer>): Streamer | null {
    const idx = this.data.streamers.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.streamers[idx] = { ...this.data.streamers[idx], ...updates };
    this.saveData();
    return this.data.streamers[idx];
  }

  deleteStreamer(id: string): boolean {
    const initialLen = this.data.streamers.length;
    this.data.streamers = this.data.streamers.filter(s => s.id !== id);
    if (this.data.streamers.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Products ---
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  createProduct(product: Product): Product {
    this.data.products.push(product);
    this.saveData();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.saveData();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Orders ---
  getOrders(): Order[] {
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrdersByUserId(userId: string): Order[] {
    return this.data.orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  createOrder(order: Order): Order {
    this.data.orders.push(order);
    this.saveData();
    return order;
  }

  updateOrderStatus(id: string, status: Order['status']): Order | null {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.orders[idx].status = status;
    this.saveData();
    return this.data.orders[idx];
  }

  // --- Comments ---
  getApprovedComments(): Comment[] {
    return this.data.comments
      .filter(c => c.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getCommentsByStreamer(streamerId: string): Comment[] {
    return this.data.comments
      .filter(c => c.streamerId === streamerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllComments(): Comment[] {
    return [...this.data.comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createComment(comment: Comment): Comment {
    this.data.comments.push(comment);
    this.saveData();
    return comment;
  }

  updateCommentStatus(id: string, status: Comment['status']): Comment | null {
    const idx = this.data.comments.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.comments[idx].status = status;
    this.saveData();
    return this.data.comments[idx];
  }

  toggleFavoriteComment(id: string): Comment | null {
    const idx = this.data.comments.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.comments[idx].isFavorite = !this.data.comments[idx].isFavorite;
    this.saveData();
    return this.data.comments[idx];
  }

  deleteComment(id: string): boolean {
    const initialLen = this.data.comments.length;
    this.data.comments = this.data.comments.filter(c => c.id !== id);
    if (this.data.comments.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Story ---
  getStory(): GangStory {
    return this.data.story;
  }

  updateStory(storyUpdates: Partial<GangStory>): GangStory {
    this.data.story = {
      ...this.data.story,
      ...storyUpdates,
      lastUpdated: new Date().toISOString()
    };
    this.saveData();
    return this.data.story;
  }

  // --- Live Chat Messages (Real-Time Gang Chat) ---
  getLiveMessages(streamerId?: string, limit: number = 60): LiveChatMessage[] {
    if (!this.data.liveMessages) {
      this.data.liveMessages = [];
    }
    let list = this.data.liveMessages;
    if (streamerId && streamerId !== 'all') {
      list = list.filter(m => m.streamerId === streamerId || m.streamerId === 'all');
    }
    // Return latest `limit` messages
    return list.slice(-limit);
  }

  addLiveMessage(msg: LiveChatMessage): LiveChatMessage {
    if (!this.data.liveMessages) {
      this.data.liveMessages = [];
    }
    this.data.liveMessages.push(msg);
    // Keep max 250 messages in history
    if (this.data.liveMessages.length > 250) {
      this.data.liveMessages = this.data.liveMessages.slice(-250);
    }
    this.saveData();
    return msg;
  }

  deleteLiveMessage(id: string): boolean {
    if (!this.data.liveMessages) return false;
    const initialLen = this.data.liveMessages.length;
    this.data.liveMessages = this.data.liveMessages.filter(m => m.id !== id);
    if (this.data.liveMessages.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Live Status Mock & Overrides ---
  getMockLiveStates() {
    return this.data.mockLiveStates || {};
  }

  setMockLiveState(streamerId: string, platform: 'youtube' | 'kick', isLive: boolean) {
    if (!this.data.mockLiveStates) {
      this.data.mockLiveStates = {};
    }
    if (!this.data.mockLiveStates[streamerId]) {
      this.data.mockLiveStates[streamerId] = { youtubeLive: false, kickLive: false };
    }
    if (platform === 'youtube') {
      this.data.mockLiveStates[streamerId].youtubeLive = isLive;
    } else {
      this.data.mockLiveStates[streamerId].kickLive = isLive;
    }
    this.saveData();
    return this.data.mockLiveStates[streamerId];
  }
}

export const db = new Database();
