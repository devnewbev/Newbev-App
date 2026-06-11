const TZ = 'Asia/Ho_Chi_Minh';

export function getTodayStr(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

export function getTimeStr(): string {
  return new Date().toLocaleTimeString('en-US', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
}
