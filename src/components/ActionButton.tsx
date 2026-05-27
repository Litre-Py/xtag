import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';

interface ActionButtonProps {
  icon: string;
  label: string;
  color?: string;
  onPress: () => void;
}

export function ActionButton({ icon, label, color = Colors.primary, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, { borderColor: color + '40' }]} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
