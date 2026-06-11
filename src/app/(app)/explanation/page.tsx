'use client';
import { useEffect, useRef, useState } from 'react';
import { getCurrentUser, createExplanation, getExplanationsByUser, User, Explanation } from '@/lib/store';
import { compressImage } from '@/lib/compress';

export default function ExplanationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', reason: '' });
  const [photo, setPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    setExplanations(await getExplanationsByUser(u.id));
  };

  useEffect(() => { loadData(); }, []);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const compressed = await compressImage(reader.result, 800, 0.5);
        setPhoto(compressed);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;
    setLoading(true);
    try {
      await createExplanation({
        userId: user.id,
        date: form.date,
        reason: form.reason,
        photo,
      });
      setMsg('Gửi giải trình thành công!');
      setShowForm(false);
      setForm({ date: '', reason: '' });
      setPhoto(null);
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
                {!photo ? (
                  <button type="button" onClick={handleCapture}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition cursor-pointer">
                    Chụp ảnh
                  </button>
                ) : (
                  <div className="space-y-2">
                    <img src={photo} alt="Captured" className="w-full rounded-lg object-cover max-h-64 border" />
                    <div className="flex gap-2">
                      <button type="button" onClick={handleCapture}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm transition cursor-pointer">Chụp lại</button>
                      <button type="button" onClick={() => setPhoto(null)}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm transition cursor-pointer">Xóa ảnh</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setPhoto(null); }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition cursor-pointer">Hủy</button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed">
                  {loading ? 'Đang gửi...' : 'Gửi giải trình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
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
                        loading="lazy" onClick={() => window.open(e.photo!, '_blank')} />
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
