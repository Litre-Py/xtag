import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationPreferences } from '../types/notification';
import { NotificationService } from '../services/NotificationService';

interface UserProfile {
  name: string;
  phone: string;
  avatar?: string;
}

interface AppContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
}

const AppContext = createContext<AppContextType>({
  profile: { name: '用户', phone: '13800138000' },
  updateProfile: () => {},
  preferences: {
    smsEnabled: true,
    phoneEnabled: true,
    wechatEnabled: true,
    pushEnabled: true,
    autoNotifyOnProximity: false,
  },
  updatePreferences: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({ name: '用户', phone: '13800138000' });
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    smsEnabled: true,
    phoneEnabled: true,
    wechatEnabled: true,
    pushEnabled: true,
    autoNotifyOnProximity: false,
  });

  useEffect(() => {
    NotificationService.getPreferences().then(setPreferences);
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const updatePreferences = async (prefs: Partial<NotificationPreferences>) => {
    const updated = await NotificationService.updatePreferences(prefs);
    setPreferences(updated);
  };

  return (
    <AppContext.Provider value={{ profile, updateProfile, preferences, updatePreferences }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
