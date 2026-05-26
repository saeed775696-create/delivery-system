"use client";

import { useEffect, useState } from "react";
import EditUserModal from "@/components/admin/EditUserModal";
import Card from "@/components/ui/Card";
import { Users, UserCheck, UserX } from "lucide-react";

type User = {
  id: string;
  phone: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 🔥 جلب المستخدمين
  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔥 Toggle Ban / Activate
  const toggleStatus = async (userId: string) => {
    try {
      setLoadingId(userId);

      const res = await fetch("/api/admin/users/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, isActive: data.newStatus }
            : u
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  // 🔥 Delete User
  const deleteUser = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف المستخدم؟")) return;

    try {
      setLoadingId(userId);

      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.includes(search);

    const matchRole = role ? user.role === role : true;

    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  return (
    <div className="space-y-6">

      {/* العنوان */}
      <div>
        <h1 className="text-2xl font-bold">المستخدمين</h1>
        <p className="text-slate-500">{stats.total} مستخدم</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <Users className="w-6 h-6 mx-auto mb-2" />
          <p className="text-xl font-bold">{stats.total}</p>
        </Card>

        <Card className="text-center">
          <UserCheck className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <p className="text-xl font-bold">{stats.active}</p>
        </Card>

        <Card className="text-center">
          <UserX className="w-6 h-6 mx-auto mb-2 text-red-600" />
          <p className="text-xl font-bold">{stats.inactive}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-3 mb-4">
          <input
            className="border p-2 rounded w-full"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">كل المستخدمين</option>
            <option value="customer">عملاء</option>
            <option value="driver">مندوبين</option>
            <option value="vendor">تجار</option>
            <option value="admin">مدراء</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead>
              <tr className="text-right bg-slate-50">
                <th className="p-4">الاسم</th>
                <th className="p-4">الهاتف</th>
                <th className="p-4">النوع</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t hover:bg-slate-50">

                  <td className="p-4">{user.fullName}</td>
                  <td className="p-4">{user.phone}</td>

                  <td className="p-4">{user.role}</td>

                  <td className="p-4">
                    {user.isActive ? "نشط" : "موقوف"}
                  </td>

                  {/* Actions */}
                  <td className="p-4 flex gap-2">

                    {/* Edit */}
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                    >
                      تعديل
                    </button>

                    {/* Ban / Activate */}
                    <button
                      disabled={loadingId === user.id}
                      onClick={() => toggleStatus(user.id)}
                      className={`px-2 py-1 rounded text-xs text-white ${
                        user.isActive ? "bg-yellow-500" : "bg-green-600"
                      }`}
                    >
                      {loadingId === user.id
                        ? "..."
                        : user.isActive
                        ? "حظر"
                        : "تفعيل"}
                    </button>

                    {/* Delete */}
                    <button
                      disabled={loadingId === user.id}
                      onClick={() => deleteUser(user.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    >
                      حذف
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </Card>

      {/* Modal */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={fetchUsers}
        />
      )}

    </div>
  );
}