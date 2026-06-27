import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { requestsAPI, bookingsAPI } from "../../api";
import { useFetch } from "../../hooks/useFetch";
import { formatCurrency, formatDate } from "../../utils/helpers";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  FileText,
  CalendarDays,
  Clock,
  CheckCircle,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function DashboardOverview() {
  const { data: reqData, loading: reqLoading } = useFetch(() => requestsAPI.getMy({ page: 1 }), [])
  const { data: bkgData, loading: bkgLoading } = useFetch(() => bookingsAPI.getMy({ page: 1 }), [])

  const requests = reqData?.requests || [];
  const bookings = bkgData?.bookings || [];
  const total = reqData?.pagination;

  const stats = [
    {
      label: "Total Requests",
      value: total?.total ?? 0,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending",
      value: total?.pending_total ?? 0,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Processing",
      value: total?.processing_total ?? 0,
      icon: Clock,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Completed",
      value: total?.completed_total ?? 0,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}
            >
              <Icon size={16} />
            </div>
            <p className="text-2xl font-bold text-surface-900 font-display">
              {value}
            </p>
            <p className="text-xs text-surface-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-bold text-surface-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/services"
            className="flex items-center gap-3 p-4 border border-surface-200 rounded-xl hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
          >
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center group-hover:bg-brand-100 transition-colors">
              <Plus size={16} className="text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-surface-900 text-sm">
                New Service Request
              </p>
              <p className="text-xs text-surface-400">
                Print, scan, form filling…
              </p>
            </div>
            <ArrowRight
              size={14}
              className="ml-auto text-surface-400 group-hover:text-brand-500 transition-colors"
            />
          </Link>
          <Link
            to="/booking"
            className="flex items-center gap-3 p-4 border border-surface-200 rounded-xl hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
          >
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center group-hover:bg-brand-100 transition-colors">
              <CalendarDays size={16} className="text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-surface-900 text-sm">
                Book a Computer
              </p>
              <p className="text-xs text-surface-400">Reserve a PC slot</p>
            </div>
            <ArrowRight
              size={14}
              className="ml-auto text-surface-400 group-hover:text-brand-500 transition-colors"
            />
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-surface-900">Recent Requests</h2>
          <Link
            to="/dashboard/requests"
            className="text-xs text-brand-600 font-semibold hover:underline"
          >
            View all →
          </Link>
        </div>
        {reqLoading ? (
          <LoadingSpinner className="py-8" />
        ) : requests.length === 0 ? (
          <div className="text-center py-10 text-surface-400">
            <FileText size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No requests yet.</p>
            <Link
              to="/services"
              className="text-brand-600 text-sm font-semibold hover:underline mt-1 inline-block"
            >
              Browse services →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 text-sm truncate">
                    {r.service?.name}
                  </p>
                  <p className="text-xs text-surface-400 font-mono">
                    {r.request_number}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={r.status} />
                  <p className="text-xs text-surface-400 mt-1">
                    {formatDate(r.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-surface-900">Recent Bookings</h2>
          <Link
            to="/dashboard/bookings"
            className="text-xs text-brand-600 font-semibold hover:underline"
          >
            View all →
          </Link>
        </div>
        {bkgLoading ? (
          <LoadingSpinner className="py-8" />
        ) : bookings.length === 0 ? (
          <div className="text-center py-10 text-surface-400">
            <CalendarDays size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No bookings yet.</p>
            <Link
              to="/booking"
              className="text-brand-600 text-sm font-semibold hover:underline mt-1 inline-block"
            >
              Book a PC slot →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors"
              >
                <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-600 font-bold text-xs">
                    PC{b.computer_number}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900 text-sm">
                    {b.booking_date}
                  </p>
                  <p className="text-xs text-surface-400">
                    {b.start_time} – {b.end_time} ·{" "}
                    {formatCurrency(b.total_price)}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
