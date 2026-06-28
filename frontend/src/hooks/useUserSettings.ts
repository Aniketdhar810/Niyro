import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export interface UserSettings {
  connectedChannels?: {
    gmail?: boolean;
    telegram?: boolean;
    slack?: boolean;
  };
  notificationPrefs?: {
    riskAlerts?: boolean;
    dailyBriefing?: boolean;
    autonomousActions?: boolean;
  };
  workHours?: {
    start: string;
    end: string;
    timezone: string;
  };
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as UserSettings);
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), updates);
  };

  const toggleChannel = async (channel: 'gmail' | 'telegram' | 'slack', value: boolean, extraData?: string) => {
    if (!user) return;
    const updates: any = {
      [`connectedChannels.${channel}`]: value
    };
    if (channel === 'telegram' && value && extraData) {
      updates['integrations.telegram.chatId'] = extraData;
    } else if (channel === 'telegram' && !value) {
      updates['integrations.telegram.chatId'] = null;
    }
    await updateDoc(doc(db, 'users', user.uid), updates);
  };

  return { settings, loading, updateSettings, toggleChannel };
};
