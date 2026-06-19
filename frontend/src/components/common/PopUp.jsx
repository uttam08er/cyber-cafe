import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, message, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-[-10%] z-50 flex items-center justify-center p-12 bg-white/900 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {/* <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4"> */}
            <X size={32} className="text-brand-700" />
          </div>
          <h2 className="text-2xl font-bold font-display text-surface-900 mb-4">
            {title}
          </h2>
          <p className="text-sm text-surface-500 mb-8">
            You are going to {message}!
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
