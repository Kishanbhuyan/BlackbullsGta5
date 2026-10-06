import bcrypt from 'bcryptjs';
import { User, Streamer, Product, GangStory, Comment, Order } from './types.js';

export function getInitialSeedData() {
  const salt = bcrypt.genSaltSync(10);

  const users: User[] = [
    {
      id: 'usr_admin_01',
      name: 'Black Bulls High Command',
      email: 'admin@blackbulls.rp',
      passwordHash: bcrypt.hashSync('adminpassword123', salt),
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=HighCommand&backgroundColor=b91c1c',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr_mota_01',
      name: 'Krish Malik (Mota Bhai)',
      email: 'motabhai@blackbulls.rp',
      passwordHash: bcrypt.hashSync('motapassword123', salt),
      role: 'streamer',
      streamerId: 'streamer_motabhai',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MotaBhai&skinColor=9e5622',
      createdAt: '2026-01-05T00:00:00Z',
    },
    {
      id: 'usr_kancha_01',
      name: 'Ansh Mehta (Kancha Bhau)',
      email: 'kancha@blackbulls.rp',
      passwordHash: bcrypt.hashSync('kanchapassword123', salt),
      role: 'streamer',
      streamerId: 'streamer_thunderbolt',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KanchaBhau&skinColor=ecad80',
      createdAt: '2026-01-05T00:00:00Z',
    },
    {
      id: 'usr_fan_01',
      name: 'Aryan V. (BB Soldier)',
      email: 'fan@blackbulls.rp',
      passwordHash: bcrypt.hashSync('fanpassword123', salt),
      role: 'fan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AryanBB',
      createdAt: '2026-01-15T00:00:00Z',
    }
  ];

  const streamers: Streamer[] = [
    {
      id: 'streamer_motabhai',
      name: 'MOTA BHAI',
      inGameCharacter: 'Mota Bhai',
      realName: 'Krish Malik',
      bio: 'Leader and strategic mastermind of the Black Bulls. Dominating Los Santos with unyielding authority, high-stakes heists, and tactical roleplay.',
      youtubeUrl: 'https://www.youtube.com/@MOTABHAI',
      youtubeHandle: '@MOTABHAI',
      youtubeChannelId: 'UCLj5qobeZNwLyPa43t1FxOg',
      kickUrl: 'https://kick.com/motabhai',
      kickUsername: 'motabhai',
      instagramUrl: 'https://www.instagram.com/ig_krishmalik/',
      photo: '/src/assets/images/motabhai_dp_1790605203522.jpg',
      isActive: true,
      order: 1,
    },
    {
      id: 'streamer_thunderbolt',
      name: 'Thunderbolt Gaming',
      inGameCharacter: 'Kancha Bhau',
      realName: 'Ansh Mehta',
      bio: 'The muscle, the getaway specialist, and the wild card of the Black Bulls. Fearless driver, master shooter, and beloved chaos-maker in Los Santos RP.',
      youtubeUrl: 'https://www.youtube.com/@thunderboltgaming125',
      youtubeHandle: '@thunderboltgaming125',
      youtubeChannelId: 'UCPqNUzwsZc-8vv0e10FBz9w',
      kickUrl: 'https://kick.com/thunderboltgaming',
      kickUsername: 'thunderboltgaming',
      instagramUrl: 'https://www.instagram.com/thunderboltgaming/',
      photo: '/src/assets/images/thunderbolt_dp_1790605192456.jpg',
      isActive: true,
      order: 2,
    }
  ];

  const products: Product[] = [
    {
      id: 'prod_hoodie_01',
      name: 'Black Bulls "Crimson Horns" Heavyweight Hoodie',
      description: 'Custom 450 GSM organic French terry cotton hoodie featuring screen-printed Black Bulls emblem on the front chest and oversized embroidered bull insignia on the back. Dropped shoulders, reinforced kangaroo pocket, double-layered hood.',
      price: 64.99,
      category: 'Hoodies',
      images: [
        '/src/assets/images/merch_hoodie_black_bulls_1790601418612.jpg'
      ],
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      inStock: true,
      stockQuantity: 42,
      featured: true,
      rating: 4.9,
    },
    {
      id: 'prod_tee_01',
      name: 'Los Santos Underground "Mota x Kancha" Tee',
      description: 'Vintage washed black 260 GSM boxy cut tee celebrating the legendary founding of the Black Bulls gang. Soft vintage distress finish with crack-resistant graphic prints.',
      price: 34.99,
      category: 'T-Shirts',
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'
      ],
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      inStock: true,
      stockQuantity: 85,
      featured: true,
      rating: 4.8,
    },
    {
      id: 'prod_cap_01',
      name: 'Black Bulls Tactical Syndicate Snapback',
      description: 'Structured 6-panel wool-blend crown with blood red high-density 3D embroidered skull horns and matte black eyelets. Adjustable snap closure for all head sizes.',
      price: 29.99,
      category: 'Caps',
      images: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80'
      ],
      sizes: ['One Size Fits All'],
      inStock: true,
      stockQuantity: 50,
      featured: false,
      rating: 4.7,
    },
    {
      id: 'prod_mug_01',
      name: 'Vinewood Safehouse Ceramic Coffee Mug (15oz)',
      description: 'Matte black stoneware mug with glossy blood red interior and metallic thermal bull horn print. Microwave and dishwasher safe.',
      price: 18.99,
      category: 'Mugs',
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
      ],
      sizes: ['15 oz'],
      inStock: true,
      stockQuantity: 110,
      featured: false,
      rating: 4.9,
    }
  ];

  const story: GangStory = {
    id: 'story_main',
    title: 'THE GENESIS OF BLACK BULLS',
    tagline: 'Born from asphalt, forged in gunfire, ruling Los Santos with honor.',
    leadParagraph: 'Before the name Black Bulls echoed through every alleyway from Strawberry to Vinewood Hills, there were two men in a stolen Declasse Granger with fifty rounds of ammo and a dream to take over the city.',
    fullLore: 'The Black Bulls was founded on the premier GTA 5 Roleplay server by streamers Krish Malik (Mota Bhai) and Ansh Mehta (Thunderbolt Gaming / Kancha Bhau). Starting with low-level contraband logistics and clandestine street races in Cypress Flats, their relentless loyalty and razor-sharp roleplay quickly made them the most feared and respected faction in the server. Today, the Black Bulls command high-stakes territory, run legitimate fronts, and defend their crew against any rival syndicate that dares cross the horns.',
    heroImage: '/src/assets/images/black_bulls_emblem_1790605389270.jpg',
    chapters: [
      {
        id: 'chap_1',
        title: '01. The Cypress Flats Stand',
        summary: 'How Mota Bhai and Kancha Bhau survived a three-way shootout with zero backup.',
        content: 'Surrounded by rival crews in the industrial district of Cypress Flats, Mota Bhai held the rooftop choke-point while Kancha executed a textbook reverse vehicle flank. The battle ended without a single Bull captured, setting the foundation of their legendary reputation.',
      },
      {
        id: 'chap_2',
        title: '02. Code of the Horns',
        summary: 'Never snitch, never retreat, and brothers before bullets.',
        content: 'The Black Bulls operate under a strict code of in-character honor. Every member is vetted through rigorous RP trials. Loyalty is rewarded with blood protection, custom syndicate vehicles, and a seat at the command table.',
      },
      {
        id: 'chap_3',
        title: '03. The Vinewood Ascendancy',
        summary: 'Expanding from street corners to penthouse boardrooms and server-wide influence.',
        content: 'From controlling underground mechanics and legal nightlife clubs to coordinating server-defining city heists, the Black Bulls transformed from a ragtag crew into the reigning criminal royalty of Los Santos.',
      }
    ],
    lastUpdated: new Date().toISOString(),
  };

  const comments: Comment[] = [
    {
      id: 'comm_01',
      userId: 'usr_fan_01',
      userName: 'Aryan V. (BB Soldier)',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AryanBB',
      streamerId: 'streamer_motabhai',
      streamerName: 'MOTA BHAI',
      content: 'Mota Bhai that police chase in yesterday\'s stream through the subway tunnels was pure cinema! Best RP moment of 2026. Bulls on top always! 🐂🔥',
      status: 'approved',
      isFavorite: true,
      createdAt: '2026-03-24T18:30:00Z',
    },
    {
      id: 'comm_02',
      userId: 'usr_fan_01',
      userName: 'Aryan V. (BB Soldier)',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AryanBB',
      streamerId: 'streamer_thunderbolt',
      streamerName: 'Thunderbolt Gaming',
      content: 'Kancha Bhau the sniper shot from the crane during the jewelry store escape was insane! Need the Black Bulls hoodie ASAP!',
      status: 'approved',
      isFavorite: true,
      createdAt: '2026-03-25T14:15:00Z',
    },
    {
      id: 'comm_03',
      userId: 'usr_fan_02',
      userName: 'Rohan Sharma',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanRP',
      streamerId: 'streamer_motabhai',
      streamerName: 'MOTA BHAI',
      content: 'The negotiation with the police chief had everyone on edge in chat. Nobody commands authority like Mota Bhai in GTA RP.',
      status: 'approved',
      isFavorite: false,
      createdAt: '2026-03-26T09:40:00Z',
    }
  ];

  const orders: Order[] = [];

  return { users, streamers, products, story, comments, orders };
}
