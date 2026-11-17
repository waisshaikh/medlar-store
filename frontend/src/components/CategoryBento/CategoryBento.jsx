import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, ArrowUpRight } from "lucide-react";

// Tile spans for a 4-column asymmetric bento (dense flow fills gaps)
const SPANS = [
  "col-span-2 row-span-2",
  "col-span-2 lg:col-span-2",
  "col-span-1",
  "col-span-1",
  "col-span-1 lg:row-span-2",
  "col-span-2",
  "col-span-1",
  "col-span-2 lg:col-span-3",
];
const TONES = ["bg-white", "bg-[#101010] text-white", "bg-[#EFEAE2]", "bg-white", "bg-[#E52B32] text-white", "bg-white", "bg-[#101010] text-white", "bg-[#EFEAE2]"];

function Tile({ cat, index }) {
  const hero = index === 0;
  const tone = TONES[index % TONES.length];
  const light = tone.includes("text-white");
  return (
    <Link
      to={`/collections/${cat.slug}`}
      data-testid={`home-category-tile-${cat.slug}`}
      className={`group relative overflow-hidden rounded-2xl border ${light ? "border-transparent" : "border-neutral-200/80"} ${tone} ${SPANS[index % SPANS.length]} flex flex-col justify-between p-5 sm:p-6 transition-transform duration-300 hover:-translate-y-0.5`}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[10px] font-mono font-bold uppercase tracking-[0.22em] ${light ? "text-white/60" : "text-[#E52B32]"}`}>{String(index + 1).padStart(2, "0")} · {cat.productCount} {cat.productCount === 1 ? "style" : "styles"}</p>
          <h3 className={`font-heading font-bold leading-[1.05] mt-2 ${hero ? "text-3xl sm:text-4xl lg:text-5xl max-w-[12ch]" : "text-base sm:text-xl"}`}>{cat.name}</h3>
          {hero && cat.description && <p className="text-sm text-neutral-500 mt-3 max-w-xs">{cat.description}</p>}
        </div>
        <span className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors ${light ? "bg-white/10 group-hover:bg-white group-hover:text-[#111]" : "bg-[#111] text-white group-hover:bg-[#E52B32]"}`}>
          <ArrowUpRight size={16} />
        </span>
      </div>
      {cat.image && <img
        src={cat.image}
        alt={cat.name}
        loading="lazy"
        className={`object-contain transition-transform duration-500 group-hover:scale-105 ${hero ? "absolute right-4 bottom-4 w-[62%] h-[62%]" : "absolute right-3 bottom-3 w-[48%] h-[58%]"} drop-shadow-[0_18px_24px_rgba(0,0,0,0.18)]`}
      />}
      <span className={`relative z-10 mt-auto pt-10 inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] ${light ? "text-white/80" : "text-neutral-500"}`}>
        Shop now <ArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export default function CategoryBento() {
  const { list } = useSelector((s) => s.categories);
  const ordered = [...list.filter((c) => c.featured), ...list.filter((c) => !c.featured)].slice(0, 8);
  if (!ordered.length) return null;
  return (
    <div data-testid="home-category-bento" className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[200px] sm:auto-rows-[220px] grid-flow-dense gap-3 sm:gap-4">
      {ordered.map((cat, i) => <Tile key={cat._id} cat={cat} index={i} />)}
    </div>
  );
}
