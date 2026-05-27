import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { AIService, ChatMessage } from '../services/AIService';
import { Colors, Typography, Spacing } from '../constants/theme';

const QUICK_PROMPTS = [
  '帮我写一段个人简介',
  '推荐适合程序员的简历写法',
  '附近有什么好吃的餐厅？',
  'UWB是什么技术？',
];

export function AIChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    AIService.init().then(() => {
      setMessages(AIService.getHistory());
    });
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await AIService.sendMessage(text.trim());
      setMessages(AIService.getHistory());
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    await AIService.clearHistory();
    setMessages([]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.message, item.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
      {item.role === 'assistant' && <Text style={styles.botAvatar}>🤖</Text>}
      <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, item.role === 'user' && styles.userMessageText]}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 AI 助手</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearBtn}>清空</Text>
        </TouchableOpacity>
      </View>

      {!AIService.hasApiKey() && (
        <View style={styles.noKeyBanner}>
          <Text style={styles.noKeyText}>⚠️ 请先在设置页面配置 OpenAI API Key</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.messageList}
        ListHeaderComponent={
          messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeIcon}>🤖</Text>
              <Text style={styles.welcomeTitle}>你好！我是 AI 助手</Text>
              <Text style={styles.welcomeDesc}>我可以帮你写简历、推荐餐厅、解答问题</Text>
              <View style={styles.quickPrompts}>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <TouchableOpacity key={i} style={styles.quickBtn} onPress={() => sendMessage(prompt)}>
                    <Text style={styles.quickText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>AI 正在思考...</Text>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="输入消息..."
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendText}>发送</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.text, ...Typography.subtitle, fontWeight: '700' },
  clearBtn: { color: Colors.accent, ...Typography.body },
  noKeyBanner: { backgroundColor: Colors.warning + '20', padding: Spacing.md, marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderRadius: 8 },
  noKeyText: { color: Colors.warning, ...Typography.caption },
  messageList: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  welcomeContainer: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  welcomeIcon: { fontSize: 48 },
  welcomeTitle: { color: Colors.text, ...Typography.subtitle, fontWeight: '700' },
  welcomeDesc: { color: Colors.textSecondary, ...Typography.body },
  quickPrompts: { gap: Spacing.sm, marginTop: Spacing.md, width: '100%' },
  quickBtn: { backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  quickText: { color: Colors.primary, ...Typography.body },
  message: { flexDirection: 'row', marginBottom: Spacing.md, gap: Spacing.sm },
  userMessage: { justifyContent: 'flex-end' },
  assistantMessage: { justifyContent: 'flex-start' },
  botAvatar: { fontSize: 24, marginTop: 4 },
  bubble: { maxWidth: '80%', padding: Spacing.md, borderRadius: 16 },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4 },
  messageText: { color: Colors.text, ...Typography.body, lineHeight: 22 },
  userMessageText: { color: Colors.background },
  typingIndicator: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs },
  typingText: { color: Colors.textMuted, ...Typography.caption, fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.surface, gap: Spacing.sm,
  },
  textInput: {
    flex: 1, backgroundColor: Colors.background, borderRadius: 20,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    color: Colors.text, ...Typography.body, maxHeight: 100,
    borderWidth: 1, borderColor: Colors.border,
  },
  sendBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: 20 },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: Colors.background, ...Typography.body, fontWeight: '700' },
});
