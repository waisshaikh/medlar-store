import { useEffect, useMemo } from "react";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";

// Manages kept image URLs plus newly picked files, capped at `max`
export default function ImagePicker({ existing = [], files = [], onChange, max = 7, testid }) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const total = existing.length + files.length;

  const pick = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    const room = Math.max(0, max - existing.length - files.length);
    if (picked.length > room) toast.error(`Only ${max} images allowed — ${picked.length - room} not added`);
    onChange({ existing, files: [...files, ...picked].slice(0, Math.max(0, max - existing.length)) });
  };

  const thumb = "relative aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-[#F7F5F1] group";
  const removeBtn = "absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-90 hover:bg-[#E52B32]";

  return (
    <div data-testid={testid}>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {existing.map((url, i) => (
          <div key={url} className={thumb}>
            <img src={url} alt="" className="w-full h-full object-contain p-1" />
            {i === 0 && <span className="absolute bottom-1 left-1 text-[8px] font-bold uppercase bg-[#111] text-white px-1.5 py-0.5 rounded">Cover</span>}
            <button type="button" data-testid={`${testid}-remove-existing-${i}`} onClick={() => onChange({ existing: existing.filter((u) => u !== url), files })} className={removeBtn}><X size={12} /></button>
          </div>
        ))}
        {previews.map((src, i) => (
          <div key={src} className={`${thumb} ring-2 ring-[#E52B32]/40`}>
            <img src={src} alt="" className="w-full h-full object-contain p-1" />
            <span className="absolute bottom-1 left-1 text-[8px] font-bold uppercase bg-[#E52B32] text-white px-1.5 py-0.5 rounded">New</span>
            <button type="button" data-testid={`${testid}-remove-new-${i}`} onClick={() => onChange({ existing, files: files.filter((_, j) => j !== i) })} className={removeBtn}><X size={12} /></button>
          </div>
        ))}
        {total < max && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#E52B32] text-neutral-400 hover:text-[#E52B32] flex flex-col items-center justify-center cursor-pointer transition-colors">
            <ImagePlus size={18} />
            <span className="text-[9px] font-bold uppercase mt-1">Add</span>
            <input data-testid={`${testid}-input`} type="file" accept="image/*" multiple className="hidden" onChange={pick} />
          </label>
        )}
      </div>
      <p data-testid={`${testid}-count`} className="text-[11px] text-neutral-500 mt-2">{total}/{max} images · JPG, PNG or WEBP up to 5MB</p>
    </div>
  );
}
