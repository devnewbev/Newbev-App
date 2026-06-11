'use client';
import { useEffect, useState } from 'react';
import { getCurrentUser, getEmployees, createEmployee, updateEmployee, deleteEmployee, getUsers, User, Employee } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function EmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    userId: '', employeeCode: '', fullName: '', phone: '', email: '', address: '',
    idCard: '', position: '', department: '', hireDate: '', baseSalary: '', status: 'active',
  });
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    const u = getCurrentUser();
    if (!u || u.role !== 'admin') { router.replace('/dashboard'); return; }
    setUser(u);
    setEmployees(await getEmployees());
    setUsers(await getUsers());
  };

  useEffect(() => { loadData(); }, [router]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ userId: '', employeeCode: '', fullName: '', phone: '', email: '', address: '', idCard: '', position: '', department: '', hireDate: '', baseSalary: '', status: 'active' });
    setShowForm(true);
  };

  const openEdit = (e: Employee) => {
    setEditingId(e.id);
    setForm({
      userId: e.userId?.toString() || '', employeeCode: e.employeeCode, fullName: e.fullName,
      phone: e.phone || '', email: e.email || '', address: e.address || '', idCard: e.idCard || '',
      position: e.position || '', department: e.department || '', hireDate: e.hireDate?.split('T')[0] || '',
      baseSalary: e.baseSalary?.toString() || '0', status: e.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      userId: form.userId ? Number(form.userId) : null,
      employeeCode: form.employeeCode, fullName: form.fullName, phone: form.phone, email: form.email,
      address: form.address, idCard: form.idCard, position: form.position, department: form.department,
      hireDate: form.hireDate || null, baseSalary: Number(form.baseSalary) || 0, status: form.status,
    };
    if (editingId) {
      const ok = await updateEmployee(editingId, payload);
      setMsg(ok ? 'Cập nhật thành công' : 'Lỗi cập nhật');
    } else {
      const result = await createEmployee(payload as any);
      setMsg(result ? 'Tạo nhân viên thành công' : 'Lỗi (có thể mã NV đã tồn tại)');
    }
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa nhân viên này?')) return;
    await deleteEmployee(id);
    loadData();
  };

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Danh sách nhân viên</h1>
          <p className="text-gray-500">Quản lý thông tin nhân viên</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
          + Nhân viên mới
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-gray-800 mb-4">{editingId ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên *</label>
                  <input value={form.employeeCode} onChange={e => setForm({...form, employeeCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                  <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CCCD</label>
                  <input value={form.idCard} onChange={e => setForm({...form, idCard: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                  <input value={form.position} onChange={e => setForm({...form, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                  <input value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
                  <select value={form.userId} onChange={e => setForm({...form, userId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">-- Chọn --</option>
                    {users.filter(u => u.role !== 'admin').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.username})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vào làm</label>
                  <input type="date" value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lương cơ bản</label>
                  <input type="number" value={form.baseSalary} onChange={e => setForm({...form, baseSalary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
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
                <th className="text-left py-3 px-2">Mã NV</th>
                <th className="text-left py-3 px-2">Họ tên</th>
                <th className="text-left py-3 px-2">Phòng ban</th>
                <th className="text-left py-3 px-2">Chức vụ</th>
                <th className="text-left py-3 px-2">SĐT</th>
                <th className="text-left py-3 px-2">Trạng thái</th>
                <th className="text-left py-3 px-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{e.employeeCode}</td>
                  <td className="py-3 px-2">{e.fullName}</td>
                  <td className="py-3 px-2">{e.department || '---'}</td>
                  <td className="py-3 px-2">{e.position || '---'}</td>
                  <td className="py-3 px-2">{e.phone || '---'}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {e.status === 'active' ? 'Đang làm' : 'Đã nghỉ'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(e)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition cursor-pointer">Sửa</button>
                      <button onClick={() => handleDelete(e.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition cursor-pointer">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan={7} className="text-center py-6 text-gray-400">Chưa có nhân viên</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
