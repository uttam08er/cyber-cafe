import { useState } from "react";
import { Link } from "react-router-dom";
import { bookingsAPI } from "../../api";
import { useFetch } from "../../hooks/useFetch";
import {
  formatCurrency,
  formatDate,
  getErrorMessage,
} from "../../utils/helpers";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import { CalendarDays, Monitor, Clock, Plus } from "lucide-react";
import PopUp from "../../components/common/PopUp";

export default function MyBookings() {
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } = useFetch(
    () => bookingsAPI.getMy({ page }),
    [page],
  );

  const bookings = data?.bookings || [];
  const pagination = data?.pagination;

  const [popUp, setPopUp] = useState(false);
  const [cancelId, setCancelId] = useState("");
  const openPopUp = (id) => {
    setCancelId(id);
    setPopUp(true);
  };

  const handleCancel = async (id) => {
    try {
      const res = await bookingsAPI.cancel(id);
      if (!res?.data?.[0]?.success) {
        toast.error(res?.data?.[0]?.message || "Booking not cancelled");
        return;
      }
      toast.success("Booking cancelled");
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPopUp(false);
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-surface-900 text-xl font-display">
          My Bookings
        </h2>
        <Link to="/booking" className="btn-primary text-sm py-2 px-4">
          <Plus size={14} /> Book a PC
        </Link>
      </div>

      {loading && <LoadingSpinner size="lg" className="py-16" />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && (
        <>
          {bookings.length === 0 ? (
            <div className="card text-center py-16 text-surface-400">
              <CalendarDays size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No bookings yet</p>
              <Link
                to="/booking"
                className="text-brand-600 text-sm font-semibold hover:underline mt-2 inline-block"
              >
                Book a PC slot →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-brand-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                        <Monitor size={14} className="text-brand-600" />
                        <span className="text-brand-600 font-bold text-xs mt-0.5">
                          PC{b.computer_number}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-surface-900">
                          {b.booking_date}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-surface-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {b.start_time} – {b.end_time}
                          </span>
                          <span>{b.duration_hours}h</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="mt-3 pt-3 border-t border-surface-100 flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-surface-500">
                      <span>{formatCurrency(b.total_price)}</span>
                      <span className="font-mono">{b.booking_number}</span>
                      {b.purpose && <span>🎯 {b.purpose}</span>}
                    </div>
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => openPopUp(b.id)}
                        className="text-xs text-red-500 bg-red-50 font-semibold hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <PopUp
            isOpen={!!popUp}
            onClose={() => setPopUp(false)}
            title="Cancel Booking"
            message="cancel your booking"
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
                  onClick={() => handleCancel(cancelId)}
                  className="btn-primary justify-center"
                >
                  Yes, cancel
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
    </div>
  );
}
