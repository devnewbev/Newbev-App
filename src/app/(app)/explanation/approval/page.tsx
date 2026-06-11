'use client';
import { useEffect, useState } from 'react';
import { getCurrentUser, getExplanations, updateExplanationStatus, User, Explanation } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function ExplanationApprovalPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Explanation[]>([]);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  const loadData = async () => {
    const u = getCurrentUser();
    if (!u || u.role !== 'admin') { router.replace('/dashboard'); return; }
    setUser(u);
    setItems(await getExplanations());
  };

  useEffect(() => { loadData(); }, [router]);

  const handleApprove = async (id: number) => { await updateExplanationStatus(id, 'approved'); loadData(); };
  const handleReject = async (id: number) => { await updateExplanationStatus(id, 'rejected'); loadData(); };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    const labels: Record<string, string> = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Duyệt giải trình công</h1>
      <p className="text-gray-500 mb-6">Quản lý và duyệt giải trình của nhân viên</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="text-left py-3 px-2">Nhân viên</th>
                <th className="text-left py-3 px-2">Ngày</th>
                <th className="text-left py-3 px-2">Lý do</th>
                <th className="text-left py-3 px-2">Ảnh</th>
                <th className="text-left py-3 px-2">Trạng thái</th>
                <th className="text-left py-3 px-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e: any) => (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{e.userName || `User #${e.userId}`}</td>
                  <td className="py-3 px-2">{e.date?.split('-').reverse().join('/')}</td>
                  <td className="py-3 px-2 max-w-[200px] truncate">{e.reason}</td>
                  <td className="py-3 px-2">
                    {e.photo ? (
                      <img src={e.photo} alt="" className="w-12 h-10 object-cover rounded border cursor-pointer" loading="lazy" onClick={() => setZoomPhoto(e.photo)} />
                    ) : '---'}
                  </td>
                  <td className="py-3 px-2">{statusBadge(e.status)}</td>
                  <td className="py-3 px-2">
                    {e.status === 'pending' ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(e.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition cursor-pointer">Duyệt</button>
                        <button onClick={() => handleReject(e.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition cursor-pointer">Từ chối</button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="text-center py-6 text-gray-400">Chưa có giải trình nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {zoomPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setZoomPhoto(null)}>
          <img src={zoomPhoto} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}
