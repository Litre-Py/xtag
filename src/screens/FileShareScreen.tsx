import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../types/navigation';
import { FileShareService } from '../services/FileShareService';
import { FileShare } from '../types/card';
import { FileCard } from '../components/FileCard';
import { EmptyState } from '../components/EmptyState';
import { Colors, Typography, Spacing } from '../constants/theme';

type Nav = NativeStackNavigationProp<MoreStackParamList, 'FileShare'>;

export function FileShareScreen() {
  const navigation = useNavigation<Nav>();
  const [files, setFiles] = useState<FileShare[]>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const data = await FileShareService.getAll();
    setFiles(data);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>文件分享</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>+ 分享文件</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{files.length}</Text>
          <Text style={styles.statLabel}>文件总数</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{FileShareService.formatSize(files.reduce((acc, f) => acc + f.size, 0))}</Text>
          <Text style={styles.statLabel}>总大小</Text>
        </View>
      </View>

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FileCard
            file={item}
            onPress={() => Alert.alert(item.name, `来自: ${item.sharedBy}\n大小: ${FileShareService.formatSize(item.size)}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="📁" title="暂无文件" description="通过UWB分享文件给附近设备" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.lg,
  },
  title: { color: Colors.text, ...Typography.title },
  shareBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: 20 },
  shareBtnText: { color: Colors.background, ...Typography.body, fontWeight: '700' },
  stats: { flexDirection: 'row', marginHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.lg },
  statItem: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.md, alignItems: 'center' },
  statValue: { color: Colors.primary, ...Typography.subtitle, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, ...Typography.small, marginTop: 2 },
});
