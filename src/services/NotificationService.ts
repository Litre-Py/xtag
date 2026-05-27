import { Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationRecord, NotificationChannel, NotificationPreferences } from '../types/notification';
import { NOTIFICATION_STORAGE_KEY, SETTINGS_STORAGE_KEY } from '../constants/config';
import { getStorage, setStorage, addOne, updateOne } from '../utils/storage';
import { generateId } from '../utils/uuid';

class NotificationServiceImpl {
  async sendSMS(phone: string, message: string): Promise<NotificationRecord> {
    const record = await this.logNotification({
      channel: NotificationChannel.SMS,
      title: '发送短信',
      body: `发送至 ${phone}: ${message}`,
      success: true,
    });
    try {
      const url = Platform.OS === 'ios'
        ? `sms:${phone}&body=${encodeURIComponent(message)}`
        : `sms:${phone}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(url);
    } catch (e) {
      await this.logNotification({
        channel: NotificationChannel.SMS,
        title: '短信发送失败',
        body: String(e),
        success: false,
        error: String(e),
      });
    }
    return record;
  }

  async makePhoneCall(phone: string): Promise<void> {
    await this.logNotification({
      channel: NotificationChannel.PHONE,
      title: '拨打电话',
      body: `正在呼叫 ${phone}`,
      success: true,
    });
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (e) {
      console.warn('拨打电话失败:', e);
    }
  }

  async openEmail(email: string, subject?: string, body?: string): Promise<void> {
    await this.logNotification({
      channel: NotificationChannel.EMAIL,
      title: '发送邮件',
      body: `发送至 ${email}`,
      success: true,
    });
    try {
      let url = `mailto:${email}`;
      const params: string[] = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      if (params.length) url += `?${params.join('&')}`;
      await Linking.openURL(url);
    } catch (e) {
      await this.logNotification({
        channel: NotificationChannel.EMAIL,
        title: '发送邮件失败',
        body: String(e),
        success: false,
        error: String(e),
      });
    }
  }

  async openWeChat(wechatId?: string): Promise<void> {
    await this.logNotification({
      channel: NotificationChannel.WECHAT,
      title: '微信通知',
      body: wechatId ? `打开微信联系 ${wechatId}` : '打开微信',
      success: true,
    });
    try {
      await Linking.openURL('weixin://');
    } catch (e) {
      await this.logNotification({
        channel: NotificationChannel.WECHAT,
        title: '打开微信失败',
        body: '请确认已安装微信',
        success: false,
        error: '未安装微信',
      });
    }
  }

  async openAlipay(): Promise<void> {
    await this.logNotification({
      channel: NotificationChannel.ALIPAY,
      title: '支付宝支付',
      body: '打开支付宝',
      success: true,
    });
    try {
      await Linking.openURL('alipay://');
    } catch (e) {
      await this.logNotification({
        channel: NotificationChannel.ALIPAY,
        title: '打开支付宝失败',
        body: '请确认已安装支付宝',
        success: false,
        error: '未安装支付宝',
      });
    }
  }

  async openWeChatPay(): Promise<void> {
    await this.logNotification({
      channel: NotificationChannel.WECHAT_PAY,
      title: '微信支付',
      body: '打开微信支付',
      success: true,
    });
    try {
      await Linking.openURL('weixin://dl/businessPay');
    } catch (e) {
      await this.logNotification({
        channel: NotificationChannel.WECHAT_PAY,
        title: '微信支付失败',
        body: '请确认已安装微信',
        success: false,
        error: '未安装微信',
      });
    }
  }

  async openDouyin(userId?: string): Promise<void> {
    await this.logNotification({
      channel: NotificationChannel.DOUYIN,
      title: '打开抖音',
      body: userId ? `查看抖音主页: ${userId}` : '打开抖音',
      success: true,
    });
    try {
      const url = userId
        ? `snssdk1128://user/profile/${userId}`
        : 'snssdk1128://';
      await Linking.openURL(url);
    } catch (e) {
      await this.logNotification({
        channel: NotificationChannel.DOUYIN,
        title: '打开抖音失败',
        body: '请确认已安装抖音',
        success: false,
        error: '未安装抖音',
      });
    }
  }

