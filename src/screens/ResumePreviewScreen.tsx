import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { CardStackParamList } from '../types/navigation';
import { useCards } from '../hooks/useCards';
import { ResumeCard } from '../types/card';
import { MarkdownPreview } from '../components/MarkdownEditor';
import { Colors, Typography, Spacing } from '../constants/theme';

type Route = RouteProp<CardStackParamList, 'ResumePreview'>;

export function ResumePreviewScreen() {
  const route = useRoute<Route>();
  const { cards } = useCards();
  const card = cards.find((c) => c.id === route.params.cardId) as ResumeCard | undefined;

  if (!card) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>简历未找到</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{card.title}</Text>
        {card.skills && card.skills.length > 0 && (
          <View style={styles.skillsRow}>
            {card.skills.map((skill, i) => (
              <View key={i} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <MarkdownPreview content={card.markdown || ''} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  notFound: { color: Colors.textMuted, ...Typography.body, textAlign: 'center', marginTop: 60 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { color: Colors.text, ...Typography.title, marginBottom: Spacing.md },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  skillBadge: { backgroundColor: '#9b59b620', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: 12 },
  skillText: { color: '#9b59b6', ...Typography.caption, fontWeight: '600' },
});
