import { useState } from "react";
import { requestsAPI } from "../../api";
import { useFetch } from "../../hooks/useFetch";
import RequestCard from "../../components/user/RequestCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../../utils/helpers";
import toast from "react-hot-toast";
import { FileText, Plus, X } from "lucide-react";
import PopUp from "../../components/common/PopUp";

const STATUS_TABS = [
  "all",
  "pending",
  "processing",
  "completed",
  "cancelled",
  "rejected",
];

export default function MyRequests() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const params = { page, ...(status !== "all" ? { status } : {}) };
  const { data, loading, error, refetch } = useFetch(
    () => requestsAPI.getMy(params),
    [status, page],
  );

  const requests = data?.requests || [];
  const pagination = data?.pagination;

  const [popUp, setPopUp] = useState(false);
  const [cancelId, setCancelId] = useState("");
  const openPopUp = (id) => {
    setCancelId(id);
    setPopUp(true);
  };

  const handleCancel = async (id) => {
    try {
      const res = await requestsAPI.cancel(id);
      if (!res?.data?.[0]?.success) {
        toast.error(res?.data?.[0]?.message || "Request not cancelled");
        return;
      }
      toast.success("Request cancelled");
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
          My Requests
        </h2>
        <Link to="/services" className="btn-primary text-sm py-2 px-4">
          <Plus size={14} /> New Request
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              status === s
                ? "bg-brand-600 text-white"
                : "bg-white border border-surface-200 text-surface-600 hover:border-brand-300"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner size="lg" className="py-16" />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && (
        <>
          {requests.length === 0 ? (
            <div className="card text-center py-16 text-surface-400">
              <FileText size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No requests found</p>
              <Link
                to="/services"
                className="text-brand-600 text-sm font-semibold hover:underline mt-2 inline-block"
              >
                Browse services →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((r) => (
                <RequestCard key={r.id} request={r} onCancel={openPopUp} onRefresh={refetch} />
              ))}
            </div>
          )}
          <PopUp
            isOpen={!!popUp}
            onClose={() => setPopUp(false)}
            title="Cancel Request"
            message="cancel your request"
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
            <div className="flex justify-center gap-2 mt-4">
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
