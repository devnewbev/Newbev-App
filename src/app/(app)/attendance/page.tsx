'use client';
import { useEffect, useRef, useState } from 'react';
import { getCurrentUser, checkin, checkout, getTodayAttendance, getAttendanceByUser, User, Attendance } from '@/lib/store';

export default function AttendancePage() {
  const [user, setUser] = useState<User | null>(null);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userIdRef = useRef(0);

  const loadData = () => {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    userIdRef.current = u.id;
    const record = getTodayAttendance(u.id);
    setTodayRecord(record);
    setHistory(getAttendanceByUser(u.id).reverse());
  };

  useEffect(() => { loadData(); }, []);

  const handleCapture = () => {
    setPhoto(null);
    setMsg('');
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const confirmAction = () => {
    if (!photo) return;
    const uid = userIdRef.current;
    if (!uid) return;
    const record = getTodayAttendance(uid);
    if (!record?.checkinTime) {
      checkin(uid, photo);
      setMsg('Check-in thành công!');
    } else if (record.checkinTime && !record.checkoutTime) {
      checkout(uid, photo);
      setMsg('Check-out thành công!');
    } else {
      setMsg('Không thể thực hiện. Đã checkout hoặc chưa check-in.');
      return;
    }
    setPhoto(null);
    loadData();
  };

  const cancelCapture = () => {
    setPhoto(null);
  };

  const statusBadge = (record: Attendance) => {
    const isFull = record.checkinTime && record.checkoutTime;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isFull ? 'bg-green-100 text-green-700' : record.checkinTime ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
      }`}>
        {isFull ? 'Đủ' : record.checkinTime ? 'Thiếu checkout' : 'Vắng'}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chấm công</h1>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileChange}
      />

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          msg.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>{msg}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Hôm nay - {new Date().toLocaleDateString('vi-VN')}</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Check-in</p>
            <p className="text-lg font-bold text-gray-800">{todayRecord?.checkinTime || '---'}</p>
            {todayRecord?.checkinPhoto && (
              <img src={todayRecord.checkinPhoto} alt="Checkin" className="mt-2 w-20 h-16 object-cover rounded border" />
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Check-out</p>
            <p className="text-lg font-bold text-gray-800">{todayRecord?.checkoutTime || '---'}</p>
            {todayRecord?.checkoutPhoto && (
              <img src={todayRecord.checkoutPhoto} alt="Checkout" className="mt-2 w-20 h-16 object-cover rounded border" />
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCapture}
            disabled={!!todayRecord?.checkinTime}
            className="flex-1 sm:flex-none px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed"
          >
            Check-in
          </button>
          <button
            onClick={handleCapture}
            disabled={!todayRecord?.checkinTime || !!todayRecord?.checkoutTime}
            className="flex-1 sm:flex-none px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed"
          >
            Check-out
          </button>
        </div>
      </div>

      {photo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl max-w-md w-full">
            <h3 className="font-semibold text-gray-800 mb-4">Xác nhận ảnh</h3>
            <img src={photo} alt="Captured" className="w-full rounded-lg mb-4 object-cover max-h-80" />
            <div className="flex gap-2">
              <button onClick={() => setPhoto(null)} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition cursor-pointer">
                Chụp lại
              </button>
              <button onClick={confirmAction} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
                Xác nhận
              </button>
              <button onClick={cancelCapture} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition cursor-pointer">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Lịch sử chấm công</h2>
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="text-left py-3 px-2">Ngày</th>
                <th className="text-left py-3 px-2">Check-in</th>
                <th className="text-left py-3 px-2">Check-out</th>
                <th className="text-left py-3 px-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {history.map(record => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">{new Date(record.date).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3 px-2">{record.checkinTime || '---'}</td>
                  <td className="py-3 px-2">{record.checkoutTime || '---'}</td>
                  <td className="py-3 px-2">{statusBadge(record)}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={4} className="text-center py-6 text-gray-400">Chưa có dữ liệu chấm công</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="sm:hidden space-y-3">
          {history.length === 0 && (
            <p className="text-center py-6 text-gray-400">Chưa có dữ liệu chấm công</p>
          )}
          {history.map(record => (
            <div key={record.id} className="border border-gray-100 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{new Date(record.date).toLocaleDateString('vi-VN')}</span>
                {statusBadge(record)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Check-in: </span>
                  <span className="font-medium">{record.checkinTime || '---'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Check-out: </span>
                  <span className="font-medium">{record.checkoutTime || '---'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
