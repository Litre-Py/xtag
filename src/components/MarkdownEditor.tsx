import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Colors, Typography, Spacing } from '../constants/theme';

interface MarkdownEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  height?: number;
}

export function MarkdownEditor({ value, onChangeText, height = 300 }: MarkdownEditorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Markdown 编辑器</Text>
        <Text style={styles.charCount}>{value.length} 字</Text>
      </View>
      <TextInput
        style={[styles.input, { height }]}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
        placeholder="# 输入 Markdown 内容&#10;&#10;支持标题、列表、粗体、斜体等格式"
        placeholderTextColor={Colors.textMuted}
      />
    </View>
  );
}

interface MarkdownPreviewProps {
  content: string;
}

const markdownStyles = {
  body: { color: Colors.text, fontSize: 15, lineHeight: 24 },
  heading1: { color: Colors.primary, fontSize: 24, fontWeight: '700' as const, marginVertical: 12 },
  heading2: { color: Colors.primary, fontSize: 20, fontWeight: '700' as const, marginVertical: 10 },
  heading3: { color: Colors.primary, fontSize: 17, fontWeight: '600' as const, marginVertical: 8 },
  paragraph: { color: Colors.text, marginVertical: 6 },
  link: { color: Colors.primary },
  code_inline: { backgroundColor: Colors.surfaceHighlight, color: Colors.primary, paddingHorizontal: 4, borderRadius: 4 },
  code_block: { backgroundColor: Colors.surfaceHighlight, color: Colors.text, padding: 12, borderRadius: 8, marginVertical: 8 },
  list_item: { color: Colors.text, marginVertical: 2 },
  bullet_list: { marginVertical: 8 },
  ordered_list: { marginVertical: 8 },
  strong: { fontWeight: '700' as const, color: Colors.text },
  em: { fontStyle: 'italic' as const, color: Colors.textSecondary },
  hr: { backgroundColor: Colors.border, height: 1, marginVertical: 12 },
  blockquote: { borderLeftColor: Colors.primary, borderLeftWidth: 3, paddingLeft: 12, marginVertical: 8 },
};

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <View style={styles.emptyPreview}>
        <Text style={styles.emptyText}>暂无内容</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.previewContainer} contentContainerStyle={styles.previewContent}>
      <Markdown style={markdownStyles}>{content}</Markdown>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toolbarTitle: { color: Colors.textSecondary, ...Typography.caption, fontWeight: '600' },
  charCount: { color: Colors.textMuted, ...Typography.small },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    color: Colors.text,
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewContainer: { maxHeight: 500 },
  previewContent: { padding: Spacing.md },
  emptyPreview: { padding: Spacing.xxl, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, ...Typography.body },
});
