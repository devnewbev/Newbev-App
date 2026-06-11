'use client';
import { useEffect, useState } from 'react';
import { getCurrentUser, getWorkDays, calculateWorkDays, getUsers, User, WorkDay } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function SalaryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<WorkDay[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [calcMsg, setCalcMsg] = useState('');

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || u.role !== 'admin') { router.replace('/dashboard'); return; }
    setUser(u);
    getUsers().then(list => setUsers(list.filter(x => x.role !== 'admin')));
    const today = new Date().toISOString().split('T')[0];
    const first = new Date(); first.setDate(1);
    setFromDate(first.toISOString().split('T')[0]);
    setToDate(today);
  }, [router]);

  const loadWorkDays = async () => {
    const data = await getWorkDays(selectedUserId || undefined);
    setRecords(data);
  };

  useEffect(() => { if (fromDate && toDate) loadWorkDays(); }, [selectedUserId]);

  const handleCalculate = async () => {
    if (!fromDate || !toDate) return;
    setCalcMsg('Đang tính...');
    const res = await calculateWorkDays({ fromDate, toDate });
    setCalcMsg(res.message);
    loadWorkDays();
    setTimeout(() => setCalcMsg(''), 3000);
  };

  const totalMinutes = records.reduce((s, r) => s + r.workMinutes, 0);
  const totalLate = records.reduce((s, r) => s + r.lateMinutes, 0);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Bảng tính công</h1>
      <p className="text-gray-500 mb-6">Tính công dựa trên chấm công (8h/ngày, trừ phút đi muộn/về sớm)</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn nhân viên</label>
            <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tất cả</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={handleCalculate}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
            Tính công
          </button>
          <button onClick={loadWorkDays}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
            Làm mới
          </button>
        </div>
        {calcMsg && (
          <p className="mt-3 text-sm text-green-600 font-medium">{calcMsg}</p>
        )}
      </div>

      {records.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">
              Chi tiết công ({records.length} ngày)
            </h2>
            <div className="text-sm text-gray-600">
              Tổng: <strong>{Math.floor(totalMinutes / 60)}h{totalMinutes % 60}m</strong> |
              Đi muộn: <strong className="text-red-600">{totalLate}p</strong>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-3 px-2">Ngày</th>
                  <th className="text-left py-3 px-2">Nhân viên</th>
                  <th className="text-left py-3 px-2">Giờ công</th>
                  <th className="text-left py-3 px-2">Đi muộn</th>
                  <th className="text-left py-3 px-2">Về sớm</th>
                  <th className="text-left py-3 px-2">Loại ngày</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">{r.date?.split('-').reverse().join('/')}</td>
                    <td className="py-3 px-2 font-medium">{users.find(u => u.id === r.userId)?.name || `User #${r.userId}`}</td>
                    <td className="py-3 px-2">{Math.floor(r.workMinutes / 60)}h{r.workMinutes % 60}m</td>
                    <td className="py-3 px-2 text-red-600">{r.lateMinutes > 0 ? `${r.lateMinutes}p` : '0'}</td>
                    <td className="py-3 px-2 text-orange-600">{r.earlyLeaveMinutes > 0 ? `${r.earlyLeaveMinutes}p` : '0'}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.dayType === 'working' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {r.dayType === 'working' ? 'Đi làm' : 'Nghỉ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!records.length && (
        <p className="text-center text-gray-400 py-10">
          Chưa có dữ liệu. Chọn khoảng ngày và nhấn "Tính công".
        </p>
      )}
    </div>
  );
}
