import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../hooks/useNotifications';
import { AIService } from '../services/AIService';
import { Colors, Typography, Spacing } from '../constants/theme';

export function SettingsScreen() {
  const { profile, updateProfile } = useApp();
  const { preferences, updatePrefs } = useNotifications();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    AIService.init().then(() => setApiKey(AIService.getApiKey()));
  }, []);

  const handleSaveProfile = () => {
    updateProfile({ name: name.trim(), phone: phone.trim() });
    Alert.alert('成功', '个人资料已更新');
  };

  const handleSaveApiKey = async () => {
    await AIService.setApiKey(apiKey.trim());
    Alert.alert('成功', 'API Key 已保存');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>设置</Text>

      <Text style={styles.sectionTitle}>个人资料</Text>
      <View style={styles.card}>
        <Text style={styles.label}>姓名</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="输入姓名"
          placeholderTextColor={Colors.textMuted}
        />
        <Text style={styles.label}>电话</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="输入电话号码"
          placeholderTextColor={Colors.textMuted}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
          <Text style={styles.saveBtnText}>保存</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>AI 设置</Text>
      <View style={styles.card}>
        <Text style={styles.label}>OpenAI API Key</Text>
        <View style={styles.keyRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            placeholderTextColor={Colors.textMuted}
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowKey(!showKey)} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>{showKey ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveApiKey}>
          <Text style={styles.saveBtnText}>保存 API Key</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>用于 AI 助手对话和简历智能生成。Key 仅保存在本地设备。</Text>
      </View>

      <Text style={styles.sectionTitle}>通知偏好</Text>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>短信通知</Text>
          <Switch value={preferences.smsEnabled} onValueChange={(v) => updatePrefs({ smsEnabled: v })} trackColor={{ false: Colors.border, true: Colors.primary }} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>电话通知</Text>
          <Switch value={preferences.phoneEnabled} onValueChange={(v) => updatePrefs({ phoneEnabled: v })} trackColor={{ false: Colors.border, true: Colors.primary }} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>微信通知</Text>
          <Switch value={preferences.wechatEnabled} onValueChange={(v) => updatePrefs({ wechatEnabled: v })} trackColor={{ false: Colors.border, true: Colors.primary }} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>推送通知</Text>
          <Switch value={preferences.pushEnabled} onValueChange={(v) => updatePrefs({ pushEnabled: v })} trackColor={{ false: Colors.border, true: Colors.primary }} />
        </View>
        <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.toggleLabel}>近场自动通知</Text>
          <Switch value={preferences.autoNotifyOnProximity} onValueChange={(v) => updatePrefs({ autoNotifyOnProximity: v })} trackColor={{ false: Colors.border, true: Colors.primary }} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>关于</Text>
      <View style={styles.card}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>版本</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.aboutLabel}>技术栈</Text>
          <Text style={styles.aboutValue}>React Native + Expo + GPT</Text>
        </View>
      </View>

      <Text style={styles.footer}>UWB Card - 近场卡片共享</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: { color: Colors.text, ...Typography.title, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.lg },
  sectionTitle: { color: Colors.textSecondary, ...Typography.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  card: { backgroundColor: Colors.surface, marginHorizontal: Spacing.lg, borderRadius: 12, padding: Spacing.lg },
  label: { color: Colors.textSecondary, ...Typography.caption, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  input: { backgroundColor: Colors.background, borderRadius: 8, padding: Spacing.md, color: Colors.text, ...Typography.body, borderWidth: 1, borderColor: Colors.border },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 8, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.lg },
  saveBtnText: { color: Colors.background, ...Typography.body, fontWeight: '700' },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  eyeBtn: { padding: Spacing.md },
  eyeText: { fontSize: 18 },
  hint: { color: Colors.textMuted, ...Typography.small, marginTop: Spacing.sm },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  toggleLabel: { color: Colors.text, ...Typography.body },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  aboutLabel: { color: Colors.textSecondary, ...Typography.body },
  aboutValue: { color: Colors.text, ...Typography.body },
  footer: { color: Colors.textMuted, ...Typography.caption, textAlign: 'center', marginTop: Spacing.xxl },
});
