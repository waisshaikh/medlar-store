import { X } from "lucide-react";

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#E52B32] uppercase">{eyebrow}</span>}
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#111] tracking-tight mt-1">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className = "", testid }) {
  return (
    <section data-testid={testid} className={`bg-white border border-neutral-200/80 rounded-2xl ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-[#111]">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, dark, testid }) {
  return (
    <div data-testid={testid} className={`rounded-2xl p-5 border ${dark ? "bg-[#101010] text-white border-[#101010]" : "bg-white border-neutral-200/80"}`}>
      <p className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] ${dark ? "text-neutral-400" : "text-neutral-500"}`}>{label}</p>
      <p className="font-heading font-bold text-2xl sm:text-3xl mt-2 tracking-tight">{value}</p>
      {hint && <p className={`text-xs mt-1 ${dark ? "text-neutral-500" : "text-neutral-400"}`}>{hint}</p>}
    </div>
  );
}

const STATUS_STYLES = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  Confirmed: "bg-neutral-100 text-neutral-700 border-neutral-200",
  Shipped: "bg-sky-50 text-sky-700 border-sky-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Hidden: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export function StatusBadge({ status, testid }) {
  return (
    <span data-testid={testid} className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] || STATUS_STYLES.Confirmed}`}>
      {status}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="py-16 px-6 text-center">
      {Icon && <Icon size={36} className="mx-auto text-neutral-300 mb-3" />}
      <p className="font-heading font-semibold text-[#111]">{title}</p>
      {text && <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner() {
  return <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-[#E52B32] border-t-transparent rounded-full animate-spin" /></div>;
}

export function Modal({ open, onClose, title, children, wide, testid }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div data-testid={testid} className={`relative w-full ${wide ? "max-w-3xl" : "max-w-lg"} bg-white rounded-2xl shadow-2xl my-8`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="font-heading font-bold text-lg text-[#111]">{title}</h3>
          <button data-testid="modal-close-button" onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-[#111] hover:bg-neutral-100"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#111] transition-colors";
export const labelCls = "block text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-500 mb-1.5";
export const btnPrimary = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E52B32] hover:bg-[#c92027] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50";
export const btnDark = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#111] hover:bg-[#E52B32] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50";
export const btnGhost = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white hover:border-[#111] text-[#111] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50";
