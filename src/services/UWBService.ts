import { EventEmitter } from 'events';
import { UWBDevice, DeviceStatus, ProximityEvent } from '../types/device';
import { Card } from '../types/card';
import { PROXIMITY_CLOSE_THRESHOLD, PROXIMITY_FAR_THRESHOLD, SCAN_INTERVAL_MS, SIMULATED_DEVICES, MAX_NEARBY_DEVICES, DEVICE_LOST_TIMEOUT_MS } from '../constants/config';
import { generateId } from '../utils/uuid';

class UWBServiceImpl extends EventEmitter {
  private isScanning = false;
  private scanTimer: ReturnType<typeof setInterval> | null = null;
  private knownDevices: Map<string, UWBDevice> = new Map();
  private broadcastCard: Card | null = null;
  private discoveryQueue: typeof SIMULATED_DEVICES = [];

  startScanning(): void {
    if (this.isScanning) return;
    this.isScanning = true;
    this.discoveryQueue = [...SIMULATED_DEVICES].sort(() => Math.random() - 0.5);
    this.emit('scan_started');
    this.scanTimer = setInterval(() => this.tick(), SCAN_INTERVAL_MS);
  }

  stopScanning(): void {
    if (!this.isScanning) return;
    this.isScanning = false;
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
    this.emit('scan_stopped');
  }

  setBroadcastCard(card: Card | null): void {
    this.broadcastCard = card;
  }

  getBroadcastCard(): Card | null {
    return this.broadcastCard;
  }

  private tick(): void {
    this.updateExistingDevices();
    this.tryDiscoverNewDevice();
  }

  private updateExistingDevices(): void {
    const now = Date.now();
    this.knownDevices.forEach((device) => {
      if (device.status === DeviceStatus.LOST) return;
      if (now - device.lastSeen > DEVICE_LOST_TIMEOUT_MS) {
        device.status = DeviceStatus.LOST;
        this.emit('device_lost', device as ProximityEvent['device']);
        return;
      }
      const drift = (Math.random() - 0.5) * 1.5;
      device.distance = Math.max(0.3, Math.min(10, device.distance + drift));
      device.rssi = -40 - Math.round(device.distance * 5) + Math.round(Math.random() * 6 - 3);
      device.lastSeen = now;

      const prevStatus = device.status;
      if (device.distance < PROXIMITY_CLOSE_THRESHOLD) {
        device.status = DeviceStatus.CLOSE;
      } else if (device.distance < PROXIMITY_FAR_THRESHOLD) {
        device.status = DeviceStatus.RANGING;
      } else {
        device.status = DeviceStatus.FAR;
      }

      if (prevStatus !== device.status) {
        this.emit('distance_changed', device as ProximityEvent['device']);
      }

      if (device.distance < PROXIMITY_CLOSE_THRESHOLD && !device.card) {
        this.handleCardExchange(device);
      }
    });
  }

  private tryDiscoverNewDevice(): void {
    if (this.knownDevices.size >= MAX_NEARBY_DEVICES) return;
    if (this.discoveryQueue.length === 0) {
      this.discoveryQueue = [...SIMULATED_DEVICES].sort(() => Math.random() - 0.5);
    }
    if (Math.random() > 0.3) return;

    const simDevice = this.discoveryQueue.pop()!;
    if (this.knownDevices.has(simDevice.id)) return;

    const distance = 3 + Math.random() * 7;
    const device: UWBDevice = {
      id: simDevice.id,
      name: simDevice.name,
      status: DeviceStatus.DISCOVERED,
      distance,
      rssi: -40 - Math.round(distance * 5),
      lastSeen: Date.now(),
    };

    this.knownDevices.set(device.id, device);
    this.emit('device_discovered', device as ProximityEvent['device']);
  }

  private handleCardExchange(device: UWBDevice): void {
    const sampleCard: Card = {
      id: generateId(),
      type: 'personal' as any,
      title: `${device.name}的名片`,
      fields: [
        { key: 'name', label: '姓名', value: device.name.replace(/的.*/, ''), icon: '👤', actionType: undefined },
        { key: 'phone', label: '电话', value: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`, icon: '📞', actionType: 'phone' },
        { key: 'wechat', label: '微信', value: `wx_${device.id}`, icon: '💬', actionType: 'wechat' },
      ],
      color: '#00d2ff',
      isActive: true,
      isDefault: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    device.card = sampleCard;
    device.cardId = sampleCard.id;
    this.emit('card_received', device as ProximityEvent['device']);
  }

  getNearbyDevices(): UWBDevice[] {
    return Array.from(this.knownDevices.values()).filter((d) => d.status !== DeviceStatus.LOST);
  }

  getDevice(id: string): UWBDevice | undefined {
    return this.knownDevices.get(id);
  }

  getIsScanning(): boolean {
    return this.isScanning;
  }
}

export const UWBService = new UWBServiceImpl();
