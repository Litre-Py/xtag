import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ParkingSpot } from '../types/card';
import { Colors, Typography, Spacing } from '../constants/theme';

interface ParkingSpotGridProps {
  spots: ParkingSpot[];
  onSpotPress?: (spot: ParkingSpot) => void;
}

const STATUS_COLORS: Record<ParkingSpot['status'], string> = {
  available: Colors.success,
  occupied: Colors.accent,
  reserved: Colors.warning,
};

const TYPE_LABELS: Record<ParkingSpot['type'], string> = {
  standard: '标准',
  compact: '小型',
  ev: '充电',
  handicap: '无障碍',
};

export function ParkingSpotGrid({ spots, onSpotPress }: ParkingSpotGridProps) {
  const zones = [...new Set(spots.map((s) => s.zone))];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {zones.map((zone) => {
          const zoneSpots = spots.filter((s) => s.zone === zone);
          return (
            <View key={zone} style={styles.zone}>
              <Text style={styles.zoneLabel}>{zone} 区</Text>
              <View style={styles.grid}>
                {zoneSpots.map((spot) => (
                  <TouchableOpacity
                    key={spot.id}
                    style={[
                      styles.spot,
                      { backgroundColor: STATUS_COLORS[spot.status] + '30', borderColor: STATUS_COLORS[spot.status] },
                    ]}
                    onPress={() => onSpotPress?.(spot)}
                    disabled={spot.status !== 'available'}
                  >
                    <Text style={[styles.spotNumber, { color: STATUS_COLORS[spot.status] }]}>{spot.number}</Text>
                    {spot.type !== 'standard' && (
                      <Text style={styles.spotType}>{TYPE_LABELS[spot.type]}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

export function ParkingLegend() {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
        <Text style={styles.legendText}>空闲</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
        <Text style={styles.legendText}>占用</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
        <Text style={styles.legendText}>预约</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: Spacing.xl, paddingVertical: Spacing.md },
  zone: { alignItems: 'center' },
  zoneLabel: { color: Colors.textSecondary, ...Typography.caption, fontWeight: '600', marginBottom: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, width: 180 },
  spot: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotNumber: { fontSize: 9, fontWeight: '700' },
  spotType: { fontSize: 7, color: Colors.textMuted },
  legend: { flexDirection: 'row', gap: Spacing.lg, paddingHorizontal: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: Colors.textSecondary, ...Typography.small },
});
