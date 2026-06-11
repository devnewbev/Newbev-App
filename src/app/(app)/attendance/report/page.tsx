'use client';
import { useEffect, useState } from 'react';
import { getCurrentUser, getAttendanceByUser, getUsers, User, Attendance } from '@/lib/store';

export default function AttendanceReportPage() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [records, setRecords] = useState<Attendance[]>([]);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || u.role !== 'admin') return;
    setUser(u);
    getUsers().then(users => setEmployees(users.filter(x => x.role !== 'admin')));
  }, []);

  useEffect(() => {
    if (!selectedUserId) { setRecords([]); return; }
    getAttendanceByUser(Number(selectedUserId)).then(setRecords);
  }, [selectedUserId]);

  if (!user || user.role !== 'admin') {
    return <p className="text-center text-gray-500 py-10">Bạn không có quyền truy cập</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Báo cáo chấm công</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Chọn nhân viên</label>
        <select
          value={selectedUserId}
          onChange={e => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
          className="w-full sm:w-80 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Chọn nhân viên --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name} ({emp.username})</option>
          ))}
        </select>
      </div>

      {records.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Lịch sử chấm công ({records.length} bản ghi)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-3 px-2">Ngày</th>
                  <th className="text-left py-3 px-2">Loại</th>
                  <th className="text-left py-3 px-2">Giờ</th>
                  <th className="text-left py-3 px-2">Ảnh</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">{new Date(record.date).toLocaleDateString('vi-VN')}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        record.checkinTime ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {record.checkinTime ? 'Check-in' : 'Check-out'}
                      </span>
                    </td>
                    <td className="py-3 px-2">{record.checkinTime || record.checkoutTime || '---'}</td>
                    <td className="py-3 px-2">
                      {record.checkinPhoto ? (
                        <img src={record.checkinPhoto} alt="checkin"
                          className="w-10 h-8 object-cover rounded border cursor-pointer"
                          loading="lazy"
                          onClick={() => setZoomPhoto(record.checkinPhoto!)} />
                      ) : record.checkoutPhoto ? (
                        <img src={record.checkoutPhoto} alt="checkout"
                          className="w-10 h-8 object-cover rounded border cursor-pointer"
                          loading="lazy"
                          onClick={() => setZoomPhoto(record.checkoutPhoto!)} />
                      ) : '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {zoomPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setZoomPhoto(null)}>
          <img src={zoomPhoto} alt="Zoom" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}
