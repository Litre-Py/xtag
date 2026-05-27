import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationRecord, NotificationChannel } from '../types/notification';
import { EmptyState } from '../components/EmptyState';
import { Colors, Typography, Spacing } from '../constants/theme';
import { formatDate } from '../utils/format';

const channelIcons: Record<NotificationChannel, string> = {
  [NotificationChannel.SMS]: '💬',
  [NotificationChannel.PHONE]: '📞',
  [NotificationChannel.WECHAT]: '📱',
  [NotificationChannel.EMAIL]: '📧',
  [NotificationChannel.IN_APP]: '🔔',
  [NotificationChannel.PUSH]: '📨',
  [NotificationChannel.ALIPAY]: '💰',
  [NotificationChannel.WECHAT_PAY]: '💳',
  [NotificationChannel.DOUYIN]: '🎵',
  [NotificationChannel.XIAOHONGSHU]: '📕',
  [NotificationChannel.WEIBO]: '🔴',
  [NotificationChannel.QQ]: '🐧',
  [NotificationChannel.BILIBILI]: '📺',
};

const channelColors: Record<NotificationChannel, string> = {
  [NotificationChannel.SMS]: Colors.primary,
  [NotificationChannel.PHONE]: Colors.success,
  [NotificationChannel.WECHAT]: Colors.success,
  [NotificationChannel.EMAIL]: '#ea4335',
  [NotificationChannel.IN_APP]: Colors.warning,
  [NotificationChannel.PUSH]: Colors.primary,
  [NotificationChannel.ALIPAY]: '#1677ff',
  [NotificationChannel.WECHAT_PAY]: Colors.success,
  [NotificationChannel.DOUYIN]: '#000000',
  [NotificationChannel.XIAOHONGSHU]: '#ff2442',
  [NotificationChannel.WEIBO]: '#ff8200',
  [NotificationChannel.QQ]: '#12b7f5',
  [NotificationChannel.BILIBILI]: '#fb7299',
};

export function NotificationHistoryScreen() {
  const { history, loading, markRead, clearHistory } = useNotifications();

  const handleClear = () => {
    Alert.alert('清空通知', '确定要清空所有通知记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '清空', style: 'destructive', onPress: clearHistory },
    ]);
  };

  const renderItem = ({ item }: { item: NotificationRecord }) => (
    <TouchableOpacity
      style={[styles.item, !item.read && styles.unread]}
      onPress={() => markRead(item.id)}
    >
      <View style={[styles.iconBadge, { backgroundColor: channelColors[item.channel] + '20' }]}>
        <Text style={styles.icon}>{channelIcons[item.channel]}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>{formatDate(item.sentAt)}</Text>
      </View>
      {item.success ? (
        <Text style={styles.success}>✓</Text>
      ) : (
        <Text style={styles.failed}>✕</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState icon="🔔" title="暂无通知" description="通知记录将会显示在这里" />
        }
        contentContainerStyle={history.length === 0 ? styles.emptyList : undefined}
      />
      {history.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearText}>清空全部</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  item: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, marginHorizontal: Spacing.lg, marginVertical: Spacing.xs, backgroundColor: Colors.surface, borderRadius: 12, gap: Spacing.md },
  unread: { borderColor: Colors.primary, borderWidth: 1 },
  iconBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 18 },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { color: Colors.text, ...Typography.body, fontWeight: '600' },
  unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  body: { color: Colors.textSecondary, ...Typography.caption, marginTop: 2 },
  time: { color: Colors.textMuted, ...Typography.small, marginTop: 2 },
  success: { color: Colors.success, fontSize: 16 },
  failed: { color: Colors.accent, fontSize: 16 },
  clearBtn: { alignItems: 'center', padding: Spacing.lg },
  clearText: { color: Colors.accent, ...Typography.body },
  emptyList: { flexGrow: 1 },
});
