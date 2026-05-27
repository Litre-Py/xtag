import { useState, useEffect, useCallback } from 'react';
import { UWBDevice } from '../types/device';
import { DeviceService } from '../services/DeviceService';

export function useDevices() {
  const [recentDevices, setRecentDevices] = useState<UWBDevice[]>([]);

  const reload = useCallback(async () => {
    const devices = await DeviceService.getRecentDevices();
    setRecentDevices(devices);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const getDevice = useCallback(async (id: string) => {
    return DeviceService.getDevice(id);
  }, []);

  const clearExpired = useCallback(async (maxAgeMs: number) => {
    await DeviceService.clearExpiredDevices(maxAgeMs);
    await reload();
  }, [reload]);

  return { recentDevices, getDevice, clearExpired, reload };
}
