import { Search } from "lucide-react";
import { inputCls } from "./ui.jsx";

const MODES = [["all", "All time"], ["month", "Month"], ["range", "Date range"]];

// Shared date + status filter bar for orders and payments
export default function DateFilters({ filters, setFilters, statusOptions, statusKey = "paymentStatus", extra, prefix }) {
  const set = (patch) => setFilters({ ...filters, ...patch });
  return (
    <div className="flex flex-col xl:flex-row gap-3 p-4 border-b border-neutral-100">
      <div className="flex rounded-xl border border-neutral-200 p-1 bg-[#F7F5F1] shrink-0">
        {MODES.map(([mode, label]) => (
          <button key={mode} type="button" data-testid={`${prefix}-mode-${mode}`} onClick={() => set({ mode })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filters.mode === mode ? "bg-[#111] text-white" : "text-neutral-500 hover:text-[#111]"}`}>{label}</button>
        ))}
      </div>
      {filters.mode === "month" && <input data-testid={`${prefix}-month-input`} type="month" value={filters.month} onChange={(e) => set({ month: e.target.value })} className={`${inputCls} xl:w-44`} />}
      {filters.mode === "range" && (
        <div className="flex gap-2 items-center">
          <input data-testid={`${prefix}-from-input`} type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} className={inputCls} />
          <span className="text-xs text-neutral-400">to</span>
          <input data-testid={`${prefix}-to-input`} type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} className={inputCls} />
        </div>
      )}
      <select data-testid={`${prefix}-status-filter`} value={filters[statusKey]} onChange={(e) => set({ [statusKey]: e.target.value })} className={`${inputCls} xl:w-44`}>
        {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {extra}
      <div className="relative flex-1 min-w-[180px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input data-testid={`${prefix}-search-input`} value={filters.q} onChange={(e) => set({ q: e.target.value })} placeholder="Order no., name, phone, product" className={`${inputCls} pl-9`} />
      </div>
    </div>
  );
}

export const toParams = (f) => {
  const params = { q: f.q || undefined };
  if (f.mode === "month" && f.month) params.month = f.month;
  if (f.mode === "range") { params.from = f.from || undefined; params.to = f.to || undefined; }
  ["paymentStatus", "orderStatus", "customer"].forEach((k) => { if (f[k]) params[k] = f[k]; });
  return params;
};

export const currentMonth = () => new Date().toISOString().slice(0, 7);
