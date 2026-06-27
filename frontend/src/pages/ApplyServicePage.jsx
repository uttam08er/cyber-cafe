import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { servicesAPI, requestsAPI, uploadAPI } from "../api";
import { useFetch } from "../hooks/useFetch";
import { formatCurrency, getErrorMessage } from "../utils/helpers";
import LoadingSpinner from "../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import { Upload, X, FileText, ArrowLeft, CheckCircle } from "lucide-react";
import ScrollToTop from "../components/common/ScrollToTop";

export default function ApplyServicePage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const { data: service, loading } = useFetch(
    () => servicesAPI.getOne(serviceId),
    [serviceId],
  );

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (service?.requires_upload && !file) {
      toast.error("This service requires a file upload");
      return;
    }
    setSubmitting(true);
    try {
      const res = await requestsAPI.create({
        service_id: parseInt(serviceId),
        quantity,
        notes,
      });
      const newRequest = res?.data?.[0]?.data;
      if (!newRequest?.id) {
        throw new Error("Failed to create request. Please try again.");
      }
      if (file) {
        setUploading(true);
        await uploadAPI.uploadFile(newRequest.id, file, (progressEvent) => {
          const pct = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(pct);
        });
        setUploading(false);
      }

      setSuccess(newRequest); 
      toast.success("Request submitted successfully!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  if (!service)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-surface-500">Service not found.</p>
      </div>
    );

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
              Request Submitted!
            </h2>
            <p className="text-surface-500 mb-2">Your request number is:</p>
            <p className="font-mono font-bold text-brand-600 text-xl mb-6">
              {success.request_number}
            </p>
            <p className="text-sm text-surface-500 mb-8">
              We'll process your request shortly. You can track its status in
              your dashboard.
            </p>
            <div className="flex gap-3">
              <Link
                to="/dashboard/requests"
                className="btn-primary flex-1 justify-center"
              >
                Track Request
              </Link>
              <Link
                to="/services"
                className="btn-secondary flex-1 justify-center"
              >
                More Services
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const totalPrice = service.price * quantity;

  return (
    <div className="min-h-screen bg-surface-50 py-10 px-4 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 transition-colors mb-6"
        >
          <ArrowLeft size={15} /> Back to Services
        </Link>

        <div className="card mb-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={22} className="text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-900 font-display">
                {service.name}
              </h1>
              <p className="text-surface-500 text-sm mt-0.5">
                {service.description}
              </p>
              <div className="flex gap-3 mt-2 text-sm">
                <span className="text-brand-600 font-semibold">
                  {formatCurrency(service.price)} / {service.price_unit}
                </span>
                {service.turnaround_time && (
                  <span className="text-surface-500">
                    ⏱ {service.turnaround_time}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <h2 className="font-bold text-surface-900 text-lg font-display">
            Request Details
          </h2>

          <div>
            <label className="label">Quantity / Number of Pages</label>
            <input
              type="number"
              min="1"
              max="500"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="input w-32"
            />
            <p className="text-xs text-surface-500 mt-1">
              Estimated price:{" "}
              <span className="font-semibold text-brand-600">
                {formatCurrency(totalPrice)}
              </span>
            </p>
          </div>

          <div>
            <label className="label">
              Special Instructions{" "}
              <span className="text-surface-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Double-sided printing, A3 size, urgent…"
              rows={3}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="label">
              Upload Document
              {service.requires_upload && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <p className="text-xs text-accent-130 mb-3">
              All required documents must be wrapped in a single file.
            </p>
            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer border-brand-400 bg-brand-50/50 hover:bg-brand-100 transition-all"
              >
                <Upload size={28} className="mx-auto text-surface-400 mb-2" />
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
                  onClick={() => setFile(null)}
                  className="p-1.5 rounded-lg hover:bg-brand-200 transition-colors text-surface-500"
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

          <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">
                {service.price_unit} × {quantity}
              </span>
              <span className="font-bold text-surface-900">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <p className="text-xs text-surface-500 mt-1">
              Final price may vary. Pay at counter when you collect.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" /> Processing…
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
