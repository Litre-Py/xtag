import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CardStackParamList } from '../types/navigation';
import { useCards } from '../hooks/useCards';
import { Card, CardType } from '../types/card';
import { CardView } from '../components/CardView';
import { EmptyState } from '../components/EmptyState';
import { Colors, Typography, Spacing } from '../constants/theme';

type Nav = NativeStackNavigationProp<CardStackParamList, 'CardList'>;

export function CardListScreen() {
  const navigation = useNavigation<Nav>();
  const { cards, remove } = useCards();

  const handleDelete = (id: string, title: string) => {
    Alert.alert('删除卡片', `确定要删除「${title}」吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  const handlePress = (item: Card) => {
    if (item.type === CardType.RESUME) {
      navigation.navigate('ResumePreview', { cardId: item.id });
    } else {
      navigation.navigate('CardEditor', { cardId: item.id });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>我的卡片</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.resumeBtn}
            onPress={() => navigation.navigate('ResumeEditor', {})}
          >
            <Text style={styles.resumeBtnText}>📋 简历</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CardEditor', {})}
          >
            <Text style={styles.addText}>+ 新建</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            onLongPress={() => handleDelete(item.id, item.title)}
          >
            <CardView card={item} compact />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState icon="💳" title="暂无卡片" description="点击右上角创建你的第一张卡片" />
        }
        contentContainerStyle={cards.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  title: { color: Colors.text, ...Typography.title },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  resumeBtn: { backgroundColor: '#9b59b620', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 20 },
  resumeBtnText: { color: '#9b59b6', ...Typography.body, fontWeight: '700' },
  addButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: 20 },
  addText: { color: Colors.background, ...Typography.body, fontWeight: '700' },
  emptyList: { flexGrow: 1 },
});
