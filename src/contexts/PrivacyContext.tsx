import React from 'react';
import { useSettings } from './SettingsContext';

export type StatusAudience = 'contacts' | 'except' | 'only';

export const usePrivacySettings = () => {
  const { values, setValue } = useSettings();
  return {
    hideOnline: !!values.hideOnline,
    hideTyping: !!values.hideTyping,
    hideRecording: !!values.hideRecording,
    hideReadReceipts: !!values.hideReadReceipts,
    hideDeliveryReceipts: !!values.hideDeliveryReceipts,
    hideStatusViews: !!values.hideStatusViews,
    antiDeleteMessages: !!values.antiDeleteMessages,
    antiDeleteStatus: !!values.antiDeleteStatus,
    chatLock: !!values.chatLock,
    statusAudience: (String(values.statusAudience || 'contacts') as StatusAudience),
    statusAudienceList: String(values.statusAudienceList || ''),
    setStatusAudience: (value: StatusAudience) => setValue('statusAudience', value),
    setStatusAudienceList: (value: string) => setValue('statusAudienceList', value),
    setPrivacy: (key: string, value: boolean) => setValue(key, value),
  };
};
export const PrivacyProvider: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>;
