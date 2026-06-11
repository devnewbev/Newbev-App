'use client';
import { useEffect, useState } from 'react';
import { getCurrentUser, getAttendanceReport, User } from '@/lib/store';

export default function AttendanceReportPage() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || u.role !== 'admin') return;
    setUser(u);
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
  }, []);

  const loadReport = async () => {
    if (!fromDate || !toDate) return;
    const data = await getAttendanceReport({ fromDate, toDate });
    setRecords(data);
  };

  useEffect(() => { if (fromDate && toDate) loadReport(); }, [fromDate, toDate]);

  if (!user || user.role !== 'admin') {
    return <p className="text-center text-gray-500 py-10">Bạn không có quyền truy cập</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Báo cáo chấm công</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
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
          <button onClick={loadReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
            Xem báo cáo
          </button>
        </div>
      </div>

      {records.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Kết quả ({records.length} bản ghi)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-3 px-2">Ngày</th>
                  <th className="text-left py-3 px-2">Nhân viên</th>
                  <th className="text-left py-3 px-2">Check-in</th>
                  <th className="text-left py-3 px-2">Ảnh check-in</th>
                  <th className="text-left py-3 px-2">Check-out</th>
                  <th className="text-left py-3 px-2">Ảnh check-out</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r: any) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">{r.date?.split('-').reverse().join('/')}</td>
                    <td className="py-3 px-2 font-medium">{r.userName}</td>
                    <td className="py-3 px-2">{r.checkinTime || '---'}</td>
                    <td className="py-3 px-2">
                      {r.checkinPhoto ? (
                        <img src={r.checkinPhoto} alt="" className="w-14 h-10 object-cover rounded border cursor-pointer" loading="lazy" onClick={() => setZoomPhoto(r.checkinPhoto)} />
                      ) : '---'}
                    </td>
                    <td className="py-3 px-2">{r.checkoutTime || '---'}</td>
                    <td className="py-3 px-2">
                      {r.checkoutPhoto ? (
                        <img src={r.checkoutPhoto} alt="" className="w-14 h-10 object-cover rounded border cursor-pointer" loading="lazy" onClick={() => setZoomPhoto(r.checkoutPhoto)} />
                      ) : '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!records.length && fromDate && toDate && (
        <p className="text-center text-gray-400 py-10">Không có dữ liệu trong khoảng ngày đã chọn</p>
      )}

      {zoomPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setZoomPhoto(null)}>
          <img src={zoomPhoto} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}
