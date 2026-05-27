import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UWBDevice, ProximityEvent } from '../types/device';
import { Card } from '../types/card';
import { UWBService } from '../services/UWBService';

interface UWBContextType {
  isScanning: boolean;
  nearbyDevices: UWBDevice[];
  lastEvent: ProximityEvent | null;
  receivedCard: { device: UWBDevice; card: Card } | null;
  startScan: () => void;
  stopScan: () => void;
  dismissCard: () => void;
}

const UWBContext = createContext<UWBContextType>({
  isScanning: false,
  nearbyDevices: [],
  lastEvent: null,
  receivedCard: null,
  startScan: () => {},
  stopScan: () => {},
  dismissCard: () => {},
});

export function UWBProvider({ children }: { children: ReactNode }) {
  const [isScanning, setIsScanning] = useState(false);
  const [nearbyDevices, setNearbyDevices] = useState<UWBDevice[]>([]);
  const [lastEvent, setLastEvent] = useState<ProximityEvent | null>(null);
  const [receivedCard, setReceivedCard] = useState<{ device: UWBDevice; card: Card } | null>(null);

  useEffect(() => {
    const onDeviceDiscovered = (device: UWBDevice) => {
      setNearbyDevices(UWBService.getNearbyDevices());
      setLastEvent({ type: 'device_discovered', device, timestamp: Date.now() });
    };
    const onDeviceLost = (device: UWBDevice) => {
      setNearbyDevices(UWBService.getNearbyDevices());
      setLastEvent({ type: 'device_lost', device, timestamp: Date.now() });
    };
    const onDistanceChanged = (device: UWBDevice) => {
      setNearbyDevices(UWBService.getNearbyDevices());
    };
    const onCardReceived = (device: UWBDevice) => {
      if (device.card) {
        setReceivedCard({ device, card: device.card });
        setLastEvent({ type: 'card_received', device, timestamp: Date.now() });
      }
    };
    const onScanStarted = () => setIsScanning(true);
    const onScanStopped = () => {
      setIsScanning(false);
      setNearbyDevices([]);
    };

    UWBService.on('device_discovered', onDeviceDiscovered);
    UWBService.on('device_lost', onDeviceLost);
    UWBService.on('distance_changed', onDistanceChanged);
    UWBService.on('card_received', onCardReceived);
    UWBService.on('scan_started', onScanStarted);
    UWBService.on('scan_stopped', onScanStopped);

    return () => {
      UWBService.off('device_discovered', onDeviceDiscovered);
      UWBService.off('device_lost', onDeviceLost);
      UWBService.off('distance_changed', onDistanceChanged);
      UWBService.off('card_received', onCardReceived);
      UWBService.off('scan_started', onScanStarted);
      UWBService.off('scan_stopped', onScanStopped);
    };
  }, []);

  const startScan = useCallback(() => UWBService.startScanning(), []);
  const stopScan = useCallback(() => UWBService.stopScanning(), []);
  const dismissCard = useCallback(() => setReceivedCard(null), []);

  return (
    <UWBContext.Provider value={{ isScanning, nearbyDevices, lastEvent, receivedCard, startScan, stopScan, dismissCard }}>
      {children}
    </UWBContext.Provider>
  );
}

export const useUWBContext = () => useContext(UWBContext);
