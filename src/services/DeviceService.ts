import { UWBDevice } from '../types/device';
import { DEVICE_STORAGE_KEY } from '../constants/config';
import { getStorage, setStorage } from '../utils/storage';

class DeviceServiceImpl {
  async saveDevices(devices: UWBDevice[]): Promise<void> {
    await setStorage(DEVICE_STORAGE_KEY, devices);
  }

  async getRecentDevices(): Promise<UWBDevice[]> {
    return getStorage<UWBDevice>(DEVICE_STORAGE_KEY);
  }

  async getDevice(id: string): Promise<UWBDevice | null> {
    const devices = await this.getRecentDevices();
    return devices.find((d) => d.id === id) || null;
  }

  async clearExpiredDevices(maxAgeMs: number): Promise<void> {
    const devices = await this.getRecentDevices();
    const now = Date.now();
    const valid = devices.filter((d) => now - d.lastSeen < maxAgeMs);
    await setStorage(DEVICE_STORAGE_KEY, valid);
  }
}

export const DeviceService = new DeviceServiceImpl();
