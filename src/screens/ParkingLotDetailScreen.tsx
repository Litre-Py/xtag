import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MoreStackParamList } from '../types/navigation';
import { ParkingLotService } from '../services/ParkingLotService';
import { NotificationService } from '../services/NotificationService';
import { ParkingLot } from '../types/card';
import { ParkingSpotGrid, ParkingLegend } from '../components/ParkingSpotGrid';
import { Colors, Typography, Spacing } from '../constants/theme';

type Route = RouteProp<MoreStackParamList, 'ParkingLotDetail'>;

export function ParkingLotDetailScreen() {
  const route = useRoute<Route>();
  const [lot, setLot] = useState<ParkingLot | null>(null);

  useEffect(() => {
    ParkingLotService.getById(route.params.lotId).then(setLot);
  }, []);

  if (!lot) return null;

  const available = lot.spots.filter((s) => s.status === 'available').length;
  const occupied = lot.spots.filter((s) => s.status === 'occupied').length;
  const evSpots = lot.spots.filter((s) => s.type === 'ev').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.name}>{lot.name}</Text>
        <Text style={styles.address}>{lot.address}</Text>
        <Text style={styles.hours}>🕐 {lot.openHours}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: Colors.success }]}>
          <Text style={styles.statValue}>{available}</Text>
          <Text style={styles.statLabel}>空闲车位</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.accent }]}>
          <Text style={styles.statValue}>{occupied}</Text>
          <Text style={styles.statLabel}>已占用</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.warning }]}>
          <Text style={styles.statValue}>{lot.totalSpots}</Text>
          <Text style={styles.statLabel}>总车位</Text>
        </View>
      </View>

      <View style={styles.feeCard}>
        <Text style={styles.feeTitle}>收费标准</Text>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>临时停车</Text>
          <Text style={styles.feeValue}>¥{lot.hourlyRate}/小时</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>全天封顶</Text>
          <Text style={styles.feeValue}>¥{lot.dailyRate}/天</Text>
        </View>
        {lot.evCharging && (
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>充电车位</Text>
            <Text style={styles.feeValue}>{evSpots} 个</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>车位分布图</Text>
      <ParkingLegend />
      <ParkingSpotGrid spots={lot.spots} onSpotPress={(spot) => {
        Alert.alert(`车位 ${spot.number}`, `状态: ${spot.status === 'available' ? '空闲' : '占用'}\n类型: ${spot.type}`);
      }} />

      <TouchableOpacity
        style={styles.navBtn}
        onPress={() => Alert.alert('导航', `正在导航至 ${lot.address}`)}
      >
        <Text style={styles.navBtnText}>📍 导航前往</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.md, gap: Spacing.xs },
  name: { color: Colors.text, ...Typography.title },
  address: { color: Colors.textSecondary, ...Typography.body },
  hours: { color: Colors.primary, ...Typography.body },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 10, padding: Spacing.md, borderLeftWidth: 3 },
  statValue: { color: Colors.text, ...Typography.title, fontWeight: '900' },
  statLabel: { color: Colors.textMuted, ...Typography.small },
  feeCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  feeTitle: { color: Colors.text, ...Typography.subtitle, fontWeight: '700', marginBottom: Spacing.md },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.border },
  feeLabel: { color: Colors.textSecondary, ...Typography.body },
  feeValue: { color: Colors.text, ...Typography.body, fontWeight: '600' },
  sectionTitle: { color: Colors.textSecondary, ...Typography.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  navBtn: { backgroundColor: Colors.primary, marginHorizontal: Spacing.lg, marginTop: Spacing.lg, padding: Spacing.lg, borderRadius: 12, alignItems: 'center' },
  navBtnText: { color: Colors.background, ...Typography.subtitle, fontWeight: '700' },
});
