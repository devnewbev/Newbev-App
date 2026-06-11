export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'employee';
}

export interface Attendance {
  id: number;
  userId: number;
  date: string;
  checkinTime: string | null;
  checkoutTime: string | null;
  checkinPhoto: string | null;
  checkoutPhoto: string | null;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  days: number;
  createdAt: string;
}

export interface Explanation {
  id: number;
  userId: number;
  date: string;
  reason: string;
  photo: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const DEFAULT_USERS: User[] = [
  { id: 1, username: 'admin', password: '1234', name: 'Admin', role: 'admin' },
  { id: 2, username: 'user', password: '1234', name: 'Nhân Viên', role: 'employee' },
];

const STORAGE_KEYS = {
  users: 'hrm_users',
  attendance: 'hrm_attendance',
  leaves: 'hrm_leaves',
  explanations: 'hrm_explanations',
  currentUser: 'hrm_current_user',
};

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function initStore() {
  const existing = getItem<User[]>(STORAGE_KEYS.users, []);
  if (existing.length === 0) {
    setItem(STORAGE_KEYS.users, DEFAULT_USERS);
  }
}

export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.users, DEFAULT_USERS);
}

export function authenticate(username: string, password: string): User | null {
  const users = getItem<User[]>(STORAGE_KEYS.users, DEFAULT_USERS);
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    setItem(STORAGE_KEYS.currentUser, user);
    return user;
  }
  return null;
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

export function getCurrentUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.currentUser, null);
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function getAttendance(): Attendance[] {
  return getItem<Attendance[]>(STORAGE_KEYS.attendance, []);
}

export function getAttendanceByUser(userId: number): Attendance[] {
  return getAttendance().filter(a => a.userId === userId);
}

export function getTodayAttendance(userId: number): Attendance | null {
  const today = new Date().toISOString().split('T')[0];
  return getAttendance().find(a => a.userId === userId && a.date === today) || null;
}

export function checkin(userId: number, photo: string): Attendance {
  const list = getAttendance();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const existing = list.findIndex(a => a.userId === userId && a.date === today);
  const record: Attendance = {
    id: Date.now(),
    userId,
    date: today,
    checkinTime: now,
    checkoutTime: null,
    checkinPhoto: photo,
    checkoutPhoto: null,
  };
  if (existing >= 0) {
    list[existing] = { ...list[existing], checkinTime: now, checkinPhoto: photo };
  } else {
    list.push(record);
  }
  setItem(STORAGE_KEYS.attendance, list);
  return existing >= 0 ? list[existing] : record;
}

export function checkout(userId: number, photo: string): Attendance | null {
  const list = getAttendance();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const idx = list.findIndex(a => a.userId === userId && a.date === today);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], checkoutTime: now, checkoutPhoto: photo };
  setItem(STORAGE_KEYS.attendance, list);
  return list[idx];
}

export function getLeaves(): LeaveRequest[] {
  return getItem<LeaveRequest[]>(STORAGE_KEYS.leaves, []);
}

export function getLeavesByUser(userId: number): LeaveRequest[] {
  return getLeaves().filter(l => l.userId === userId);
}

export function createLeave(leave: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): LeaveRequest {
  const list = getLeaves();
  const record: LeaveRequest = {
    ...leave,
    id: Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  list.push(record);
  setItem(STORAGE_KEYS.leaves, list);
  return record;
}

export function updateLeaveStatus(id: number, status: 'approved' | 'rejected'): LeaveRequest | null {
  const list = getLeaves();
  const idx = list.findIndex(l => l.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], status };
  setItem(STORAGE_KEYS.leaves, list);
  return list[idx];
}

export function getExplanations(): Explanation[] {
  return getItem<Explanation[]>(STORAGE_KEYS.explanations, []);
}

export function getExplanationsByUser(userId: number): Explanation[] {
  return getExplanations().filter(e => e.userId === userId);
}

export function createExplanation(exp: Omit<Explanation, 'id' | 'status' | 'createdAt'>): Explanation {
  const list = getExplanations();
  const record: Explanation = {
    ...exp,
    id: Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  list.push(record);
  setItem(STORAGE_KEYS.explanations, list);
  return record;
}

export function updateExplanationStatus(id: number, status: 'approved' | 'rejected'): Explanation | null {
  const list = getExplanations();
  const idx = list.findIndex(e => e.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], status };
  setItem(STORAGE_KEYS.explanations, list);
  return list[idx];
}
