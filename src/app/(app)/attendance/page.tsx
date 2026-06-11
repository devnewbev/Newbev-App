'use client';
import { useEffect, useRef, useState } from 'react';
import { getCurrentUser, checkin, checkout, getTodayAttendance, getAttendanceByUser, User, Attendance } from '@/lib/store';

export default function AttendancePage() {
  const [user, setUser] = useState<User | null>(null);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'checkin' | 'checkout'>('checkin');
  const [photo, setPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadData = () => {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    setTodayRecord(getTodayAttendance(u.id));
    setHistory(getAttendanceByUser(u.id).reverse());
  };

  useEffect(() => { loadData(); }, []);

  const startCamera = async (mode: 'checkin' | 'checkout') => {
    setCameraMode(mode);
    setPhoto(null);
    setMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setShowCamera(true);
    } catch {
      setMsg('Không thể truy cập camera. Vui lòng cho phép quyền truy cập.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    setPhoto(dataUrl);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const confirmAction = () => {
    if (!user || !photo) return;
    if (cameraMode === 'checkin') {
      checkin(user.id, photo);
      setMsg('Check-in thành công!');
    } else {
      checkout(user.id, photo);
      setMsg('Check-out thành công!');
    }
    stopCamera();
    loadData();
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chấm công</h1>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          msg.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>{msg}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Hôm nay - {new Date().toLocaleDateString('vi-VN')}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
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
        <div className="flex gap-3">
          <button
            onClick={() => startCamera('checkin')}
            disabled={!!todayRecord?.checkinTime}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed"
          >
            Check-in
          </button>
          <button
            onClick={() => startCamera('checkout')}
            disabled={!todayRecord?.checkinTime || !!todayRecord?.checkoutTime}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed"
          >
            Check-out
          </button>
        </div>
      </div>

      {showCamera && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="font-semibold text-gray-800 mb-4">
              {cameraMode === 'checkin' ? 'Chụp ảnh Check-in' : 'Chụp ảnh Check-out'}
            </h3>
            <div className="relative bg-black rounded-lg overflow-hidden mb-4 flex items-center justify-center" style={{ minHeight: 200 }}>
              <video ref={videoRef} className={`w-full ${photo ? 'hidden' : ''}`} playsInline />
              {photo && <img src={photo} alt="Captured" className="w-full" />}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-2">
              {!photo ? (
                <button onClick={capturePhoto} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
                  Chụp ảnh
                </button>
              ) : (
                <>
                  <button onClick={() => setPhoto(null)} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition cursor-pointer">
                    Chụp lại
                  </button>
                  <button onClick={confirmAction} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
                    Xác nhận
                  </button>
                </>
              )}
              <button onClick={stopCamera} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition cursor-pointer">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Lịch sử chấm công</h2>
        <div className="overflow-x-auto">
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
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.checkinTime && record.checkoutTime
                        ? 'bg-green-100 text-green-700'
                        : record.checkinTime
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {record.checkinTime && record.checkoutTime ? 'Đủ' : record.checkinTime ? 'Thiếu checkout' : 'Vắng'}
                    </span>
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
