'use client';
import { useEffect, useState } from 'react';
import { getCurrentUser, getAttendanceByUser, getLeavesByUser, getExplanationsByUser, User } from '@/lib/store';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ totalDays: 0, lateDays: 0, pendingLeaves: 0, pendingExplanations: 0 });

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    const attendance = getAttendanceByUser(u.id);
    const leaves = getLeavesByUser(u.id);
    const explanations = getExplanationsByUser(u.id);
    setStats({
      totalDays: attendance.filter(a => a.checkinTime).length,
      lateDays: attendance.filter(a => a.checkinTime && a.checkinTime > '08:00').length,
      pendingLeaves: leaves.filter(l => l.status === 'pending').length,
      pendingExplanations: explanations.filter(e => e.status === 'pending').length,
    });
  }, []);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Xin chào, {user.name}!</h1>
      <p className="text-gray-500 mb-6">Tổng quan hoạt động của bạn</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalDays}</p>
          <p className="text-sm text-gray-500">Ngày chấm công</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.lateDays}</p>
          <p className="text-sm text-gray-500">Đi muộn</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.pendingLeaves}</p>
          <p className="text-sm text-gray-500">Nghỉ chờ duyệt</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.pendingExplanations}</p>
          <p className="text-sm text-gray-500">Giải trình chờ duyệt</p>
        </div>
      </div>
    </div>
  );
}
