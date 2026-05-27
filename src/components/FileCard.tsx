import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FileShare } from '../types/card';
import { Colors, Typography, Spacing } from '../constants/theme';
import { FileShareService } from '../services/FileShareService';
import { timeAgo } from '../utils/format';

interface FileCardProps {
  file: FileShare;
  onPress?: () => void;
}

export function FileCard({ file, onPress }: FileCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{FileShareService.getFileIcon(file.type)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{file.name}</Text>
        <Text style={styles.meta}>
          {FileShareService.formatSize(file.size)} · {file.sharedBy} · {timeAgo(file.sharedAt)}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  name: { color: Colors.text, ...Typography.body, fontWeight: '600' },
  meta: { color: Colors.textMuted, ...Typography.small, marginTop: 2 },
  arrow: { color: Colors.textMuted, fontSize: 22 },
});
