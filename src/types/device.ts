import { Card } from './card';

export enum DeviceStatus {
  DISCOVERED = 'discovered',
  RANGING = 'ranging',
  CLOSE = 'close',
  FAR = 'far',
  LOST = 'lost',
}

export interface UWBDevice {
  id: string;
  name: string;
  status: DeviceStatus;
  distance: number;
  rssi: number;
  lastSeen: number;
  cardId?: string;
  card?: Card;
}

export interface ProximityEvent {
  type: 'device_discovered' | 'device_lost' | 'distance_changed' | 'card_received';
  device: UWBDevice;
  timestamp: number;
}
