import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardType, ParkingCard } from '../types/card';
import { Colors, Typography, Spacing } from '../constants/theme';
import { Badge } from './Badge';

interface CardViewProps {
  card: Card;
  compact?: boolean;
}

export function CardView({ card, compact = false }: CardViewProps) {
  const isParking = card.type === CardType.PARKING;
  const parkingCard = card as ParkingCard;

  return (
    <View style={[styles.card, { borderLeftColor: card.color || Colors.primary }, compact && styles.compact]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{card.title}</Text>
          <Badge type={card.type} />
        </View>
        {card.avatar ? (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{card.title.charAt(0)}</Text>
          </View>
        ) : null}
      </View>

      {isParking && (
        <View style={styles.parkingSection}>
          <Text style={styles.licensePlate}>{parkingCard.licensePlate}</Text>
          <View style={styles.parkingInfo}>
            <Text style={styles.parkingSpot}>车位: {parkingCard.parkingSpot}</Text>
            <Text style={styles.vehicleModel}>{parkingCard.vehicleModel}</Text>
          </View>
        </View>
      )}

      <View style={styles.fields}>
        {card.fields.map((field) => (
          <View key={field.key} style={styles.fieldRow}>
            <Text style={styles.fieldIcon}>{field.icon || '•'}</Text>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <Text style={styles.fieldValue} numberOfLines={1}>{field.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  compact: {
    padding: Spacing.md,
    marginHorizontal: 0,
    marginVertical: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    color: Colors.text,
    ...Typography.subtitle,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  avatarText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '700',
  },
  parkingSection: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  licensePlate: {
    color: Colors.warning,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: Spacing.sm,
  },
  parkingInfo: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  parkingSpot: {
    color: Colors.textSecondary,
    ...Typography.body,
  },
  vehicleModel: {
    color: Colors.textSecondary,
    ...Typography.body,
  },
  fields: {
    gap: Spacing.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  fieldIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  fieldLabel: {
    color: Colors.textMuted,
    ...Typography.caption,
    width: 50,
  },
  fieldValue: {
    color: Colors.text,
    ...Typography.body,
    flex: 1,
  },
});
