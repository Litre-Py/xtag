import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../types/navigation';
import { ParkingLotService } from '../services/ParkingLotService';
import { ParkingLot } from '../types/card';
import { Colors, Typography, Spacing } from '../constants/theme';

type Nav = NativeStackNavigationProp<MoreStackParamList, 'ParkingLotList'>;

export function ParkingLotListScreen() {
  const navigation = useNavigation<Nav>();
  const [lots, setLots] = useState<ParkingLot[]>([]);

  useEffect(() => {
    ParkingLotService.getAll().then(setLots);
  }, []);

  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.3) return Colors.success;
    if (ratio > 0.1) return Colors.warning;
    return Colors.accent;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>停车场</Text>
        <Text style={styles.subtitle}>查找附近空闲车位</Text>
      </View>

      <FlatList
        data={lots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const color = getAvailabilityColor(item.availableSpots, item.totalSpots);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ParkingLotDetail', { lotId: item.id })}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardInfo}>
                  <Text style={styles.lotName}>{item.name}</Text>
                  <Text style={styles.address}>{item.address}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.badgeText, { color }]}>{item.availableSpots}</Text>
                  <Text style={[styles.badgeLabel, { color }]}>空位</Text>
                </View>
              </View>

              <View style={styles.cardStats}>
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>💰</Text>
                  <Text style={styles.statText}>¥{item.hourlyRate}/时</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>🅿️</Text>
                  <Text style={styles.statText}>{item.totalSpots} 位</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>🕐</Text>
                  <Text style={styles.statText}>{item.openHours}</Text>
                </View>
                {item.evCharging && (
                  <View style={styles.stat}>
                    <Text style={styles.statIcon}>⚡</Text>
                    <Text style={styles.statText}>充电</Text>
                  </View>
                )}
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(item.availableSpots / item.totalSpots) * 100}%`, backgroundColor: color }]} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.lg },
  title: { color: Colors.text, ...Typography.title },
  subtitle: { color: Colors.textSecondary, ...Typography.body, marginTop: Spacing.xs },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, marginHorizontal: Spacing.lg, marginVertical: Spacing.xs },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1, gap: Spacing.xs },
  lotName: { color: Colors.text, ...Typography.subtitle, fontWeight: '700' },
  address: { color: Colors.textSecondary, ...Typography.caption },
  badge: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: 10, marginLeft: Spacing.md },
  badgeText: { ...Typography.subtitle, fontWeight: '900' },
  badgeLabel: { ...Typography.small },
  cardStats: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.md },
  stat: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  statIcon: { fontSize: 14 },
  statText: { color: Colors.textSecondary, ...Typography.caption },
  progressBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, marginTop: Spacing.md },
  progressFill: { height: 4, borderRadius: 2 },
});
