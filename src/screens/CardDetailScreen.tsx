import React from 'react';
import { View, ScrollView, Text, StyleSheet, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../types/navigation';
import { useCards } from '../hooks/useCards';
import { Card, CardType, ParkingCard } from '../types/card';
import { CardView } from '../components/CardView';
import { ActionButton } from '../components/ActionButton';
import { Colors, Typography, Spacing } from '../constants/theme';
import { NotificationService } from '../services/NotificationService';

type Route = RouteProp<HomeStackParamList, 'CardDetail'>;

export function CardDetailScreen() {
  const route = useRoute<Route>();
  const { cards } = useCards();
  const card = cards.find((c) => c.id === route.params.cardId);

  if (!card) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>卡片未找到</Text>
      </View>
    );
  }

  const phoneField = card.fields.find((f) => f.actionType === 'phone');
  const emailField = card.fields.find((f) => f.actionType === 'email');
  const wechatField = card.fields.find((f) => f.actionType === 'wechat');
  const douyinField = card.fields.find((f) => f.actionType === 'douyin');
  const xhsField = card.fields.find((f) => f.actionType === 'xiaohongshu');
  const weiboField = card.fields.find((f) => f.actionType === 'weibo');
  const qqField = card.fields.find((f) => f.actionType === 'qq');
  const biliField = card.fields.find((f) => f.actionType === 'bilibili');

  const handleCall = () => {
    if (phoneField) {
      NotificationService.makePhoneCall(phoneField.value);
    } else {
      Alert.alert('提示', '此卡片没有电话号码');
    }
  };

  const handleSMS = () => {
    if (phoneField) {
      NotificationService.sendSMS(phoneField.value, `你好，来自UWB Card用户的消息`);
    } else {
      Alert.alert('提示', '此卡片没有电话号码');
    }
  };

  const handleWeChat = () => {
    NotificationService.openWeChat(wechatField?.value);
  };

  const handleNotify = async () => {
    await NotificationService.sendInAppNotification(
      '卡片通知',
      `已向 ${card.title} 的车主发送通知`
    );
    Alert.alert('成功', '通知已发送');
  };

  const handleEmail = () => {
    if (emailField) {
      NotificationService.openEmail(emailField.value, `来自UWB Card用户的消息`);
    } else {
      Alert.alert('提示', '此卡片没有邮箱地址');
    }
  };
  const handleAlipay = () => NotificationService.openAlipay();
  const handleWeChatPay = () => NotificationService.openWeChatPay();
  const handleDouyin = () => NotificationService.openDouyin(douyinField?.value);
  const handleXiaohongshu = () => NotificationService.openXiaohongshu(xhsField?.value);
  const handleWeibo = () => NotificationService.openWeibo(weiboField?.value);
  const handleQQ = () => NotificationService.openQQ(qqField?.value);
  const handleBilibili = () => NotificationService.openBilibili(biliField?.value);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CardView card={card} />

      <View style={styles.actionsSection}>
        <Text style={styles.actionsTitle}>通讯</Text>
        <View style={styles.actionsGrid}>
          <ActionButton icon="📞" label="电话" color={Colors.success} onPress={handleCall} />
          <ActionButton icon="💬" label="短信" color={Colors.primary} onPress={handleSMS} />
          <ActionButton icon="📧" label="邮件" color="#ea4335" onPress={handleEmail} />
          <ActionButton icon="📱" label="微信" color={Colors.success} onPress={handleWeChat} />
        </View>
        <View style={[styles.actionsGrid, { marginTop: Spacing.sm }]}>
          <ActionButton icon="🔔" label="通知" color={Colors.warning} onPress={handleNotify} />
        </View>

        <Text style={[styles.actionsTitle, { marginTop: Spacing.lg }]}>支付</Text>
        <View style={styles.actionsGrid}>
          <ActionButton icon="💰" label="支付宝" color="#1677ff" onPress={handleAlipay} />
          <ActionButton icon="💳" label="微信支付" color={Colors.success} onPress={handleWeChatPay} />
        </View>

        <Text style={[styles.actionsTitle, { marginTop: Spacing.lg }]}>社交平台</Text>
        <View style={styles.actionsGrid}>
          <ActionButton icon="🎵" label="抖音" color="#000000" onPress={handleDouyin} />
          <ActionButton icon="📕" label="小红书" color="#ff2442" onPress={handleXiaohongshu} />
          <ActionButton icon="🔴" label="微博" color="#ff8200" onPress={handleWeibo} />
        </View>
        <View style={[styles.actionsGrid, { marginTop: Spacing.sm }]}>
          <ActionButton icon="🐧" label="QQ" color="#12b7f5" onPress={handleQQ} />
          <ActionButton icon="📺" label="B站" color="#fb7299" onPress={handleBilibili} />
        </View>
      </View>

      {card.type === CardType.PARKING && (
        <View style={styles.parkingActions}>
          <Text style={styles.actionsTitle}>车主操作</Text>
          <ActionButton
            icon="📍"
            label="发送位置"
            color={Colors.primary}
            onPress={() => Alert.alert('提示', '位置已发送给车主')}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  notFound: { color: Colors.textMuted, ...Typography.body, textAlign: 'center', marginTop: 60 },
  actionsSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  actionsTitle: { color: Colors.textSecondary, ...Typography.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md },
  actionsGrid: { flexDirection: 'row', gap: Spacing.sm },
  parkingActions: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
});