  async openXiaohongshu(userId?: string): Promise<void> {
    await this.logNotification({
      channel: NotificationChannel.XIAOHONGSHU,
      title: '打开小红书',
      body: userId ? `查看小红书主页: ${userId}` : '打开小红书',
      success: true,
    });
    try {
      const url = userId
        ? `xhsdiscover://user/profile/${userId}`
        : 'xhsdiscover://';
      await Linking.openURL(url);
    } catch (e) {
      await this.logNotification({
        channel: NotificationChannel.XIAOHONGSHU,
        title: '打开小红书失败',
        body: '请确认已安装小红书',
        success: false,
        error: '未安装小红书',
      });
    }
  }

  async openWeibo(userId?: string): Promise<void> {
    await this.logNotification({
      channel: NotificationChannel.WEIBO,
      title: '打开微博',
      body: userId ? `查看微博主页: ${userId}` : '打开微博',
      success: true,
    });
    try {
      const url = userId
        ? `sinaweibo://userprofile?uid=${userId}`
        : 'sinaweibo://';
      await Linking.openURL(url);
    } catch (e) {
      await this.logNotification({
        channel: NotificationChannel.WEIBO,
        title: '打开微博失败',
        body: '请确认已安装微博',
        success: false,
        error: '未安装微博',
      });
    }
  }

  async openQQ(qqNumber?: string): Promise<void> {
    await this.logNotification({
      channel: NotificationChannel.QQ,
      title: '打开QQ',
      body: qqNumber ? `打开QQ联系 ${qqNumber}` : '打开QQ',
      success: true,
    });
    try {
      const url = qqNumber
        ? `mqq://im/chat?chat_type=wpa&uin=${qqNumber}`
        : 'mqq://';
      await Linking.openURL(url);
    } catch (e) {
      await this.logNotification({
        channel: NotificationChannel.QQ,
        title: '打开QQ失败',
        body: '请确认已安装QQ',
        success: false,
        error: '未安装QQ',
      });
    }
  }

  async openBilibili(userId?: string): Promise<void> {
    await this.logNotification({
      channel: NotificationChannel.BILIBILI,
      title: '打开B站',
      body: userId ? `查看B站主页: ${userId}` : '打开B站',
      success: true,
    });
    try {
      const url = userId
        ? `bilibili://space/${userId}`
        : 'bilibili://';
      await Linking.openURL(url);
    } catch (e) {
      await this.logNotification({
        channel: NotificationChannel.BILIBILI,
        title: '打开B站失败',
        body: '请确认已安装B站',
        success: false,
        error: '未安装B站',
      });
    }
  }

  async sendInAppNotification(title: string, body: string): Promise<NotificationRecord> {
    const record = await this.logNotification({
      channel: NotificationChannel.IN_APP,
      title,
      body,
      success: true,
    });
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null,
      });
    } catch (e) {
      console.warn('通知发送失败:', e);
    }
    return record;
  }

  async logNotification(data: Omit<NotificationRecord, 'id' | 'sentAt'>): Promise<NotificationRecord> {
    const record: NotificationRecord = {
      ...data,
      id: generateId(),
      sentAt: Date.now(),
    };
    await addOne(NOTIFICATION_STORAGE_KEY, record);
    return record;
  }

  async getHistory(): Promise<NotificationRecord[]> {
    return getStorage<NotificationRecord>(NOTIFICATION_STORAGE_KEY);
  }

  async markAsRead(id: string): Promise<void> {
    await updateOne<NotificationRecord>(NOTIFICATION_STORAGE_KEY, id, { read: true });
  }

  async clearHistory(): Promise<void> {
    await setStorage(NOTIFICATION_STORAGE_KEY, []);
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const items = await getStorage<NotificationPreferences>(SETTINGS_STORAGE_KEY);
    return items[0] || {
      smsEnabled: true,
      phoneEnabled: true,
      wechatEnabled: true,
      pushEnabled: true,
      autoNotifyOnProximity: false,
    };
  }

  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = await this.getPreferences();
    const updated = { ...current, ...prefs };
    await setStorage(SETTINGS_STORAGE_KEY, [updated]);
    return updated;
  }
}

export const NotificationService = new NotificationServiceImpl();
