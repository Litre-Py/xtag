import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CardStackParamList } from '../types/navigation';
import { useCards } from '../hooks/useCards';
import { ResumeCard, CardType } from '../types/card';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { AIService } from '../services/AIService';
import { Colors, Typography, Spacing } from '../constants/theme';

type Route = RouteProp<CardStackParamList, 'ResumeEditor'>;

const DEFAULT_MARKDOWN = `# 个人简历

## 基本信息
- **姓名**: 请填写
- **电话**: 请填写
- **邮箱**: 请填写

## 专业技能
- 技能1
- 技能2
- 技能3

## 工作经历
### 公司名称 | 职位
*2020 - 至今*
- 工作内容描述

## 教育背景
### 学校名称 | 专业
*2016 - 2020*

## 项目经验
### 项目名称
- 项目描述
- 个人职责
- 项目成果
`;

export function ResumeEditorScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { cards, create, update } = useCards();
  const editingId = route.params?.cardId;
  const existingCard = editingId ? cards.find((c) => c.id === editingId) as ResumeCard | undefined : null;

  const [title, setTitle] = useState('');
  const [position, setPosition] = useState('');
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [skills, setSkills] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (existingCard) {
      setTitle(existingCard.title);
      setMarkdown(existingCard.markdown || DEFAULT_MARKDOWN);
      setSkills(existingCard.skills?.join(', ') || '');
    }
    navigation.setOptions({ title: editingId ? '编辑简历' : '新建简历' });
  }, [editingId]);

  const handleAIGenerate = async () => {
    if (!AIService.hasApiKey()) {
      Alert.alert('提示', '请先在设置中配置 OpenAI API Key');
      return;
    }
    if (!title.trim()) {
      Alert.alert('提示', '请先输入简历标题（包含姓名）');
      return;
    }
    setGenerating(true);
    try {
      const result = await AIService.generateResume({
        name: title.split('-')[0].trim() || title,
        position: position || '未知职位',
        skills: skills.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
        experience: '',
      });
      if (result) {
        setMarkdown(result);
        Alert.alert('成功', 'AI 已生成简历内容，可自行修改');
      } else {
        Alert.alert('失败', '生成失败，请检查 API Key 是否正确');
      }
    } catch (e) {
      Alert.alert('错误', '生成过程出错');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入简历标题');
      return;
    }
    const data: any = {
      type: CardType.RESUME,
      title: title.trim(),
      fields: [
        { key: 'name', label: '姓名', value: title.trim(), icon: '👤' },
      ],
      color: '#9b59b6',
      isActive: true,
      isDefault: false,
      markdown,
      skills: skills.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      experience: '',
      education: '',
    };
    if (editingId) {
      await update(editingId, data);
    } else {
      await create(data);
    }
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>简历标题</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="例如: 前端工程师 - 张三"
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.sectionTitle}>目标职位</Text>
      <TextInput
        style={styles.input}
        value={position}
        onChangeText={setPosition}
        placeholder="例如: 高级前端工程师"
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.sectionTitle}>专业技能</Text>
      <TextInput
        style={styles.input}
        value={skills}
        onChangeText={setSkills}
        placeholder="用逗号分隔，如: React, TypeScript, Node.js"
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.sectionTitle}>简历内容 (Markdown)</Text>
      <MarkdownEditor
        value={markdown}
        onChangeText={setMarkdown}
        height={400}
      />

      <TouchableOpacity
        style={[styles.aiButton, generating && styles.aiButtonDisabled]}
        onPress={handleAIGenerate}
        disabled={generating}
      >
        {generating ? (
          <ActivityIndicator color={Colors.text} />
        ) : (
          <Text style={styles.aiButtonText}>🤖 AI 智能生成简历</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>{editingId ? '保存修改' : '创建简历'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 60 },
  sectionTitle: { color: Colors.textSecondary, ...Typography.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surface, borderRadius: 10, padding: Spacing.md, color: Colors.text, ...Typography.body, borderWidth: 1, borderColor: Colors.border },
  aiButton: { backgroundColor: '#10a37f', borderRadius: 12, padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.xl },
  aiButtonDisabled: { opacity: 0.6 },
  aiButtonText: { color: Colors.text, ...Typography.subtitle, fontWeight: '700' },
  saveButton: { backgroundColor: '#9b59b6', borderRadius: 12, padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.md },
  saveText: { color: Colors.text, ...Typography.subtitle, fontWeight: '700' },
});
