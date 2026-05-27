import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UWBDevice, DeviceStatus } from '../types/device';
import { Badge } from './Badge';
import { Colors, Typography, Spacing } from '../constants/theme';
import { formatDistance } from '../utils/format';

interface DeviceListItemProps {
  device: UWBDevice;
  onPress: () => void;
}

function getDistanceColor(distance: number): string {
  if (distance < 2) return Colors.proximityClose;
  if (distance < 5) return Colors.proximityMid;
  return Colors.proximityFar;
}

function getSignalBars(rssi: number): number {
  if (rssi > -50) return 4;
  if (rssi > -60) return 3;
  if (rssi > -70) return 2;
  return 1;
}

export function DeviceListItem({ device, onPress }: DeviceListItemProps) {
  const distColor = getDistanceColor(device.distance);
  const bars = getSignalBars(device.rssi);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{device.name}</Text>
        <View style={styles.row}>
          <Badge status={device.status} />
          <Text style={[styles.distance, { color: distColor }]}>{formatDistance(device.distance)}</Text>
        </View>
      </View>
      <View style={styles.signal}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: 4 + i * 3,
                backgroundColor: i <= bars ? Colors.primary : Colors.border,
              },
            ]}
          />
        ))}
      </View>
      {device.card && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    gap: Spacing.md,
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  name: {
    color: Colors.text,
    ...Typography.body,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  distance: {
    ...Typography.caption,
    fontWeight: '600',
  },
  signal: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 3,
    borderRadius: 1,
  },
  arrow: {
    color: Colors.textMuted,
    fontSize: 24,
  },
});
