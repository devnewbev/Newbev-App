export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'employee';
}

export interface Employee {
  id: number;
  userId: number | null;
  employeeCode: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  idCard: string;
  position: string;
  department: string;
  hireDate: string | null;
  baseSalary: number;
  status: string;
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

export interface WorkDay {
  id: number;
  userId: number;
  date: string;
  workMinutes: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  dayType: string;
  notes: string;
}

const SESSION_KEY = 'hrm_current_user';
let attendanceCache: { key: string; data: any; expiry: number } | null = null;

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
  attendanceCache = null;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

async function fetchCached(url: string, ttl = 3000): Promise<any> {
  if (attendanceCache && attendanceCache.key === url && Date.now() < attendanceCache.expiry) {
    return attendanceCache.data;
  }
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  attendanceCache = { key: url, data, expiry: Date.now() + ttl };
  return data;
}

function invalidateCache() { attendanceCache = null; }

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
  const data = await fetchCached(`/api/attendance?userId=${userId}`);
  return data || [];
}

export async function checkin(userId: number, photo: string): Promise<Attendance | null> {
  invalidateCache();
  const res = await fetch('/api/attendance/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, photo }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function checkout(userId: number, photo: string): Promise<Attendance | null> {
  invalidateCache();
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
  userId: number; startDate: string; endDate: string; leaveType: string; reason: string; days: number;
}): Promise<LeaveRequest | null> {
  const res = await fetch('/api/leaves', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateLeaveStatus(id: number, status: 'approved' | 'rejected'): Promise<void> {
  await fetch(`/api/leaves/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
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
  userId: number; date: string; reason: string; photo: string | null;
}): Promise<Explanation | null> {
  const res = await fetch('/api/explanations', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateExplanationStatus(id: number, status: 'approved' | 'rejected'): Promise<void> {
  await fetch(`/api/explanations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) return [];
  return res.json();
}

export async function createUser(data: { username: string; password: string; name: string; role: string }): Promise<User | null> {
  const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) return null;
  return res.json();
}

export async function updateUser(id: number, data: { name?: string; role?: string; password?: string }): Promise<boolean> {
  const res = await fetch(`/api/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.ok;
}

export async function deleteUser(id: number): Promise<boolean> {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function getEmployees(): Promise<Employee[]> {
  const res = await fetch('/api/employees');
  if (!res.ok) return [];
  return res.json();
}

export async function createEmployee(data: Omit<Employee, 'id'>): Promise<Employee | null> {
  const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) return null;
  return res.json();
}

export async function updateEmployee(id: number, data: Partial<Employee>): Promise<boolean> {
  const res = await fetch(`/api/employees/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.ok;
}

export async function deleteEmployee(id: number): Promise<boolean> {
  const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function getAttendanceReport(params: { fromDate?: string; toDate?: string }): Promise<any[]> {
  const q = new URLSearchParams();
  if (params.fromDate) q.set('fromDate', params.fromDate);
  if (params.toDate) q.set('toDate', params.toDate);
  const res = await fetch(`/api/attendance/report?${q}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getWorkDays(userId?: number): Promise<WorkDay[]> {
  const q = userId ? `?userId=${userId}` : '';
  const res = await fetch(`/api/work-days${q}`);
  if (!res.ok) return [];
  return res.json();
}

export async function calculateWorkDays(params: { fromDate: string; toDate: string }): Promise<{ message: string }> {
  const res = await fetch('/api/work-days/calculate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
  if (!res.ok) return { message: 'Lỗi' };
  return res.json();
}
