'use client';
import { useEffect, useRef, useState } from 'react';
import { getCurrentUser, checkin, checkout, getAttendanceByUser, User, Attendance } from '@/lib/store';
import { compressImage } from '@/lib/compress';

export default function AttendancePage() {
  const [user, setUser] = useState<User | null>(null);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'checkin' | 'checkout' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userIdRef = useRef(0);

  const loadData = async () => {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    userIdRef.current = u.id;
    const hist = await getAttendanceByUser(u.id);
    setHistory(hist);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = hist.filter(r => r.date === todayStr);
    setTodayRecord({
      id: 0, userId: u.id, date: todayStr,
      checkinTime: todayRecords.find(r => r.checkinTime)?.checkinTime || null,
      checkoutTime: todayRecords.find(r => r.checkoutTime)?.checkoutTime || null,
      checkinPhoto: todayRecords.find(r => r.checkinPhoto)?.checkinPhoto || null,
      checkoutPhoto: todayRecords.find(r => r.checkoutPhoto)?.checkoutPhoto || null,
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleCapture = (a: 'checkin' | 'checkout') => {
    setAction(a);
    setPhoto(null);
    setMsg('');
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const compressed = await compressImage(reader.result, 640, 0.5);
        setPhoto(compressed);
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmAction = async () => {
    if (!photo || loading || !action) return;
    const uid = userIdRef.current;
    if (!uid) return;
    setLoading(true);
    setMsg('');
    try {
      if (action === 'checkin') {
        await checkin(uid, photo);
        setMsg('Check-in thành công!');
      } else {
        await checkout(uid, photo);
        setMsg('Check-out thành công!');
      }
      setPhoto(null);
      setAction(null);
      loadData();
    } catch {
      setMsg('Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  const cancelCapture = () => { setPhoto(null); };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chấm công</h1>

      <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileChange} />

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          msg.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>{msg}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Hôm nay - {new Date().toLocaleDateString('vi-VN')}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Check-in</p>
            <p className="text-lg font-bold text-gray-800">{todayRecord?.checkinTime || '---'}</p>
            {todayRecord?.checkinPhoto && (
              <img src={todayRecord.checkinPhoto} alt="Checkin" className="mt-2 w-20 h-16 object-cover rounded border cursor-pointer" loading="lazy" onClick={() => setZoomPhoto(todayRecord.checkinPhoto!)} />
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Check-out</p>
            <p className="text-lg font-bold text-gray-800">{todayRecord?.checkoutTime || '---'}</p>
            {todayRecord?.checkoutPhoto && (
              <img src={todayRecord.checkoutPhoto} alt="Checkout" className="mt-2 w-20 h-16 object-cover rounded border cursor-pointer" loading="lazy" onClick={() => setZoomPhoto(todayRecord.checkoutPhoto!)} />
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleCapture('checkin')}
            className="flex-1 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed">
            Check-in
          </button>
          <button onClick={() => handleCapture('checkout')}
            className="flex-1 px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed">
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
              <button onClick={cancelCapture} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition cursor-pointer">
                Hủy
              </button>
              <button onClick={confirmAction} disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed">
                {loading ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setZoomPhoto(null)}>
          <img src={zoomPhoto} alt="Zoom" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Lịch sử chấm công</h2>
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
              {history.map(record => (
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
              {history.length === 0 && (
                <tr><td colSpan={4} className="text-center py-6 text-gray-400">Chưa có dữ liệu chấm công</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
