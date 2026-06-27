import { useState } from "react";
import { adminAPI } from "../../api";
import { useFetch } from "../../hooks/useFetch";
import { formatDate, getErrorMessage } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Search, UserCheck, UserX, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/common/Modal";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, loading, refetch } = useFetch(
    () => adminAPI.getUsers({ page, search }),
    [page, search],
  );
  const users = data?.users || [];
  const pagination = data?.pagination;

  const handleToggle = async (id) => {
    try {
      const res = await adminAPI.toggleUserActive(id);
      toast.success(
        res?.data?.[0]?.message || "User status updated successfully",
      );
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-brand-600 font-display">
          Users
        </h1>
        <p className="text-surface-500 text-sm mt-0.5">
          Manage all registered users
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400"
        />
        <input
          type="text"
          placeholder="Search by name, email, phone…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input pl-9"
        />
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : (
        <>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  {[
                    "User",
                    "Email",
                    "Phone",
                    "Requests",
                    "Bookings",
                    "Joined",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-12 text-surface-400"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-surface-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-brand-700 font-bold text-xs">
                              {u.full_name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-surface-900 whitespace-nowrap">
                            {u.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-surface-600">{u.email}</td>
                      <td className="px-4 py-3 text-surface-500">
                        {u.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-brand-600">
                        {u.request_count}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-brand-600">
                        {u.booking_count}
                      </td>
                      <td className="px-4 py-3 text-surface-500 whitespace-nowrap">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelected(u)}
                            className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleToggle(u.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.is_active
                                ? "hover:bg-red-50 text-red-500"
                                : "hover:bg-green-50 text-green-600"
                            }`}
                            title={u.is_active ? "Deactivate" : "Activate"}
                          >
                            {u.is_active ? (
                              <UserX size={14} />
                            ) : (
                              <UserCheck size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                disabled={!pagination.has_prev}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="px-4 py-1.5 text-sm text-surface-500 font-medium">
                {pagination.current_page} / {pagination.pages}
              </span>
              <button
                disabled={!pagination.has_next}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="User Details"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center">
                <span className="text-brand-700 font-bold text-xl">
                  {selected.full_name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-bold text-surface-900 text-lg">
                  {selected.full_name}
                </p>
                <p className="text-surface-500 text-sm">{selected.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Phone", selected.phone || "—"],
                ["Role", selected.role],
                ["Status", selected.is_active ? "Active" : "Inactive"],
                ["Joined", formatDate(selected.created_at)],
                ["Requests", selected.request_count],
                ["Bookings", selected.booking_count],
              ].map(([k, v]) => (
                <div key={k} className="bg-surface-50 rounded-xl p-3">
                  <p className="text-xs text-surface-400 uppercase tracking-wide font-semibold">
                    {k}
                  </p>
                  <p className="font-semibold text-surface-900 mt-0.5 capitalize">
                    {String(v)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
