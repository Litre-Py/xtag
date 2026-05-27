import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScannerStackParamList } from '../types/navigation';
import { useUWBContext } from '../context/UWBContext';
import { DeviceListItem } from '../components/DeviceListItem';
import { ProximityPopup } from '../components/ProximityPopup';
import { EmptyState } from '../components/EmptyState';
import { Colors, Typography, Spacing } from '../constants/theme';

type Nav = NativeStackNavigationProp<ScannerStackParamList, 'ScannerMain'>;

export function ScannerScreen() {
  const navigation = useNavigation<Nav>();
  const { isScanning, nearbyDevices, receivedCard, startScan, stopScan, dismissCard } = useUWBContext();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isScanning) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isScanning]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>UWB 扫描器</Text>
        <Text style={styles.subtitle}>
          {isScanning ? `已发现 ${nearbyDevices.length} 台设备` : '点击开始扫描附近设备'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={isScanning ? stopScan : startScan}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.scanRing,
            isScanning && { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <View style={[styles.scanInner, isScanning && styles.scanInnerActive]}>
          <Text style={styles.scanIcon}>{isScanning ? '⏸' : '📡'}</Text>
          <Text style={styles.scanText}>{isScanning ? '停止' : '扫描'}</Text>
        </View>
      </TouchableOpacity>

      {isScanning && (
        <View style={styles.indicator}>
          <View style={styles.dot} />
          <Text style={styles.indicatorText}>正在扫描中...</Text>
        </View>
      )}

      <FlatList
        data={nearbyDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeviceListItem
            device={item}
            onPress={() => {
              if (item.card) {
                navigation.navigate('DeviceCard', { deviceId: item.id });
              }
            }}
          />
        )}
        ListEmptyComponent={
          isScanning ? (
            <EmptyState icon="🔍" title="正在搜索附近设备" description="请稍候，正在发现UWB设备..." />
          ) : (
            <EmptyState icon="📡" title="准备就绪" description="点击上方按钮开始扫描附近的UWB设备" />
          )
        }
        contentContainerStyle={nearbyDevices.length === 0 ? styles.emptyList : undefined}
      />

      {receivedCard && (
        <ProximityPopup
          device={receivedCard.device}
          card={receivedCard.card}
          onDismiss={dismissCard}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.lg, alignItems: 'center' },
  title: { color: Colors.text, ...Typography.title },
  subtitle: { color: Colors.textSecondary, ...Typography.body, marginTop: Spacing.xs },
  scanButton: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  scanRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
  },
  scanInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  scanInnerActive: {
    backgroundColor: Colors.primary + '20',
  },
  scanIcon: { fontSize: 28 },
  scanText: { color: Colors.primary, ...Typography.caption, fontWeight: '600', marginTop: 2 },
  indicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  indicatorText: { color: Colors.textSecondary, ...Typography.caption },
  emptyList: { flexGrow: 1 },
});
