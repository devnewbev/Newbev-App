const TZ_OFFSET = 7; // GMT+7

export function getNow(): Date {
  const now = new Date();
  return new Date(now.getTime() + TZ_OFFSET * 60 * 60 * 1000);
}

export function getTodayStr(): string {
  const d = getNow();
  return d.toISOString().split('T')[0];
}

export function getTimeStr(): string {
  return getNow().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
