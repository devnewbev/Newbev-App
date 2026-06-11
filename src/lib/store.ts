export interface User {
  id: number;
  username: string;
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
  userName?: string;
}

export interface Explanation {
  id: number;
  userId: number;
  date: string;
  reason: string;
  photo: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  userName?: string;
}

const SESSION_KEY = 'hrm_current_user';

export function saveSession(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export async function authenticate(username: string, password: string): Promise<User | null> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return null;
  const user: User = await res.json();
  saveSession(user);
  return user;
}

export async function getTodayAttendance(userId: number): Promise<Attendance | null> {
  const res = await fetch(`/api/attendance?today=${userId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getAttendanceByUser(userId: number): Promise<Attendance[]> {
  const res = await fetch(`/api/attendance?userId=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function checkin(userId: number, photo: string): Promise<Attendance | null> {
  const res = await fetch('/api/attendance/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, photo }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function checkout(userId: number, photo: string): Promise<Attendance | null> {
  const res = await fetch('/api/attendance/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, photo }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getLeavesByUser(userId: number): Promise<LeaveRequest[]> {
  const res = await fetch(`/api/leaves?userId=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getLeaves(): Promise<LeaveRequest[]> {
  const res = await fetch('/api/leaves?all=1');
  if (!res.ok) return [];
  return res.json();
}

export async function createLeave(data: {
  userId: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  days: number;
}): Promise<LeaveRequest | null> {
  const res = await fetch('/api/leaves', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateLeaveStatus(id: number, status: 'approved' | 'rejected'): Promise<void> {
  await fetch(`/api/leaves/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function getExplanationsByUser(userId: number): Promise<Explanation[]> {
  const res = await fetch(`/api/explanations?userId=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getExplanations(): Promise<Explanation[]> {
  const res = await fetch('/api/explanations?all=1');
  if (!res.ok) return [];
  return res.json();
}

export async function createExplanation(data: {
  userId: number;
  date: string;
  reason: string;
  photo: string | null;
}): Promise<Explanation | null> {
  const res = await fetch('/api/explanations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateExplanationStatus(id: number, status: 'approved' | 'rejected'): Promise<void> {
  await fetch(`/api/explanations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) return [];
  return res.json();
}
