import { useState } from "react";
import { bookingsAPI } from "../api";
import { formatCurrency, getErrorMessage } from "../utils/helpers";
import { Monitor, Clock, CheckCircle, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Link } from "react-router-dom";
import ScrollToTop from "../components/common/ScrollToTop";

const PURPOSES = [
  "Browsing",
  "Gaming",
  "Work/Office",
  "Study",
  "Video Call",
  "Printing Help",
  "Other",
];

export default function BookingPage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPC, setSelectedPC] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [data, setData] = useState(null);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setSlots(null);
    setSelectedSlot(null);
    setSelectedPC(null);
    try {
      const res = await bookingsAPI.getAvailable(selectedDate);
      if (!res?.data?.[0]?.success) {
        toast.error(
          res?.data?.[0]?.message || "Failed to fetch available slots",
        );
        return;
      }
      setSlots(res?.data?.[0]?.data?.slots || res?.data?.[0]?.data || []);
      setData(res?.data?.[0]?.data || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot) => {
    if (slot.available_count === 0) return;
    setSelectedSlot(slot);
    setSelectedPC(slot.available_computers[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !selectedPC) {
      toast.error("Please select a time slot");
      return;
    }

    setSubmitting(true);
    try {
      const res = await bookingsAPI.create({
        booking_date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        computer_number: selectedPC,
        purpose,
        notes,
      });
      setSuccess(res?.data?.[0]?.data || {});
      console.log(res?.data?.[0]?.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <>
        <ScrollToTop />
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold font-display text-surface-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-surface-500 mb-1">Booking Number:</p>
            <p className="font-mono font-bold text-brand-600 text-xl mb-4">
              {success.booking_number}
            </p>
            <div className="bg-surface-50 rounded-xl p-4 text-sm text-left space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-surface-500">Date</span>
                <span className="font-semibold">{success.booking_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Time</span>
                <span className="font-semibold">
                  {success.start_time} – {success.end_time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Computer</span>
                <span className="font-semibold">
                  PC #{success.computer_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Total</span>
                <span className="font-bold text-brand-600">
                  {formatCurrency(success.total_price)}
                </span>
              </div>
            </div>
            <p className="text-xs text-surface-400 mb-6">
              Please arrive 5 minutes early. Pay at the counter.
            </p>
            <div className="flex gap-3">
              <Link
                to="/dashboard/bookings"
                className="btn-primary flex-1 justify-center"
              >
                View Bookings
              </Link>
              <button
                onClick={() => {
                  setSuccess(null);
                  setSlots(null);
                  setSelectedSlot(null);
                }}
                className="btn-secondary flex-1 justify-center"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface-900 to-brand-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-2">
            Book a PC
          </h1>
          <p className="text-surface-300">
            Reserve your computer slot in advance — ₹30/hour
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Step 1: Date */}
        <div className="card mb-5">
          <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-brand-600" /> Step 1: Select
            Date
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={selectedDate}
              min={today}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSlots(null);
                setSelectedSlot(null);
              }}
              className="input flex-1"
            />
            <button
              onClick={fetchSlots}
              disabled={loadingSlots}
              className="btn-primary px-6"
            >
              {loadingSlots ? (
                <>
                  <LoadingSpinner size="sm" /> Checking…
                </>
              ) : (
                "Check Availability"
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Slot selection */}
        {slots && (
          <div className="card mb-5">
            <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-brand-600" /> Step 2: Select Time
              Slot
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.start_time === slot.start_time;
                const isAvailable = slot.available_count > 0;
                return (
                  <button
                    key={slot.start_time}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={!isAvailable}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? "border-brand-600 bg-brand-50"
                        : isAvailable
                          ? "border-surface-200 hover:border-brand-300 hover:bg-brand-50/50 cursor-pointer"
                          : "border-surface-100 bg-surface-50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <p
                      className={`font-semibold text-sm ${isSelected ? "text-brand-700" : "text-surface-800"}`}
                    >
                      {slot.start_time}
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {isAvailable
                        ? `${slot.available_count} PC${slot.available_count > 1 ? "s" : ""} free`
                        : "Full"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: PC & Details */}
        {selectedSlot && (
          <form onSubmit={handleSubmit} className="card space-y-5">
            <h2 className="font-bold text-surface-900 flex items-center gap-2">
              <Monitor size={18} className="text-brand-600" /> Step 3: Choose PC
              & Details
            </h2>

            {/* PC selector */}
            <div>
              <label className="label">Select Computer</label>
              <div className="flex flex-wrap gap-2">
                {selectedSlot.available_computers.map((pc) => (
                  <button
                    key={pc}
                    type="button"
                    onClick={() => setSelectedPC(pc)}
                    className={`w-14 h-14 rounded-xl border-2 font-bold text-sm transition-all ${
                      selectedPC === pc
                        ? "border-brand-600 bg-brand-600 text-white shadow-brand"
                        : "border-surface-200 hover:border-brand-400 text-surface-700"
                    }`}
                  >
                    PC-{pc}
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="label">Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="input"
              >
                <option value="">Select purpose…</option>
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="label">Additional Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests…"
                className="input"
              />
            </div>

            {/* Summary */}
            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100 space-y-2 text-sm">
              <h3 className="font-bold text-brand-800 mb-2">Booking Summary</h3>
              {[
                ["Date", selectedDate],
                [
                  "Time",
                  `${selectedSlot.start_time} – ${selectedSlot.end_time}`,
                ],
                ["Computer", `PC #${selectedPC}`],
                ["Duration", "1 hour"],
                ["Price", formatCurrency(data?.price_per_hour || 0)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-brand-600">{k}</span>
                  <span className="font-semibold text-brand-900">{v}</span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" /> Confirming…
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
