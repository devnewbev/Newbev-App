'use client';
import { useEffect, useState } from 'react';
import { getCurrentUser, createLeave, getLeavesByUser, User, LeaveRequest } from '@/lib/store';

const LEAVE_TYPES = ['Nghỉ phép năm', 'Nghỉ ốm', 'Nghỉ việc riêng', 'Nghỉ thai sản', 'Nghỉ không lương'];

export default function LeavePage() {
  const [user, setUser] = useState<User | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', leaveType: '', reason: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    setLeaves(await getLeavesByUser(u.id));
  };

  useEffect(() => { loadData(); }, []);

  const calcDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start), e = new Date(end);
    return Math.max(1, Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;
    setLoading(true);
    try {
      await createLeave({
        userId: user.id,
        startDate: form.startDate,
        endDate: form.endDate,
        leaveType: form.leaveType,
        reason: form.reason,
        days: calcDays(form.startDate, form.endDate),
      });
      setMsg('Đăng ký nghỉ phép thành công!');
      setShowForm(false);
      setForm({ startDate: '', endDate: '', leaveType: '', reason: '' });
      await loadData();
    } catch {
      setMsg('Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

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

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đăng ký nghỉ phép</h1>
          <p className="text-gray-500">Đăng ký ngày nghỉ và theo dõi trạng thái</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
        >
          + Đăng ký mới
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl max-w-lg w-full">
            <h3 className="font-semibold text-gray-800 mb-4">Đăng ký nghỉ phép</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
              </div>
              {form.startDate && form.endDate && (
                <p className="text-sm text-blue-600 font-medium">Số ngày nghỉ: {calcDays(form.startDate, form.endDate)} ngày</p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại nghỉ phép</label>
                <select value={form.leaveType} onChange={e => setForm({...form, leaveType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
                  <option value="">-- Chọn loại --</option>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do</label>
                <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" required />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition cursor-pointer">Hủy</button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed">
                  {loading ? 'Đang gửi...' : 'Gửi đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Danh sách đơn nghỉ phép</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="text-left py-3 px-2">Ngày gửi</th>
                <th className="text-left py-3 px-2">Loại</th>
                <th className="text-left py-3 px-2">Từ ngày</th>
                <th className="text-left py-3 px-2">Đến ngày</th>
                <th className="text-left py-3 px-2">Số ngày</th>
                <th className="text-left py-3 px-2">Lý do</th>
                <th className="text-left py-3 px-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">{new Date(l.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3 px-2">{l.leaveType}</td>
                  <td className="py-3 px-2">{new Date(l.startDate).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3 px-2">{new Date(l.endDate).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3 px-2">{l.days}</td>
                  <td className="py-3 px-2 max-w-[150px] truncate">{l.reason}</td>
                  <td className="py-3 px-2">{statusBadge(l.status)}</td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={7} className="text-center py-6 text-gray-400">Chưa có đơn nghỉ phép nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
