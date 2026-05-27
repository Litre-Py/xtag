import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { UWBDevice } from '../types/device';
import { Card } from '../types/card';
import { CardView } from './CardView';
import { ActionButton } from './ActionButton';
import { Colors, Typography, Spacing } from '../constants/theme';
import { NotificationService } from '../services/NotificationService';

interface ProximityPopupProps {
  device: UWBDevice;
  card: Card;
  onDismiss: () => void;
}

const { height } = Dimensions.get('window');

export function ProximityPopup({ device, card, onDismiss }: ProximityPopupProps) {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 15 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(onDismiss, 15000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: height, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onDismiss);
  };

  const phoneField = card.fields.find((f) => f.actionType === 'phone');
  const wechatField = card.fields.find((f) => f.actionType === 'wechat');
  const douyinField = card.fields.find((f) => f.actionType === 'douyin');
  const xhsField = card.fields.find((f) => f.actionType === 'xiaohongshu');
  const weiboField = card.fields.find((f) => f.actionType === 'weibo');

  const handleCall = () => {
    if (phoneField) NotificationService.makePhoneCall(phoneField.value);
  };
  const handleSMS = () => {
    if (phoneField) NotificationService.sendSMS(phoneField.value, `你好，我在你附近，来自 ${device.name}`);
  };
  const handleWeChat = () => {
    NotificationService.openWeChat(wechatField?.value);
  };
  const handleNotify = async () => {
    await NotificationService.sendInAppNotification(
      '新卡片通知',
      `收到来自 ${device.name} 的卡片信息`
    );
    handleDismiss();
  };
  const handleDouyin = () => NotificationService.openDouyin(douyinField?.value);
  const handleXiaohongshu = () => NotificationService.openXiaohongshu(xhsField?.value);
  const handleWeibo = () => NotificationService.openWeibo(weiboField?.value);

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity }]} />
      <Animated.View style={[styles.popup, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>检测到附近设备</Text>
        <Text style={styles.deviceName}>{device.name}</Text>

        <CardView card={card} />

        <View style={styles.actions}>
          <ActionButton icon="📞" label="电话" color={Colors.success} onPress={handleCall} />
          <ActionButton icon="💬" label="短信" color={Colors.primary} onPress={handleSMS} />
          <ActionButton icon="📱" label="微信" color={Colors.success} onPress={handleWeChat} />
          <ActionButton icon="🔔" label="通知" color={Colors.warning} onPress={handleNotify} />
        </View>
        <View style={[styles.actions, { marginTop: Spacing.sm }]}>
          <ActionButton icon="🎵" label="抖音" color="#000000" onPress={handleDouyin} />
          <ActionButton icon="📕" label="小红书" color="#ff2442" onPress={handleXiaohongshu} />
          <ActionButton icon="🔴" label="微博" color="#ff8200" onPress={handleWeibo} />
        </View>

        <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
          <Text style={styles.dismissText}>关闭</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  popup: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.textSecondary,
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  deviceName: {
    color: Colors.primary,
    ...Typography.subtitle,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  dismissText: {
    color: Colors.textMuted,
    ...Typography.body,
  },
});
