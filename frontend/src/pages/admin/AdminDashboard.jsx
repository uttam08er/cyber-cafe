import { adminAPI } from "../../api";
import { useFetch } from "../../hooks/useFetch";
import StatCard from "../../components/admin/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatCurrency, formatDateTime } from "../../utils/helpers";
import {
  Users,
  FileText,
  CalendarDays,
  DollarSign,
  Clock,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  BadgeCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#ef4444", "#22c55e", "#f59e0b", "#3b82f6", "#6b7280"];
const GRADIENTS = [
  ["#5eef93ff", "#016927ff"], // green
  ["#73d7f3ff", "#03698b"], // aqua
  ["#fcd34d", "#a26803"], // yellow
  ["#fb9393", "#9b0404"], // red
  ["#ad7dfa", "#6e02a8"], // purple
  ["#b2b5b9", "#565b66"], // gray
  ["#fc844d", "#a23503"], // orang
  ["#7db7fa", "#0241a8"], // blue
];

export default function AdminDashboard() {
  const { data, loading, refetch } = useFetch(
    () => adminAPI.getDashboard(),
    [],
  );
  if (loading) return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-600 font-display">
            Dashboard
          </h1>
          <p className="text-surface-500 text-sm mt-0.5">
            Welcome back — here's what's happening today
          </p>
        </div>
        <button onClick={refetch} className="btn-secondary text-sm py-2 px-3">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={data.users.total}
          icon={Users}
          color="brand"
          trend={data.users.trend}
          subtitle={`+${data.users.new_this_week} this week`}
        />
        <StatCard
          title="Total Requests"
          value={data.requests.total}
          icon={FileText}
          color="purple"
          trend={data.requests.trend}
          subtitle={`${data.requests.this_month} this month`}
        />
        <StatCard
          title="Upcoming Bookings"
          value={data.bookings.upcoming}
          icon={CalendarDays}
          color="orange"
          trend={data.bookings.trend}
          subtitle={`${data.bookings.this_month} this month`}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.revenue.total)}
          icon={DollarSign}
          color="green"
          trend={data.revenue.trend}
          subtitle="Requests + Bookings"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Pending",
            value: data.requests.pending,
            icon: Clock,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Processing",
            value: data.requests.processing,
            icon: TrendingUp,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Completed",
            value: data.requests.completed,
            icon: CheckCircle,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Unread Messages",
            value: data.unread_contacts,
            icon: MessageSquare,
            color: "bg-pink-50 text-pink-600",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
            >
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900 font-display">
                {value}
              </p>
              <p className="text-xs text-surface-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card">
          <h2 className="font-bold text-surface-900 mb-4">
            Requests — Last 7 Days
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={data.daily_requests}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                tickFormatter={(d) => d.slice(5)}
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                formatter={(v) => [v, "Requests"]}
                labelFormatter={(l) => `Date: ${l}`}
                contentStyle={{ borderRadius: "10px", fontSize: "12px" }}
              />
              <Bar
                dataKey="count"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationEasing="ease"
                animationDuration={1000}
                animationBegin={100}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-bold text-surface-900 mb-4">
            Status Distribution
          </h2>
          {data.status_distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.status_distribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ status, percent }) =>
                    `${status} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  fontSize={10}
                  isAnimationActive={true}
                  animationEasing="ease"
                  animationDuration={1000}
                  animationBegin={100}
                >
                  {data.status_distribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "10px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-surface-400 text-sm">
              No data yet
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-surface-900 mb-4">Top Services</h2>
          {data.service_popularity.length === 0 ? (
            <p className="text-surface-400 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.service_popularity.map(({ name, count }, i) => (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-surface-600">{name}</span>
                    <span className="text-surface-500">{count} requests</span>
                  </div>
                  <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      key={i}
                      className="h-full  rounded-full transition-all"
                      style={{
                        background: `linear-gradient(to right, ${
                          GRADIENTS[i % GRADIENTS.length][0]
                        }, ${GRADIENTS[i % GRADIENTS.length][1]})`,
                        width: `${(count / (data.service_popularity?.[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-bold text-surface-900 mb-4">Recent Requests</h2>
          {data.recent_requests.length === 0 ? (
            <p className="text-surface-400 text-sm">No requests yet</p>
          ) : (
            <div className="space-y-2.5">
              {data.recent_requests.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 text-sm truncate">
                      {r.service?.name}
                    </p>
                    <p className="text-xs text-surface-400">
                      {r.user?.full_name} · {formatDateTime(r.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
