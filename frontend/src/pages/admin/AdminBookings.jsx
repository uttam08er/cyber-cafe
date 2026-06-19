import { useState } from "react";
import { bookingsAPI } from "../../api";
import { useFetch } from "../../hooks/useFetch";
import {
  formatCurrency,
  formatDateTime,
  getErrorMessage,
} from "../../utils/helpers";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  Monitor,
  RefreshCw,
  Settings,
  Save,
  X,
  Clock,
  DollarSign,
  Layers,
  ChevronDown,
  ChevronUp,
  Filter,
  BanknoteX,
  CircleCheckBig,
  CircleX,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Settings panel ────────────────────────────────────────────────────────────

function BookingSettingsPanel() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null); // null = not yet loaded / closed

  const {
    data: settings,
    loading,
    refetch,
  } = useFetch(() => bookingsAPI.getSettings(), []);

  // When the panel opens, seed the form from fetched settings
  const handleOpen = () => {
    if (settings) {
      setForm({
        max_computers: settings.max_computers,
        price_per_hour: settings.price_per_hour,
        opening_hour: settings.opening_hour,
        closing_hour: settings.closing_hour,
        max_hours_per_booking: settings.max_hours_per_booking,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bookingsAPI.updateSettings({
        max_computers: parseInt(form.max_computers),
        price_per_hour: parseFloat(form.price_per_hour),
        opening_hour: parseInt(form.opening_hour),
        closing_hour: parseInt(form.closing_hour),
        max_hours_per_booking: parseInt(form.max_hours_per_booking),
      });
      toast.success("Booking settings saved");
      await refetch();
      handleClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Collapsed summary strip ───────────────────────────────────────────────
  const Summary = () => {
    if (loading || !settings) return null;
    return (
      <div className="flex flex-wrap items-center gap-4 text-sm text-surface-600">
        <span className="flex items-center gap-1.5">
          <Monitor size={13} className="text-brand-500" />
          <span className="font-semibold text-surface-800">
            {settings.max_computers}
          </span>{" "}
          PCs
        </span>
        <span className="text-surface-300">|</span>
        <span className="flex items-center gap-1.5">
          <DollarSign size={13} className="text-brand-500" />
          <span className="font-semibold text-surface-800">
            {formatCurrency(settings.price_per_hour)}
          </span>
          /hr
        </span>
        <span className="text-surface-300">|</span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} className="text-brand-500" />
          <span className="font-semibold text-surface-800">
            {String(settings.opening_hour).padStart(2, "0")}:00 –{" "}
            {String(settings.closing_hour).padStart(2, "0")}:00
          </span>
        </span>
        <span className="text-surface-300">|</span>
        <span className="flex items-center gap-1.5">
          <Layers size={13} className="text-brand-500" />
          Max{" "}
          <span className="font-semibold text-surface-800 mx-1">
            {settings.max_hours_per_booking}h
          </span>
          /booking
        </span>
      </div>
    );
  };

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header row — always visible */}
      <button
        onClick={open ? handleClose : handleOpen}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-50 transition-colors animate-fade-in"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
            <Settings size={15} className="text-brand-600" />
          </div>
          <div className="text-left">
            {open && (
              <div>
                <p className="text-sm font-bold text-surface-900">
                  Booking Settings
                </p>
              </div>
            )}
            {!open && <Summary />}
          </div>
        </div>
        <div className="text-surface-400 flex-shrink-0 ml-4">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded form */}
      {open && (
        <div className="border-t border-surface-100 px-5 pb-5 pt-4">
          {loading || !form ? (
            <LoadingSpinner size="sm" className="py-6" />
          ) : (
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                {/* Max computers */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Monitor size={13} className="text-brand-500" /> Max
                    Computers
                  </label>
                  <input
                    type="number"
                    name="max_computers"
                    min="1"
                    max="100"
                    value={form.max_computers}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Total PCs available for booking
                  </p>
                </div>

                {/* Price per hour */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <DollarSign size={13} className="text-brand-500" /> Price
                    per Hour (₹)
                  </label>
                  <input
                    type="number"
                    name="price_per_hour"
                    min="0"
                    step="0.50"
                    value={form.price_per_hour}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Charged to users per hour
                  </p>
                </div>

                {/* Max hours per booking */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Layers size={13} className="text-brand-500" /> Max Hours /
                    Booking
                  </label>
                  <input
                    type="number"
                    name="max_hours_per_booking"
                    min="1"
                    max="12"
                    value={form.max_hours_per_booking}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                  <p className="text-xs text-surface-400 mt-1">
                    Maximum single session length
                  </p>
                </div>

                {/* Opening hour */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Clock size={13} className="text-brand-500" /> Opening Hour
                  </label>
                  <select
                    name="opening_hour"
                    value={form.opening_hour}
                    onChange={handleChange}
                    className="input"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, "0")}:00 {i < 12 ? "AM" : "PM"}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-surface-400 mt-1">
                    Café opens for bookings at
                  </p>
                </div>

                {/* Closing hour */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Clock size={13} className="text-brand-500" /> Closing Hour
                  </label>
                  <select
                    name="closing_hour"
                    value={form.closing_hour}
                    onChange={handleChange}
                    className="input"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, "0")}:00 {i < 12 ? "AM" : "PM"}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-surface-400 mt-1">
                    Café closes for bookings at
                  </p>
                </div>

                {/* Live preview */}
                <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                  <div className="w-full bg-brand-50 rounded-xl px-4 py-3 text-sm">
                    <p className="font-semibold text-brand-800 mb-2">
                      Live Preview
                    </p>
                    <div className="space-y-1 text-brand-700">
                      <p>🖥️ {form.max_computers} computers</p>
                      <p>
                        💰 ₹{parseFloat(form.price_per_hour || 0).toFixed(2)} /
                        hour
                      </p>
                      <p>
                        🕐 {String(form.opening_hour).padStart(2, "0")}:00 –{" "}
                        {String(form.closing_hour).padStart(2, "0")}:00
                      </p>
                      <p>⏱ Max {form.max_hours_per_booking}h per booking</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation warning */}
              {parseInt(form.opening_hour) >= parseInt(form.closing_hour) && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
                  ⚠️ Closing hour must be after opening hour
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    parseInt(form.opening_hour) >= parseInt(form.closing_hour)
                  }
                  className="btn-primary text-sm py-2 px-4"
                >
                  <Save size={14} />
                  {saving ? "Saving…" : "Save Settings"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main AdminBookings page ───────────────────────────────────────────────────
import { BanknoteArrowDown } from "lucide-react";
export default function AdminBookings() {
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const STATUSES = ["confirmed", "cancelled", "completed", "no_show"];
  const PAYMENTS = ["paid", "unpaid"];

  const params = {
    page,
    ...(dateFilter ? { date: dateFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { data, loading, refetch } = useFetch(
    () => bookingsAPI.adminGetAll(params),
    [page, dateFilter, statusFilter],
  );
  const bookings = data?.bookings || [];
  const pagination = data?.pagination;

  const handleToggle = async (id) => {
    try {
      const res = await bookingsAPI.toggleUserPaid(id);
      toast.success(res?.data?.[0]?.message || "Service paid");
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">
            Bookings
          </h1>
          <p className="text-surface-500 text-sm mt-0.5">
            All PC slot bookings
          </p>
        </div>
        <button onClick={refetch} className="btn-secondary text-sm py-2 px-3">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Booking Settings panel (new) ── */}
      <BookingSettingsPanel />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="input text-sm py-1.5 w-40"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs text-surface-400 hover:text-red-500"
            >
              ✕
            </button>
          )}
        </div>
        {/* <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input text-sm py-1.5 w-36"
        >
          <option value="">All Statuses</option>
          {["paid", "unpaid"].map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select> */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-surface-400" />
          {["", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === s
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-surface-200 text-surface-600 hover:border-brand-300"
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings table */}
      {loading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : (
        <>
          {bookings.length === 0 ? (
            <div className="card text-center py-16 text-surface-400">
              <Monitor size={40} className="mx-auto mb-3 opacity-40" />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-100 bg-surface-50">
                    {[
                      "Booking #",
                      "User",
                      "Date",
                      "Time",
                      "PC",
                      "Duration",
                      "Amount",
                      "Purpose",
                      "Status",
                      "Pay",
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
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-surface-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-surface-500">
                        {b.booking_number}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-surface-900 whitespace-nowrap">
                          {b.user?.full_name}
                        </p>
                        <p className="text-xs text-surface-400">
                          {b.user?.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-surface-800">
                        {b.booking_date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-surface-600">
                        {b.start_time} – {b.end_time}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-brand-50 text-brand-700">
                          PC{b.computer_number}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-surface-600">
                        {b.duration_hours}h
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-600">
                        {formatCurrency(b.total_price)}
                      </td>
                      <td className="px-4 py-3 text-surface-500">
                        {b.purpose || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(b.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            b.is_paid
                              ? "hover:bg-green-50 text-green-600"
                              : "hover:bg-red-50 text-red-500"
                          }`}
                          title={b.is_paid ? "Paid" : "Unpaid"}
                        >
                          {b.is_paid ? (
                            <CircleCheckBig size={18} />
                          ) : (
                            <CircleX size={18} />
                          )}
                          {/* {b.is_paid ? <BanknoteArrowDown size={25}/> : <BanknoteX size={25}/>} */}
                          {/* {b.is_paid ? <p>Paid</p> : <p>Unpaid</p>} */}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
    </div>
  );
}
