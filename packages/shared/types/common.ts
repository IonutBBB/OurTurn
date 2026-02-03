// Common types shared across entities

export interface DeviceToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  last_seen?: string;
}
