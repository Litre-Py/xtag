export enum CardType {
  PERSONAL = 'personal',
  PARKING = 'parking',
  CUSTOM = 'custom',
  RESUME = 'resume',
}

export interface CardField {
  key: string;
  label: string;
  value: string;
  icon?: string;
  actionType?: 'phone' | 'sms' | 'wechat' | 'email' | 'url' | 'alipay' | 'wechat_pay' | 'douyin' | 'xiaohongshu' | 'weibo' | 'qq' | 'bilibili';
}

export interface Card {
  id: string;
  type: CardType;
  title: string;
  fields: CardField[];
  color?: string;
  avatar?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ParkingCard extends Card {
  type: CardType.PARKING;
  licensePlate: string;
  parkingSpot: string;
  ownerName: string;
  ownerPhone: string;
  vehicleModel: string;
  expiresAt?: number;
}

export interface ResumeCard extends Card {
  type: CardType.RESUME;
  markdown: string;
  skills: string[];
  experience: string;
  education: string;
}

export interface FileShare {
  id: string;
  name: string;
  type: string;
  size: number;
  uri?: string;
  sharedBy: string;
  sharedAt: number;
  thumbnail?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  spicy?: number;
  isAvailable: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  menu: MenuItem[];
  imageUrl?: string;
}

export interface ParkingSpot {
  id: string;
  zone: string;
  row: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved';
  type: 'standard' | 'compact' | 'ev' | 'handicap';
}

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  totalSpots: number;
  availableSpots: number;
  hourlyRate: number;
  dailyRate: number;
  openHours: string;
  spots: ParkingSpot[];
  evCharging: boolean;
}
