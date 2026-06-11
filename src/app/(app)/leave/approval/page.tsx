'use client';
import { useEffect, useState } from 'react';
import { getCurrentUser, getLeaves, updateLeaveStatus, getUsers, User, LeaveRequest } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function LeaveApprovalPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [leaves, setLeaves] = useState<(LeaveRequest & { userName: string })[]>([]);

  const loadData = () => {
    const u = getCurrentUser();
    if (!u || u.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    setUser(u);
    const users = getUsers();
    const allLeaves = getLeaves().reverse();
    setLeaves(allLeaves.map(l => ({
      ...l,
      userName: users.find(u2 => u2.id === l.userId)?.name || 'Unknown',
    })));
  };

  useEffect(() => { loadData(); }, [router]);

  const handleApprove = (id: number) => {
    updateLeaveStatus(id, 'approved');
    loadData();
  };

  const handleReject = (id: number) => {
    updateLeaveStatus(id, 'rejected');
    loadData();
  };

  if (!user) return null;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Duyệt nghỉ phép</h1>
      <p className="text-gray-500 mb-6">Quản lý và duyệt đơn nghỉ phép của nhân viên</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="text-left py-3 px-2">Nhân viên</th>
                <th className="text-left py-3 px-2">Loại</th>
                <th className="text-left py-3 px-2">Từ ngày</th>
                <th className="text-left py-3 px-2">Đến ngày</th>
                <th className="text-left py-3 px-2">Số ngày</th>
                <th className="text-left py-3 px-2">Lý do</th>
                <th className="text-left py-3 px-2">Trạng thái</th>
                <th className="text-left py-3 px-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{l.userName}</td>
                  <td className="py-3 px-2">{l.leaveType}</td>
                  <td className="py-3 px-2">{new Date(l.startDate).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3 px-2">{new Date(l.endDate).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3 px-2">{l.days}</td>
                  <td className="py-3 px-2 max-w-[150px] truncate">{l.reason}</td>
                  <td className="py-3 px-2">{statusBadge(l.status)}</td>
                  <td className="py-3 px-2">
                    {l.status === 'pending' ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(l.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition cursor-pointer">Duyệt</button>
                        <button onClick={() => handleReject(l.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition cursor-pointer">Từ chối</button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={8} className="text-center py-6 text-gray-400">Chưa có đơn nghỉ phép nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {leaves.length === 0 && (
            <p className="text-center py-6 text-gray-400">Chưa có đơn nghỉ phép nào</p>
          )}
          {leaves.map(l => (
            <div key={l.id} className="border border-gray-100 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{l.userName}</span>
                {statusBadge(l.status)}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Loại:</span>
                  <span>{l.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Từ ngày:</span>
                  <span>{new Date(l.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Đến ngày:</span>
                  <span>{new Date(l.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số ngày:</span>
                  <span>{l.days}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lý do:</span>
                  <span className="text-right max-w-[60%] truncate">{l.reason}</span>
                </div>
              </div>
              {l.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleApprove(l.id)}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition cursor-pointer">Duyệt</button>
                  <button onClick={() => handleReject(l.id)}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition cursor-pointer">Từ chối</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
