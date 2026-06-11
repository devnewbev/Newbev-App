'use client';
import { useEffect, useRef, useState } from 'react';
import { getCurrentUser, createExplanation, getExplanationsByUser, User, Explanation } from '@/lib/store';

export default function ExplanationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', reason: '' });
  const [photo, setPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [msg, setMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadData = () => {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    setExplanations(getExplanationsByUser(u.id).reverse());
  };

  useEffect(() => { loadData(); }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setShowCamera(true);
    } catch {
      setMsg('Không thể truy cập camera.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    setPhoto(canvas.toDataURL('image/jpeg', 0.7));
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createExplanation({
      userId: user.id,
      date: form.date,
      reason: form.reason,
      photo,
    });
    setMsg('Gửi giải trình thành công!');
    setShowForm(false);
    setForm({ date: '', reason: '' });
    setPhoto(null);
    loadData();
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
          <h1 className="text-2xl font-bold text-gray-800">Giải trình công</h1>
          <p className="text-gray-500">Giải trình ngày công không hợp lệ</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
        >
          + Giải trình mới
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium bg-green-50 text-green-700">{msg}</div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full mx-4">
            <h3 className="font-semibold text-gray-800 mb-4">Tạo giải trình công</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cần giải trình</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do</label>
                <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đính kèm</label>
                {!photo && !showCamera && (
                  <button type="button" onClick={startCamera}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition cursor-pointer">
                    📸 Chụp ảnh
                  </button>
                )}
                {showCamera && (
                  <div className="space-y-2">
                    <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: 200 }}>
                      <video ref={videoRef} className={`w-full ${photo ? 'hidden' : ''}`} playsInline />
                      {photo && <img src={photo} alt="Captured" className="w-full" />}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <div className="flex gap-2">
                      {!photo ? (
                        <button type="button" onClick={capturePhoto}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition cursor-pointer">Chụp ảnh</button>
                      ) : (
                        <button type="button" onClick={() => setPhoto(null)}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm transition cursor-pointer">Chụp lại</button>
                      )}
                      <button type="button" onClick={stopCamera}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm transition cursor-pointer">Đóng camera</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowForm(false); stopCamera(); setPhoto(null); }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition cursor-pointer">Hủy</button>
                <button type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">Gửi giải trình</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Lịch sử giải trình</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="text-left py-3 px-2">Ngày gửi</th>
                <th className="text-left py-3 px-2">Ngày giải trình</th>
                <th className="text-left py-3 px-2">Lý do</th>
                <th className="text-left py-3 px-2">Ảnh</th>
                <th className="text-left py-3 px-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {explanations.map(e => (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">{new Date(e.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3 px-2">{new Date(e.date).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3 px-2 max-w-[200px] truncate">{e.reason}</td>
                  <td className="py-3 px-2">
                    {e.photo ? (
                      <img src={e.photo} alt="Proof" className="w-12 h-10 object-cover rounded border cursor-pointer"
                        onClick={() => window.open(e.photo!, '_blank')} />
                    ) : '---'}
                  </td>
                  <td className="py-3 px-2">{statusBadge(e.status)}</td>
                </tr>
              ))}
              {explanations.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-gray-400">Chưa có giải trình nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
