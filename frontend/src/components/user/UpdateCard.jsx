import { formatDate } from "../../utils/helpers";
import { ExternalLink, Pin, AlertTriangle } from "lucide-react";

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORY_STYLE = {
  "Govt Forms": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Jobs: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  "Admit Cards": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  Results: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  Services: {
    bg: "bg-brand-50",
    text: "text-brand-700",
    border: "border-brand-200",
  },
  "Impt Notice": {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
};

export default function UpdateCard({ update }) {
  const style = CATEGORY_STYLE[update.category] || {
    bg: "bg-surface-50",
    text: "text-surface-700",
    border: "border-surface-200",
  };

  return (
    <div
      className={`card border-l-4 ${update.is_important ? "border-l-red-600" : "border-l-brand-600"} hover:shadow-md transition-shadow duration-200`}
    >
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
        >
          {update.category}
        </span>
        {update.is_pinned && (
          <span className="inline-flex items-center gap-1 p-0.5 text-xs font-semibold text-brand-700">
            <Pin size={14} />
          </span>
        )}
        {update.is_important && (
          <span className="inline-flex items-center gap-1 p-0.5 mb-0.5 text-xs font-semibold text-red-600">
            <AlertTriangle size={14} />
          </span>
        )}
        {update.is_new && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-green-500 animate-pulse">
            NEW
          </span>
        )}
        <span className="ml-auto text-xs text-surface-400">
          {formatDate(update.created_at)}
        </span>
      </div>

      {/* Content */}
      <h3 className="font-bold text-surface-900 text-base mb-2 leading-snug">
        {update.title}
      </h3>
      <p className="text-sm text-surface-600 leading-relaxed">
        {update.description}
      </p>

      {/* Link */}
      {update.link && (
        <div className="flex items-center justify-between border-t border-surface-200 mt-4">
          <a
            href={update.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors mt-3"
          >
            Learn More <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* Expired badge */}
      {update.is_expired && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-full text-xs bg-surface-200 text-surface-500">
            Expired
          </span>
        </div>
      )}
    </div>
  );
}
