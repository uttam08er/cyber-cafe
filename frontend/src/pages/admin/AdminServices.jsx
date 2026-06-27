import { useState } from "react";
import { servicesAPI } from "../../api";
import { useFetch } from "../../hooks/useFetch";
import { formatCurrency, getErrorMessage } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import PopUp from "../../components/common/PopUp";
import { Link } from "react-router-dom";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  price_unit: "per page",
  category: "printing",
  icon: "printer",
  requires_upload: false,
  turnaround_time: "",
  is_active: true,
};
const CATEGORIES = ["printing", "scanning", "assistance", "photo", "other"];
const ICONS = [
  "printer",
  "scan",
  "form",
  "copy",
  "camera",
  "shield",
  "globe",
];

export default function AdminServices() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const {
    data: services,
    loading,
    refetch,
  } = useFetch(() => servicesAPI.getAllAdmin(), []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  
  const openEdit = (svc) => {
    setEditTarget(svc);
    setForm({
      name: svc.name,
      description: svc.description || "",
      price: svc.price,
      price_unit: svc.price_unit,
      category: svc.category,
      icon: svc.icon || "document",
      requires_upload: svc.requires_upload,
      turnaround_time: svc.turnaround_time || "",
      is_active: svc.is_active,
    });
    setModalOpen(true);
  };

  
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await servicesAPI.update(editTarget.id, {
          ...form,
          price: parseFloat(form.price),
        });
        toast.success("Service updated");
      } else {
        await servicesAPI.create({ ...form, price: parseFloat(form.price) });
        toast.success("Service created");
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
  const [serviceId, setServiceId] = useState("");
  const openPopUp = (id) => {
    setServiceId(id);
    setPopUp(true);
  };

  const handleDelete = async (id) => {
    const res = await servicesAPI.delete(id);
    try {
      if (!res?.data?.[0]?.success) {
        toast.error(res?.data?.[0]?.message || "Service not deactivated");
        return;
      }
      toast.success("Service deleted");
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPopUp(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-600 font-display">
            Services
          </h1>
          <p className="text-surface-500 text-sm mt-0.5">
            Add, edit and manage café services
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Add Service
        </button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                {[
                  "Service",
                  "Category",
                  "Price",
                  "Upload Req.",
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
              {!services || services.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-surface-400"
                  >
                    No services yet
                  </td>
                </tr>
              ) : (
                services.map((svc) => (
                  <tr
                    key={svc.id}
                    className="hover:bg-surface-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-surface-900">
                        {svc.name}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5 truncate max-w-xs">
                        {svc.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-surface-100 text-surface-600 capitalize">
                        {svc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-600 whitespace-nowrap">
                      {formatCurrency(svc.price)}{" "}
                      <span className="text-surface-400 font-normal text-xs">
                        / {svc.price_unit?.replace("per ", "")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${svc.requires_upload ? "bg-orange-100 text-orange-700" : "bg-surface-100 text-surface-500"}`}
                      >
                        {svc.requires_upload ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${svc.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                      >
                        {svc.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEdit(svc)}
                          className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => openPopUp(svc.id)}
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
      )}

      <PopUp
        isOpen={!!popUp}
        onClose={() => setPopUp(false)}
        title="Delete Service"
        message="delete this service"
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
              onClick={() => handleDelete(serviceId)}
              className="btn-primary justify-center"
            >
              Yes, delete
            </Link>
          </div>
        )}
      </PopUp>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Service" : "Add New Service"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Service Name <span className="text-red-600">*</span></label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g. Document Printing"
              />
            </div>
            <div>
              <label className="label">Category <span className="text-red-600">*</span></label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description <span className="text-red-600">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={2}
              className="input resize-none"
              placeholder="Short description of the service"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Price (₹) <span className="text-red-600">*</span></label>
              <input
                name="price"
                type="number"
                step="0.5"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label className="label">Price Unit <span className="text-red-600">*</span></label>
              <input
                name="price_unit"
                value={form.price_unit}
                onChange={handleChange}
                className="input"
                required
                placeholder="per page"
              />
            </div>
            <div>
              <label className="label">Turnaround Time</label>
              <input
                name="turnaround_time"
                value={form.turnaround_time}
                onChange={handleChange}
                className="input"
                placeholder="e.g. 30 min"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Icon <span className="text-red-600">*</span></label>
              <select
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className="input"
                required
              >
                {ICONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="requires_upload"
                  checked={form.requires_upload}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <span className="text-sm font-medium text-surface-700">
                  Requires file upload
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <span className="text-sm font-medium text-surface-700">
                  Active / Visible
                </span>
              </label>
            </div>
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
                  : "Create Service"}
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
