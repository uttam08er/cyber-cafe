import { useState } from "react";
import { updatesAPI } from "../../api";
import { useFetch } from "../../hooks/useFetch";
import { formatDate, getErrorMessage } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PopUp from "../../components/common/PopUp";
import Modal from "../../components/common/Modal";
import {
  Plus,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const CATEGORIES = [
  "Govt Forms",
  "Jobs",
  "Admit Cards",
  "Results",
  "Services",
  "Impt Notice",
];

const CATEGORY_COLORS = {
  "Govt Forms": "bg-blue-100 text-blue-700 text-center",
  Jobs: "bg-green-100 text-green-700 text-center",
  "Admit Cards": "bg-purple-100 text-purple-700 text-center",
  Results: "bg-amber-100 text-amber-700 text-center",
  Services: "bg-brand-100 text-brand-700 text-center",
  "Impt Notice": "bg-red-100 text-red-700 text-center",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "Govt Forms",
  is_important: false,
  is_pinned: false,
  is_active: true,
  link: "",
  expires_at: "",
};

export default function AdminUpdates() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [catFilter, setCatFilter] = useState("");

  const params = { page, ...(catFilter ? { category: catFilter } : {}) };

  const { data, loading, refetch } = useFetch(
    () => updatesAPI.adminGetAll(params),
    [page, catFilter],
  );

  const updates = data?.updates || [];
  const pagination = data?.pagination;

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setForm({
      title: u.title,
      description: u.description,
      category: u.category,
      is_important: u.is_important,
      is_pinned: u.is_pinned,
      is_active: u.is_active,
      link: u.link || "",
      expires_at: u.expires_at ? u.expires_at.slice(0, 16) : "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        expires_at: form.expires_at || null,
        link: form.link.trim() || null,
      };
      if (editTarget) {
        const res = await updatesAPI.update(editTarget.id, payload);
        if (!res?.data?.[0]?.success) {
          toast.error(res?.data?.[0]?.message || "Update not saved");
          return;
        }
        toast.success("Update saved");

      } else {
        const res = await updatesAPI.create(payload);
        if (!res?.data?.[0]?.success) {
          toast.error(res?.data?.[0]?.message || "Update not created");
          return;
        }
        toast.success("Update created");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const [popUp, setPopUp] = useState(false);
  const [updateId, setUpdateId] = useState("");
  const openPopUp = (id) => {
    setUpdateId(id);
    setPopUp(true);
  };

  const handleDelete = async (id) => {
    const res = await updatesAPI.delete(id);
    try {
      if (!res?.data?.[0]?.success) {
        toast.error(res?.data?.[0]?.message || "Update not deleted");
        return;
      }
      toast.success("Update deleted");
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPopUp(false);
  };

  const handlePin = async (id) => {
    try {
      const res = await updatesAPI.togglePin(id);
      toast.success(res?.data?.[0]?.message);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-600 font-display">
            Daily Updates
          </h1>
          <p className="text-surface-500 text-sm mt-0.5">
            Manage notifications, job alerts & announcements
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={openCreate} className="btn-primary text-sm">
            <Plus size={14} /> Add Update
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCatFilter(cat);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              catFilter === cat
                ? "bg-brand-600 text-white"
                : "bg-white border border-surface-200 text-surface-600 hover:border-brand-300"
            }`}
          >
            {cat || "All"}
          </button>
        ))}
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
                    "Title",
                    "Category",
                    "Flags",
                    "Link",
                    "Expires",
                    "Created",
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
                {updates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-surface-400"
                    >
                      No updates found. Click "Add Update" to create one.
                    </td>
                  </tr>
                ) : (
                  updates.map((u) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-surface-50 transition-colors ${!u.is_active ? "opacity-50" : ""}`}
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <div>
                            <p className="font-semibold text-surface-900 line-clamp-1">
                              {u.title}
                            </p>
                            <p className="text-xs text-surface-400 line-clamp-1 mt-0.5">
                              {u.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 justify-center">
                        <span
                          className={`badge ${CATEGORY_COLORS[u.category] || "bg-surface-100 text-surface-600"} text-xs`}
                        >
                          {u.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {u.is_expired ? (
                            <span className="badge bg-orange-100 text-orange-700 text-xs">
                              Expired
                            </span>
                          ) : (
                            <>
                              {!u.is_active ? (
                                <span className="badge bg-surface-200 text-surface-500 text-xs">
                                  Inactive
                                </span>
                              ) : (
                                <>
                                  {u.is_new && (
                                    <span className="badge text-green-600 text-xs">
                                      NEW
                                    </span>
                                  )}
                                  {u.is_important && (
                                    <span className="badge text-red-600 text-xs flex items-center">
                                      <AlertTriangle size={12} />
                                    </span>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.link ? (
                          <a
                            href={u.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:underline flex items-center gap-1 text-xs"
                          >
                            <ExternalLink size={11} /> Link
                          </a>
                        ) : (
                          <span className="text-surface-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-surface-500 text-xs whitespace-nowrap">
                        {u.expires_at ? formatDate(u.expires_at) : "—"}
                      </td>
                      <td className="px-4 py-3 text-surface-500 text-xs whitespace-nowrap">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePin(u.id)}
                            className={`p-1.5 rounded-lg transition-colors ${u.is_pinned ? "text-amber-500 hover:bg-amber-50" : "text-surface-400 hover:bg-surface-100"}`}
                            title={u.is_pinned ? "Unpin" : "Pin"}
                          >
                            {u.is_pinned ? (
                              <PinOff size={14} />
                            ) : (
                              <Pin size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => openPopUp(u.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PopUp
            isOpen={!!popUp}
            onClose={() => setPopUp(false)}
            title="Delete Update"
            message="delete this update"
          >
            {popUp && (
              <div className="flex gap-3">
                <Link
                  onClick={() => setPopUp(false)}
                  className="btn-secondary justify-center"
                >
                  No, keep it
                </Link>
                <Link
                  onClick={() => handleDelete(updateId)}
                  className="btn-primary justify-center"
                >
                  Yes, delete
                </Link>
              </div>
            )}
          </PopUp>

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
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Update" : "New Update"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <div>
            <label className="label">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="input"
              placeholder="e.g. SSC CGL 2024 Notification Released"
            />
          </div>

          <div>
            <label className="label">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              className="input resize-none"
              placeholder="Detailed information about this update…"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">
                External Link{" "}
                <span className="text-surface-400 font-normal">(optional)</span>
              </label>
              <input
                name="link"
                value={form.link}
                onChange={handleChange}
                className="input"
                placeholder="https://…"
              />
            </div>
          </div>

          <div>
            <label className="label">
              Expires At{" "}
              <span className="text-surface-400 font-normal">
                (optional — leave blank = no expiry)
              </span>
            </label>
            <input
              type="date"
              name="expires_at"
              value={form.expires_at}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-1">
            {[
              { name: "is_important", label: "Mark as Important" },
              { name: "is_pinned", label: "Pin to Top" },
              { name: "is_active", label: "Active (visible)" },
            ].map(({ name, label }) => (
              <label
                key={name}
                className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-surface-700"
              >
                <input
                  type="checkbox"
                  name={name}
                  checked={form[name]}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-brand-600"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 justify-center"
            >
              {saving
                ? "Saving…"
                : editTarget
                  ? "Save Changes"
                  : "Create Update"}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary flex-1 justify-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
