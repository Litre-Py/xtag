import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../types/navigation';
import { Colors, Typography, Spacing } from '../constants/theme';

type Nav = NativeStackNavigationProp<MoreStackParamList, 'MoreMain'>;

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  route: keyof MoreStackParamList;
  color: string;
}

const FEATURES: FeatureItem[] = [
  { icon: '🤖', title: 'AI 助手', description: '智能对话、简历生成、问题解答', route: 'AIChat', color: '#10a37f' },
  { icon: '📄', title: '文件分享', description: '通过UWB向附近设备分享文件', route: 'FileShare', color: '#3498db' },
  { icon: '🍜', title: '菜单分享', description: '发现附近餐厅，查看菜单并点菜', route: 'RestaurantList', color: '#e67e22' },
  { icon: '🅿️', title: '停车场', description: '查找空闲车位和收费信息', route: 'ParkingLotList', color: '#27ae60' },
];

export function MoreScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>更多功能</Text>
        <Text style={styles.subtitle}>探索 UWB 近场共享的更多可能</Text>
      </View>

      <View style={styles.grid}>
        {FEATURES.map((feature) => (
          <TouchableOpacity
            key={feature.route}
            style={styles.card}
            onPress={() => navigation.navigate(feature.route as any)}
          >
            <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
              <Text style={styles.icon}>{feature.icon}</Text>
            </View>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardDesc}>{feature.description}</Text>
            <Text style={[styles.arrow, { color: feature.color }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.xl },
  title: { color: Colors.text, ...Typography.title },
  subtitle: { color: Colors.textSecondary, ...Typography.body, marginTop: Spacing.xs },
  grid: { gap: Spacing.md, paddingHorizontal: Spacing.lg },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.xl,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  iconContainer: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 26 },
  cardTitle: { color: Colors.text, ...Typography.subtitle, fontWeight: '700' },
  cardDesc: { color: Colors.textSecondary, ...Typography.caption, flex: 1 },
  arrow: { fontSize: 28, fontWeight: '300' },
});
