import { useState, useEffect, useCallback } from 'react';
import { NotificationRecord, NotificationPreferences } from '../types/notification';
import { NotificationService } from '../services/NotificationService';

export function useNotifications() {
  const [history, setHistory] = useState<NotificationRecord[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    smsEnabled: true,
    phoneEnabled: true,
    wechatEnabled: true,
    pushEnabled: true,
    autoNotifyOnProximity: false,
  });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [h, p] = await Promise.all([NotificationService.getHistory(), NotificationService.getPreferences()]);
    setHistory(h.sort((a, b) => b.sentAt - a.sentAt));
    setPreferences(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const markRead = useCallback(async (id: string) => {
    await NotificationService.markAsRead(id);
    await reload();
  }, [reload]);

  const clearHistory = useCallback(async () => {
    await NotificationService.clearHistory();
    await reload();
  }, [reload]);

  const updatePrefs = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    const updated = await NotificationService.updatePreferences(prefs);
    setPreferences(updated);
  }, []);

  return { history, preferences, loading, markRead, clearHistory, updatePrefs, reload };
}
