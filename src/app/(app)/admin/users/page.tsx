'use client';
import { useEffect, useState } from 'react';
import { getCurrentUser, getUsers, createUser, updateUser, deleteUser, User } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'employee' });
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    const u = getCurrentUser();
    if (!u || u.role !== 'admin') { router.replace('/dashboard'); return; }
    setUser(u);
    setUsers(await getUsers());
  };

  useEffect(() => { loadData(); }, [router]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ username: '', password: '', name: '', role: 'employee' });
    setShowForm(true);
  };

  const openEdit = (u: User) => {
    setEditingId(u.id);
    setForm({ username: u.username, password: '', name: u.name, role: u.role });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const ok = await updateUser(editingId, { name: form.name, role: form.role, password: form.password || undefined });
      setMsg(ok ? 'Cập nhật thành công' : 'Lỗi cập nhật');
    } else {
      const result = await createUser(form);
      setMsg(result ? 'Tạo người dùng thành công' : 'Lỗi (có thể username đã tồn tại)');
    }
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa người dùng này?')) return;
    await deleteUser(id);
    loadData();
  };

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
          <p className="text-gray-500">Tạo và quản lý tài khoản đăng nhập</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
          + Người dùng mới
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl max-w-md w-full">
            <h3 className="font-semibold text-gray-800 mb-4">{editingId ? 'Sửa người dùng' : 'Tạo người dùng mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required disabled={!!editingId} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{editingId ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required={!editingId} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="employee">Nhân viên</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm transition cursor-pointer">Hủy</button>
                <button type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition cursor-pointer">
                  {editingId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="text-left py-3 px-2">ID</th>
                <th className="text-left py-3 px-2">Username</th>
                <th className="text-left py-3 px-2">Họ tên</th>
                <th className="text-left py-3 px-2">Vai trò</th>
                <th className="text-left py-3 px-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">{u.id}</td>
                  <td className="py-3 px-2 font-medium">{u.username}</td>
                  <td className="py-3 px-2">{u.name}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition cursor-pointer">Sửa</button>
                      {u.id !== user.id && (
                        <button onClick={() => handleDelete(u.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition cursor-pointer">Xóa</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-gray-400">Chưa có người dùng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
