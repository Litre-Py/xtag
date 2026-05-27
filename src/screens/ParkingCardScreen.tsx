import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../types/navigation';
import { useCards } from '../hooks/useCards';
import { ParkingCard } from '../types/card';
import { Colors, Typography, Spacing } from '../constants/theme';
import { NotificationService } from '../services/NotificationService';
import { formatDistance } from '../utils/format';

type Route = RouteProp<HomeStackParamList, 'ParkingCard'>;

export function ParkingCardScreen() {
  const route = useRoute<Route>();
  const { cards } = useCards();
  const card = cards.find((c) => c.id === route.params.cardId) as ParkingCard | undefined;

  if (!card) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>停车卡未找到</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardType}>🅿️ 停车卡</Text>
          {card.isActive && <View style={styles.liveBadge}><Text style={styles.liveText}>● UWB广播中</Text></View>}
        </View>

        <View style={styles.plateSection}>
          <Text style={styles.plate}>{card.licensePlate}</Text>
        </View>

        <View style={styles.spotSection}>
          <Text style={styles.spotLabel}>车位</Text>
          <Text style={styles.spotValue}>{card.parkingSpot}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👤</Text>
            <Text style={styles.infoLabel}>车主</Text>
            <Text style={styles.infoValue}>{card.ownerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📞</Text>
            <Text style={styles.infoLabel}>电话</Text>
            <Text style={styles.infoValue}>{card.ownerPhone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🚗</Text>
            <Text style={styles.infoLabel}>车型</Text>
            <Text style={styles.infoValue}>{card.vehicleModel}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.success }]}
            onPress={() => NotificationService.makePhoneCall(card.ownerPhone)}
          >
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionText}>打电话</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
            onPress={() => NotificationService.sendSMS(card.ownerPhone, '你好，我在你的车附近，请尽快挪车')}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>发短信</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.success }]}
            onPress={() => NotificationService.openWeChat()}
          >
            <Text style={styles.actionIcon}>📱</Text>
            <Text style={styles.actionText}>微信</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>
          当附近用户持有UWB设备接近时，此停车卡将自动弹出，方便其他用户联系车主挪车。
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  notFound: { color: Colors.textMuted, ...Typography.body, textAlign: 'center', marginTop: 60 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  cardType: { color: Colors.warning, ...Typography.subtitle, fontWeight: '700' },
  liveBadge: { backgroundColor: Colors.success + '20', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: 8 },
  liveText: { color: Colors.success, ...Typography.small, fontWeight: '600' },
  plateSection: { alignItems: 'center', marginBottom: Spacing.xl, paddingVertical: Spacing.lg, backgroundColor: Colors.surfaceHighlight, borderRadius: 12 },
  plate: { color: Colors.warning, fontSize: 36, fontWeight: '900', letterSpacing: 6 },
  spotSection: { alignItems: 'center', marginBottom: Spacing.xl },
  spotLabel: { color: Colors.textMuted, ...Typography.caption },
  spotValue: { color: Colors.text, fontSize: 48, fontWeight: '900', marginTop: Spacing.xs },
  infoSection: { gap: Spacing.md, marginBottom: Spacing.xl },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  infoLabel: { color: Colors.textMuted, width: 40, ...Typography.body },
  infoValue: { color: Colors.text, ...Typography.body, flex: 1, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: 12, gap: Spacing.xs },
  actionIcon: { fontSize: 22 },
  actionText: { color: Colors.text, ...Typography.caption, fontWeight: '700' },
  tipCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, marginTop: Spacing.lg, gap: Spacing.sm },
  tipIcon: { fontSize: 20 },
  tipText: { color: Colors.textSecondary, ...Typography.body, flex: 1, lineHeight: 20 },
});
