import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/helpers";
import {
  Printer,
  Camera,
  ScanLine,
  FileText,
  Copy,
  Shield,
  Globe,
  Layers,
} from "lucide-react";

const iconMap = {
  printer: Printer,
  photo: Camera,
  scan: ScanLine,
  form: FileText,
  copy: Copy,
  camera: Camera,
  shield: Shield,
  globe: Globe,
  document: FileText,
  default: Layers,
};

export default function ServiceCard({ service }) {
  const Icon = iconMap[service.icon] || iconMap.default;

  const categoryColors = {
    printing: "bg-blue-50 text-blue-600",
    scanning: "bg-purple-50 text-purple-600",
    assistance: "bg-orange-50 text-orange-600",
    photo: "bg-pink-50 text-pink-600",
    other: "bg-surface-100 text-surface-600",
  };
  const colorCls = categoryColors[service.category] || categoryColors.other;

  return (
    <div className="card hover:shadow-brand hover:-translate-y-1 transition-all duration-200 group flex flex-col">
      <div className="grid grid-cols-2 items-center mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center  ${colorCls}`}>
          <Icon size={22} />
        </div>
        <div className="flex  justify-end">
        
        <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full whitespace-nowrap">
          {formatCurrency(service.price)}/
          {service.price_unit?.replace("per ", "")}
        </span>
        </div>
          
      </div>

      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="font-bold text-surface-900 text-base group-hover:text-brand-600 transition-colors">
          {service.name}
        </h3>
        {/* <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full whitespace-nowrap">
          {formatCurrency(service.price)}/{service.price_unit?.replace("per ", "")}
        </span> */}
      </div>

      <p className="text-sm text-surface-500 mb-4 flex-1 leading-relaxed">
        {service.description}
      </p>

      <div className="flex items-center justify-between text-xs text-surface-500 mb-4">
        {service.turnaround_time && <span>⏱ {service.turnaround_time}</span>}
        {service.requires_upload && (
          <span className="text-amber-600 font-medium">📎 Upload required</span>
        )}
      </div>

      <Link
        to={`/services/apply/${service.id}`}
        className="btn-primary w-full justify-center text-sm py-2"
      >
        Apply Now
      </Link>
    </div>
  );
}
