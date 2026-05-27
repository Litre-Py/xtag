import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types/navigation';
import { useUWBContext } from '../context/UWBContext';
import { useCards } from '../hooks/useCards';
import { CardView } from '../components/CardView';
import { DeviceListItem } from '../components/DeviceListItem';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { Colors, Typography, Spacing } from '../constants/theme';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { isScanning, nearbyDevices, startScan, stopScan } = useUWBContext();
  const { cards, loading, reload } = useCards();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const activeCards = cards.filter((c) => c.isActive);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>UWB Card</Text>
        <Text style={styles.subtitle}>近场卡片共享</Text>
      </View>

      <View style={styles.statusBar}>
        <TouchableOpacity
          style={[styles.statusItem, isScanning && styles.statusActive]}
          onPress={isScanning ? stopScan : startScan}
        >
          <Text style={styles.statusIcon}>{isScanning ? '📡' : '📴'}</Text>
          <Text style={[styles.statusText, isScanning && styles.statusTextActive]}>
            {isScanning ? '扫描中' : '开始扫描'}
          </Text>
        </TouchableOpacity>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>📱</Text>
          <Text style={styles.statusText}>{nearbyDevices.length} 台设备</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>💳</Text>
          <Text style={styles.statusText}>{activeCards.length} 张卡片</Text>
        </View>
      </View>

      {nearbyDevices.length > 0 && (
        <>
          <SectionHeader title="附近设备" />
          {nearbyDevices.slice(0, 5).map((device) => (
            <DeviceListItem
              key={device.id}
              device={device}
              onPress={() => {
                if (device.card) {
                  navigation.navigate('CardDetail', { cardId: device.card.id });
                }
              }}
            />
          ))}
        </>
      )}

      <SectionHeader
        title="我的卡片"
        action={
          <TouchableOpacity onPress={() => navigation.navigate('CardDetail', { cardId: activeCards[0]?.id || '' })}>
            <Text style={styles.seeAll}>查看全部</Text>
          </TouchableOpacity>
        }
      />
      {activeCards.length > 0 ? (
        activeCards.slice(0, 3).map((card) => (
          <TouchableOpacity key={card.id} onPress={() => navigation.navigate('CardDetail', { cardId: card.id })}>
            <CardView card={card} compact />
          </TouchableOpacity>
        ))
      ) : (
        <EmptyState icon="💳" title="暂无活跃卡片" description="去创建你的第一张卡片吧" />
      )}

      <SectionHeader
        title="通知"
        action={
          <TouchableOpacity onPress={() => navigation.navigate('NotificationHistory')}>
            <Text style={styles.seeAll}>历史</Text>
          </TouchableOpacity>
        }
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.lg },
  greeting: { color: Colors.text, ...Typography.title },
  subtitle: { color: Colors.textSecondary, ...Typography.body, marginTop: Spacing.xs },
  statusBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusActive: { borderColor: Colors.primary, borderWidth: 1 },
  statusIcon: { fontSize: 20 },
  statusText: { color: Colors.textSecondary, ...Typography.caption },
  statusTextActive: { color: Colors.primary },
  seeAll: { color: Colors.primary, ...Typography.caption },
});
