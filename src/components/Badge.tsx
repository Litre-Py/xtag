import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardType } from '../types/card';
import { DeviceStatus } from '../types/device';
import { Colors, Typography, Spacing } from '../constants/theme';

interface BadgeProps {
  type?: CardType;
  status?: DeviceStatus;
  label?: string;
}

const typeLabels: Record<CardType, string> = {
  [CardType.PERSONAL]: '名片',
  [CardType.PARKING]: '停车卡',
  [CardType.CUSTOM]: '自定义',
  [CardType.RESUME]: '简历',
};

const statusLabels: Record<DeviceStatus, string> = {
  [DeviceStatus.DISCOVERED]: '发现',
  [DeviceStatus.RANGING]: '测距中',
  [DeviceStatus.CLOSE]: '近场',
  [DeviceStatus.FAR]: '远场',
  [DeviceStatus.LOST]: '丢失',
};

const statusColors: Record<DeviceStatus, string> = {
  [DeviceStatus.DISCOVERED]: Colors.primary,
  [DeviceStatus.RANGING]: Colors.warning,
  [DeviceStatus.CLOSE]: Colors.proximityClose,
  [DeviceStatus.FAR]: Colors.proximityFar,
  [DeviceStatus.LOST]: Colors.textMuted,
};

export function Badge({ type, status, label }: BadgeProps) {
  const text = label || (type ? typeLabels[type] : status ? statusLabels[status] : '');
  const bgColor = status ? statusColors[status] : Colors.primary;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor + '20' }]}>
      <Text style={[styles.text, { color: bgColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    ...Typography.small,
    fontWeight: '600',
  },
});
