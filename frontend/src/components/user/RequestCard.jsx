import { useState } from "react";
import {
  formatCurrency,
  formatDateTime,
  getErrorMessage,
} from "../../utils/helpers";
import StatusBadge from "../common/StatusBadge";
import { FileText, Calendar, Hash, Download, Upload, X } from "lucide-react";
import { uploadAPI } from "../../api";
import toast from "react-hot-toast";

// Helper: trigger a browser file download from a blob response
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

export default function RequestCard({ request, onCancel, onRefresh }) {
  const [downloading, setDownloading] = useState(false);
  const [uploadingNew, setUploadingNew] = useState(false);

  const canCancel = request.status === "pending";
  const hasAdminFile =
    request.file_uploaded_by === "admin" && request.status === "completed";
  const hasUserFile = request.file_uploaded_by === "user";
  const canReplaceUpload = ["pending", "processing"].includes(request.status);

  // Download the file sent by admin and user
  const handleDownloadFile = async () => {
    setDownloading(true);
    try {
      const res = await uploadAPI.downloadResult(request.id);
      triggerDownload(
        res.data,
        request.file_name || `result_${request.request_number}`,
      );
      toast.success("Download started!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  // Re-upload / replace user's own document
  const handleReplaceFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNew(true);
    try {
      await uploadAPI.uploadFile(request.id, file);
      toast.success("File updated!");
      onRefresh?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingNew(false);
      e.target.value = "";
    }
  };


  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText size={15} className="text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-surface-900 text-sm">
              {request.service?.name}
            </p>
            <p className="text-xs text-surface-400 font-mono">
              {request.request_number}
            </p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 text-xs text-surface-500 mb-4">
        <div className="flex items-center gap-1.5">
          <Hash size={11} />
          Qty: {request.quantity}
        </div>
        <div className="flex items-center gap-1.5">
          {formatCurrency(request.total_price)}
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <Calendar size={11} />
          {formatDateTime(request.created_at)}
        </div>
      </div>

      {/* User notes */}
      {request.notes && (
        <p className="text-xs text-surface-500 bg-surface-50 rounded-lg p-2.5 mb-3 line-clamp-2">
          {request.notes}
        </p>
      )}

      {/* Admin note */}
      {request.admin_notes && (
        <p className="text-xs text-brand-700 bg-brand-50 rounded-lg p-2.5 mb-3">
          <span className="font-semibold">Admin note:</span>{" "}
          {request.admin_notes}
        </p>
      )}

      {/* ── File section ── */}
      <div className="space-y-2 mb-3">
        {/* User uploaded a file — show name + optional replace button */}
        {!hasUserFile ? (
          <>
            {canReplaceUpload && (
              <label className="cursor-pointer flex-shrink-0">
                <span className="text-xs px-2 text-brand-600 hover:text-brand-700 font-semibold whitespace-nowrap transition-colors">
                  {uploadingNew ? "Uploading…" : "+ Add file"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleReplaceFile}
                  disabled={uploadingNew}
                />
              </label>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between gap-2 bg-surface-50 rounded-lg px-3 py-2">
            <p className="text-xs text-surface-500 flex items-center gap-1.5 truncate">
              <Upload size={12} className="flex-shrink-0 text-surface-500" />
              <span className="truncate">{request.file_name}</span>
            </p>
            <div className="flex gap-2">
              {canReplaceUpload && (
                <label className="cursor-pointer flex-shrink-0">
                  <span className="text-xs text-brand-600 hover:text-brand-700 font-semibold whitespace-nowrap transition-colors">
                    {uploadingNew ? "Uploading…" : "Replace"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleReplaceFile}
                    disabled={uploadingNew}
                  />
                </label>
              )}
              <button
                onClick={handleDownloadFile}
                className="flex items-center border border-surface-300 gap-1.5 hover:bg-surface-100 text-surface-400 text-xs font-semibold p-1 rounded-md transition-all disabled:opacity-60 flex-shrink-0"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Admin has uploaded the result — show prominent download button */}
        {hasAdminFile && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-3">
            <p className="text-xs text-brand-700 text-center font-semibold mb-2 gap-1.5">
              Your processed file is ready!
            </p>
            <button
              onClick={handleDownloadFile}
              disabled={downloading}
              className="w-full flex items-center truncate justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-60"
            >
              <Download size={14} />
              {downloading
                ? "Downloading…"
                : `${request.file_name || "Result File"}`}
            </button>
          </div>
        )}

        {/* Request is completed but no file from admin (e.g. offline service) */}
        {request.status === "completed" && !hasAdminFile && (
          <p className="text-xs text-brand-600 bg-brand-50 border border-brand-200 rounded-xl p-3 italic">
            Completed — collect your documents at the counter.
          </p>
        )}
      </div>

      {/* Cancel button */}
      {canCancel && (
        <button
          onClick={() => onCancel(request.id)}
          className="text-xs text-red-500 hover:text-red-600 font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Cancel Request
        </button>
      )}
    </div>
  );
}
