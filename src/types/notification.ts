export enum NotificationChannel {
  SMS = 'sms',
  PHONE = 'phone',
  WECHAT = 'wechat',
  EMAIL = 'email',
  IN_APP = 'in_app',
  PUSH = 'push',
  ALIPAY = 'alipay',
  WECHAT_PAY = 'wechat_pay',
  DOUYIN = 'douyin',
  XIAOHONGSHU = 'xiaohongshu',
  WEIBO = 'weibo',
  QQ = 'qq',
  BILIBILI = 'bilibili',
}

export interface NotificationRecord {
  id: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  recipientId?: string;
  cardId?: string;
  deviceId?: string;
  sentAt: number;
  read?: boolean;
  success: boolean;
  error?: string;
}

export interface NotificationPreferences {
  smsEnabled: boolean;
  phoneEnabled: boolean;
  wechatEnabled: boolean;
  pushEnabled: boolean;
  autoNotifyOnProximity: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
