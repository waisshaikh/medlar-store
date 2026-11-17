import { Trash2, Save } from "lucide-react";
import ImagePicker from "./ImagePicker.jsx";
import { inputCls, labelCls, btnDark, btnGhost } from "./ui.jsx";

export const emptyVariant = (price = "") => ({ name: "", sku: "", color: "", size: "", priceAmount: price, originalPriceAmount: "", stock: 10, active: true, existing: [], files: [], attrs: {} });

export const fromVariant = (v) => {
  const attrs = v.attributes || {};
  return {
    _id: v._id, name: v.name || "", sku: v.sku || "", color: v.color || attrs.color || "", size: attrs.size || attrs.capacity || "",
    priceAmount: v.price?.amount ?? "", originalPriceAmount: v.originalPrice?.amount ?? "", stock: v.stock ?? 0, active: v.active !== false,
    existing: (v.images || []).map((i) => i.url), files: [], attrs,
  };
};

export const toVariantForm = (v) => {
  const form = new FormData();
  const attributes = { ...v.attrs };
  delete attributes.capacity;
  if (v.color) attributes.color = v.color; else delete attributes.color;
  if (v.size) attributes.size = v.size; else delete attributes.size;
  form.append("name", v.name || [v.color, v.size].filter(Boolean).join(" / "));
  form.append("sku", v.sku);
  form.append("color", v.color);
  form.append("priceAmount", v.priceAmount);
  form.append("originalPriceAmount", v.originalPriceAmount);
  form.append("stock", v.stock);
  form.append("active", v.active);
  form.append("attributes", JSON.stringify(attributes));
  form.append("keepImages", JSON.stringify(v.existing));
  v.files.forEach((f) => form.append("images", f));
  return form;
};

export const validateVariant = (v) => {
  if (!v.name && !v.color && !v.size) return "Give each variant a name, colour or size";
  if (!(Number(v.priceAmount) > 0)) return "Each variant needs a price";
  if (v.stock === "" || Number(v.stock) < 0) return "Stock must be 0 or more";
  if (v.existing.length + v.files.length === 0) return "Each variant needs at least one image";
  return null;
};

function Field({ label, children }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

export default function VariantEditor({ index, value, onChange, onSave, onDelete, saving }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const tid = `variant-${index}`;
  return (
    <div data-testid={`${tid}-editor`} className="border border-neutral-200 rounded-2xl p-4 sm:p-5 bg-[#FBFAF7]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[#111] text-white text-xs font-bold flex items-center justify-center">{index + 1}</span>
          <span className="font-heading font-semibold text-sm">{value.name || [value.color, value.size].filter(Boolean).join(" / ") || "New variant"}</span>
          {value._id && Number(value.stock) <= 5 && <span className="text-[10px] font-bold uppercase text-amber-600">Low stock</span>}
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600 cursor-pointer">
          <input data-testid={`${tid}-active-toggle`} type="checkbox" checked={value.active} onChange={set("active")} className="accent-[#E52B32]" /> Visible
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Field label="Variant name"><input data-testid={`${tid}-name-input`} className={inputCls} value={value.name} onChange={set("name")} placeholder="Onyx Black 24L" /></Field>
        <Field label="Colour"><input data-testid={`${tid}-color-input`} className={inputCls} value={value.color} onChange={set("color")} placeholder="Black" /></Field>
        <Field label="Size / capacity"><input data-testid={`${tid}-size-input`} className={inputCls} value={value.size} onChange={set("size")} placeholder="24L" /></Field>
        <Field label="SKU"><input data-testid={`${tid}-sku-input`} className={`${inputCls} uppercase`} value={value.sku} onChange={set("sku")} placeholder="MDL-BPK-01" /></Field>
        <Field label="Price (₹)"><input data-testid={`${tid}-price-input`} type="number" min={1} className={inputCls} value={value.priceAmount} onChange={set("priceAmount")} /></Field>
        <Field label="MRP (₹, optional)"><input data-testid={`${tid}-mrp-input`} type="number" min={0} className={inputCls} value={value.originalPriceAmount} onChange={set("originalPriceAmount")} /></Field>
        <Field label="Stock units"><input data-testid={`${tid}-stock-input`} type="number" min={0} className={inputCls} value={value.stock} onChange={set("stock")} /></Field>
      </div>
      <label className={labelCls}>Variant images (max 7)</label>
      <ImagePicker testid={`${tid}-images`} existing={value.existing} files={value.files} onChange={(imgs) => onChange({ ...value, ...imgs })} />
      {(onSave || onDelete) && (
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-neutral-200/70">
          {onDelete && <button type="button" data-testid={`${tid}-delete-button`} onClick={onDelete} className={`${btnGhost} hover:!border-red-500 hover:text-red-600`}><Trash2 size={14} /> Remove</button>}
          {onSave && <button type="button" data-testid={`${tid}-save-button`} onClick={onSave} disabled={saving} className={btnDark}><Save size={14} /> {saving ? "Saving…" : value._id ? "Save variant" : "Add variant"}</button>}
        </div>
      )}
    </div>
  );
}
