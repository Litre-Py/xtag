import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MenuItem } from '../types/card';
import { Colors, Typography, Spacing } from '../constants/theme';

interface MenuItemCardProps {
  item: MenuItem;
  onOrder?: (item: MenuItem) => void;
  ordered?: boolean;
}

export function MenuItemCard({ item, onOrder, ordered }: MenuItemCardProps) {
  return (
    <View style={[styles.card, !item.isAvailable && styles.unavailable]}>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{item.name}</Text>
          {item.spicy != null && item.spicy > 0 && (
            <Text style={styles.spicy}>{'🌶️'.repeat(item.spicy)}</Text>
          )}
        </View>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>¥{item.price}</Text>
          {item.isAvailable ? (
            <TouchableOpacity
              style={[styles.orderBtn, ordered && styles.orderedBtn]}
              onPress={() => onOrder?.(item)}
            >
              <Text style={[styles.orderText, ordered && styles.orderedText]}>
                {ordered ? '已点' : '点菜'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.soldOut}>已售罄</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  unavailable: { opacity: 0.5 },
  info: { gap: Spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  name: { color: Colors.text, ...Typography.body, fontWeight: '700' },
  spicy: { fontSize: 12 },
  description: { color: Colors.textSecondary, ...Typography.caption },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xs },
  price: { color: Colors.accent, ...Typography.subtitle, fontWeight: '700' },
  orderBtn: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  orderedBtn: { backgroundColor: Colors.success + '20' },
  orderText: { color: Colors.primary, ...Typography.caption, fontWeight: '700' },
  orderedText: { color: Colors.success },
  soldOut: { color: Colors.textMuted, ...Typography.caption },
});
