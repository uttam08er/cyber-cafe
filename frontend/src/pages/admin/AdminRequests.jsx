import { useRef, useState } from "react";
import { requestsAPI, uploadAPI } from "../../api";
import { useFetch } from "../../hooks/useFetch";
import {
  formatCurrency,
  formatDateTime,
  getErrorMessage,
} from "../../utils/helpers";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import {
  CheckCircle,
  Download,
  FileText,
  Filter,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUSES = [
  "pending",
  "processing",
  "completed",
  "rejected",
  "cancelled",
];

const ADMIN_STATUSES = ["pending", "processing", "completed", "rejected"];

function triggerDownload(blobData, filename) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function AdminRequests() {
  const fileRef = useRef();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [updating, setUpdating] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadingFile, setDownloading] = useState(false);

  const params = {
    page,
    ...(dateFilter ? { date: dateFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { data, loading, refetch } = useFetch(
    () => requestsAPI.adminGetAll(params),
    [page, dateFilter, statusFilter],
  );

  const requests = data?.requests || [];
  const pagination = data?.pagination;

  const openDetail = (r) => {
    setSelected(r);
    setNewStatus(r.status);
    setFile(null);
    setAdminNotes(r.admin_notes || "");
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const maxSize = 10 * 1024 * 1024;
    if (f.size > maxSize) {
      toast.error("File must be under 10MB");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleDownloadFile = async () => {
    if (!selected?.file_path) return;
    setDownloading(true);
    try {
      const res = await uploadAPI.adminDownloadFile(selected.id);
      triggerDownload(
        res.data,
        selected.file_name || `user_file_${selected.request_number}`,
      );
      toast.success("Download started!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleUploadFile = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadAPI.uploadFile(selected.id, file, (progressEvent) => {
        const pct = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        setUploadProgress(pct);
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (file) return;
    try {
      await uploadAPI.deleteFile(selected.id);
      // setSelected(null);
      // refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleStatusUpdate = async () => {
    if (!selected) return;
    if (newStatus !== "completed" && selected.file_uploaded_by === "admin") {
      handleDeleteFile();
    }
    setUpdating(true);
    handleUploadFile();
    try {
      await requestsAPI.adminUpdateStatus(selected.id, {
        status: newStatus,
        admin_notes: adminNotes,
      });
      toast.success("Status updated!");
      setSelected(null);
      // refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
      refetch();
    }
  };

  const statusRowColor = {
    pending: "border-l-amber-400",
    processing: "border-l-blue-400",
    completed: "border-l-green-400",
    rejected: "border-l-red-400",
    cancelled: "border-l-surface-300",
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-600 font-display">
            Requests
          </h1>
          <p className="text-surface-500 text-sm mt-0.5">
            Manage and update service requests
          </p>
        </div>
        <button onClick={refetch} className="btn-secondary text-sm py-2 px-3">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <input
            type="date"
            max={new Date().toISOString().split("T")[0]}
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

      {loading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : (
        <>
          {requests.length === 0 ? (
            <div className="card text-center py-16 text-surface-400">
              <p>No requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r.id}
                  onClick={() => openDetail(r)}
                  className={`card cursor-pointer hover:shadow-md transition-all border-l-4 ${statusRowColor[r.status] || "border-l-surface-200"} p-4`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-surface-900">
                          {r.service?.name}
                        </p>
                        <span className="font-mono text-xs text-surface-400">
                          {r.request_number}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-surface-500">
                          👤 {r.user?.full_name} - {r.user?.email}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-surface-400 mt-1.5">
                        <span>Qty: {r.quantity}</span>
                        <span>{formatCurrency(r.total_price)}</span>
                        <span>{formatDateTime(r.created_at)}</span>
                        {r.file_name && (
                          <span
                            className={`flex items-center gap-1 ${
                              r.file_uploaded_by === "admin"
                                ? "text-green-600 font-semibold"
                                : "text-amber-600"
                            }`}
                          >
                            📎{r.file_name}
                            <span className="text-surface-400">
                              (
                              {r.file_uploaded_by === "admin"
                                ? "admin result"
                                : "user file"}
                              )
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                </div>
              ))}
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

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`Request: ${selected?.request_number}`}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Service", selected.service?.name],
                ["Customer", selected.user?.full_name],
                ["Email", selected.user?.email],
                ["Quantity", selected.quantity],
                ["Total Price", formatCurrency(selected.total_price)],
                ["Submitted", formatDateTime(selected.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="bg-surface-50 rounded-xl p-3">
                  <p className="text-xs text-surface-400 uppercase font-semibold">
                    {k}
                  </p>
                  <p className="font-semibold text-surface-900 text-sm mt-0.5 break-all">
                    {v || "—"}
                  </p>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div className="bg-surface-50 rounded-xl p-3">
                <p className="text-xs text-surface-400 uppercase font-semibold mb-1">
                  User Notes
                </p>
                <p className="font-semibold text-sm text-surface-900">
                  {selected.notes}
                </p>
              </div>
            )}

            {selected.file_path && (
              <>
                <div
                  className={`rounded-xl p-4 border ${
                    selected.file_uploaded_by === "admin"
                      ? "bg-brand-50 border-brand-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={`text-xs font-semibold mb-1 ${
                          selected.file_uploaded_by === "admin"
                            ? "text-brand-700"
                            : "text-amber-700"
                        }`}
                      >
                        {selected.file_uploaded_by === "admin"
                          ? "Admin uploaded file"
                          : "User uploaded file"}
                      </p>
                      <p className="text-sm font-medium text-surface-800">
                        {selected.file_name}
                      </p>
                      {selected.file_size && (
                        <p className="text-xs text-surface-500 mt-0.5">
                          {(selected.file_size / 1024).toFixed(1)} KB ·{" "}
                          {selected.file_type?.toUpperCase()}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleDownloadFile}
                      disabled={downloadingFile}
                      className={`flex items-center gap-1.5 
                        ${
                          selected.file_uploaded_by === "admin"
                            ? "bg-brand-600 hover:bg-brand-700"
                            : "bg-amber-600 hover:bg-amber-700"
                        } 
                          text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all disabled:opacity-60 flex-shrink-0`}
                    >
                      <Download size={13} />
                      {downloadingFile ? "Downloading…" : "Download"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {selected.status === "cancelled" ? (
              <p className="text-xs text-center border border-red-200 text-red-600 italic bg-red-50 rounded-lg p-2.5 mb-3">
                <span className="font-semibold">Request cancelled by User</span>
              </p>
            ) : (
              <div className={"border-t border-surface-100 pt-4 space-y-3"}>
                <h3 className="font-bold text-surface-900">Update Status</h3>
                <div>
                  <label className="label">New Status</label>
                  <select
                    value={newStatus || "cancelled"}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input"
                  >
                    {ADMIN_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {newStatus === "completed" && (
                  <div>
                    {!file ? (
                      <>
                        <label className="label">Upload Document</label>
                        <p className="text-xs text-accent-130 mb-3">
                          All required documents must be wrapped in a single
                          file.
                        </p>
                        <div
                          onDrop={handleDrop}
                          onDragOver={(e) => e.preventDefault()}
                          onClick={() => fileRef.current?.click()}
                          className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer border-brand-400 bg-brand-50/50 hover:bg-brand-100 transition-all"
                        >
                          <Upload
                            size={28}
                            className="mx-auto text-surface-400 mb-2"
                          />
                          <p className="font-medium text-brand-600 text-sm">
                            Drop file here or click to browse
                          </p>
                          <p className="text-xs text-surface-400 mt-1">
                            PDF, JPG, PNG, DOC, DOCX — Max 10MB
                          </p>
                          <input
                            ref={fileRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleFileChange}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-xl border border-brand-200">
                        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={18} className="text-brand-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-surface-900 text-sm truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-surface-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            if (fileRef.current) fileRef.current.value = "";
                          }}
                          className="p-2 rounded-lg border border-brand-200 hover:bg-brand-200 text-brand-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {uploading && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-surface-500 mb-1">
                          <span>Uploading…</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 rounded-full transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}


                <div>
                  <label className="label">
                    Admin Notes{" "}
                    <span className="text-surface-400 font-normal">
                      (visible to user)
                    </span>
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                    className="input resize-none"
                    placeholder="Optional note for the user…"
                  />
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === selected.status}
                  className="btn-primary w-full justify-center"
                >
                  {updating ? "File uploading…" : "Update Status"}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
