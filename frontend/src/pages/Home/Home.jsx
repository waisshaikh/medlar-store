import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Star, Clock } from "lucide-react";
import { fetchProducts } from "../../store/slices/productSlice.js";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import CategoryBento from "../../components/CategoryBento/CategoryBento.jsx";

// Brand benefits for announcement strip
const BENEFITS = [
  "FREE SHIPPING OVER ₹1,999",
  "2-YEAR WARRANTY ON EVERY BAG",
  "10-DAY EASY RETURNS",
  "ENGINEERED IN INDIA",
  "40,000+ REAL TESTED MILES",
];

const TESTIMONIALS = [
  {
    rating: 5,
    text: "Exceeding every expectation. Traveling with this bag on 40,000+ km flights — not a stitch loose, leather looks richer with age.",
    author: "Rahul M.",
    city: "Mumbai",
  },
  {
    rating: 5,
    text: "The split laptop sleeve and shoe tunnel made it the only bag I need for weekend trips. Worth every single rupee.",
    author: "Priya S.",
    city: "Bangalore",
  },
  {
    rating: 5,
    text: "The crocodile grain duffel arrived in exquisite condition. Airport security always asks where I got it.",
    author: "Vikram R.",
    city: "Delhi",
  },
];

const JOURNAL_POSTS = [
  {
    title: "The Art of One-Bag Travel",
    cat: "INSIGHT",
    readTime: "4 min read",
    img: "/catalog/fotter images/stories.jpg",
    slug: "one-bag-travel",
  },
  {
    title: "Why Structure Wins the Bag Wars",
    cat: "CRAFT",
    readTime: "5 min read",
    img: "/catalog/fotter images/style.jpeg",
    slug: "structure-wins",
  },
  {
    title: "48 Hours in Lisbon with a Duffel",
    cat: "TRAVEL",
    readTime: "3 min read",
    img: "/catalog/fotter images/airport man with bag.jpg",
    slug: "lisbon-duffel",
  },
  {
    title: "Airport Style, Decoded",
    cat: "STYLE",
    readTime: "6 min read",
    img: "/catalog/fotter images/design.png",
    slug: "airport-style",
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const { list: products } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const displayProducts = products || [];

  return (
    <div className="bg-[#F7F4EF] text-[#111111]">

      {/* ─── 1. HERO SECTION (CINEMATIC LIFESTYLE) ────────────────────── */}
      <section className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden bg-[#F7F4EF]">
        {/* Full-bleed lifestyle background with male model + Medlar bag */}
        <div
          className="absolute inset-0 bg-cover bg-[center_right] md:bg-right"
          style={{ backgroundImage: "url('/catalog/header/style.jpeg')" }}
        />
        {/* Soft gradient overlay on the left for crisp text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F4EF]/95 via-[#F7F4EF]/75 to-transparent sm:from-[#F7F4EF]/90 sm:via-[#F7F4EF]/45 sm:to-transparent" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 py-24 sm:py-28 lg:py-32 w-full">
          <div className="max-w-lg lg:max-w-xl pr-4 sm:pr-8 md:pr-12 space-y-6">
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#E52B32] uppercase block">
              ULTIMATE TRAVEL COMPANION — EST. INDIA
            </span>

            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.25rem] leading-[0.98] tracking-tight uppercase text-[#111111]">
              <span className="whitespace-nowrap">BUILT FOR</span> <br />
              <span className="text-[#E52B32]">EVERY</span> <br />
              <span>JOURNEY.</span>
            </h1>

            <p className="text-neutral-700 text-sm sm:text-base font-normal max-w-md leading-relaxed">
              Premium bags designed for work, travel and everything in between.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-5 sm:gap-7">
              <Link
                to="/shop"
                data-testid="home-shop-collection-link"
                className="inline-flex items-center gap-3 px-7 sm:px-8 py-3.5 bg-[#E52B32] hover:bg-[#c92027] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-[3px] transition-all shadow-sm hover:shadow-md whitespace-nowrap"
              >
                <span>SHOP COLLECTION</span>
                <ArrowRight size={15} className="shrink-0" />
              </Link>
              <Link
                to="/our-story"
                data-testid="home-our-story-link"
                className="inline-flex items-center px-4 py-3.5 text-[#111111] hover:text-[#E52B32] font-heading font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap"
              >
                OUR STORY
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. ANNOUNCEMENT / BRAND BENEFITS STRIP (AUTO-SCROLLING MARQUEE) ─── */}
      <section className="bg-white border-y border-neutral-200/80 overflow-hidden select-none relative z-10">
        <div className="flex w-max animate-marquee py-3.5 sm:py-4">
          {/* First sequence */}
          <div className="flex items-center gap-8 sm:gap-12 shrink-0 pr-8 sm:pr-12">
            {BENEFITS.map((item, idx) => (
              <div key={`b1-${idx}`} className="flex items-center gap-6 sm:gap-10 shrink-0 text-[11px] sm:text-[12px] font-mono font-semibold tracking-[0.22em] uppercase text-neutral-700">
                <span>{item}</span>
                <span className="text-[#E52B32]">•</span>
              </div>
            ))}
          </div>
          {/* Duplicate sequence for seamless 100% continuous loop */}
          <div className="flex items-center gap-8 sm:gap-12 shrink-0 pr-8 sm:pr-12" aria-hidden="true">
            {BENEFITS.map((item, idx) => (
              <div key={`b2-${idx}`} className="flex items-center gap-6 sm:gap-10 shrink-0 text-[11px] sm:text-[12px] font-mono font-semibold tracking-[0.22em] uppercase text-neutral-700">
                <span>{item}</span>
                <span className="text-[#E52B32]">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. COLLECTIONS / CATEGORIES SECTION (LUXURY 4x2 GRID) ──────── */}
      <section
        id="collections"
        className="scroll-mt-28 pt-16 sm:pt-20 lg:pt-24 pb-20 lg:pb-28 bg-[#F7F5F1]"
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
          {/* Section Heading: Clean, Uncluttered, Refined */}
          <div className="space-y-2 mb-10 sm:mb-12 lg:mb-14">
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#E52B32] block">
              SHOP BY CATEGORY
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-4xl lg:text-[42px] leading-[1.1] text-[#111111] tracking-tight">
              Built for every kind of journey
            </h2>
          </div>

          <CategoryBento />
        </div>
      </section>

      {/* ─── 4. BESTSELLERS / FEATURED PRODUCTS (DARK #101010) ────────── */}
      <section className="bg-[#101010] text-white py-20 lg:py-28 border-y border-neutral-900">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
          {/* Header Row: Eyebrow + Heading on left, VIEW ALL aligned on right with 24-30px bottom spacing */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div className="space-y-2">
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#E52B32] block">
                FIELD TESTED
              </span>
              <h2 className="font-heading font-bold text-2xl sm:text-4xl lg:text-[42px] leading-[1.1] text-white tracking-tight">
                Bestsellers, proven on the road
              </h2>
            </div>
            <Link
              to="/shop"
              data-testid="home-bestsellers-view-all"
              className="text-xs font-mono font-bold text-neutral-400 hover:text-white uppercase tracking-widest inline-flex items-center gap-1.5 transition-colors pb-1 shrink-0"
            >
              <span>VIEW ALL</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* 4 Product Cards per Row on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {displayProducts.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} darkTheme={true} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. BRAND STORY / QUALITY SECTION (SPLIT 50/50) ──────────── */}
      <section className="py-20 lg:py-28 bg-[#F7F5F1]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Cinematic Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/5] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-300/70 shadow-xl">
                <img
                  src="/catalog/fotter images/airport man with bag.jpg"
                  alt="Medlar Traveler at Departure Gate"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Editorial Copy */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#E52B32] block">
                THE MEDLAR STANDARD
              </span>

              <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#111111] leading-[1.1] tracking-tight">
                Tested at 40,000 feet. <br />
                <span className="text-[#E52B32] font-editorial italic font-normal">Refined</span> at street level.
              </h2>

              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Every Medlar travel piece begins in our Pune workshop with high-density ballistic fabrics, YKK waterproof coil zips, and hand-reinforced structural stress joints. We discard whatever doesn't survive hundreds of thousands of airport miles.
              </p>

              <div className="pt-4 grid grid-cols-3 gap-6 max-w-md border-t border-neutral-300">
                <div>
                  <p className="font-heading font-bold text-2xl sm:text-3xl text-[#111111]">42</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mt-1">Tests</p>
                </div>
                <div>
                  <p className="font-heading font-bold text-2xl sm:text-3xl text-[#111111]">2 yr</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mt-1">Warranty</p>
                </div>
                <div>
                  <p className="font-heading font-bold text-2xl sm:text-3xl text-[#111111]">180+</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mt-1">Cities</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/our-story"
                  className="text-xs font-mono font-bold uppercase tracking-widest text-[#111111] hover:text-[#E52B32] inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>READ OUR FULL STORY</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. CUSTOMER TESTIMONIALS (DARK #101010) ─────────────────── */}
      <section className="bg-[#101010] text-white py-20 lg:py-28 border-t border-neutral-900">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
          <div className="mb-10 lg:mb-12 text-center sm:text-left">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#E52B32] block mb-1">
              REAL REPORTS
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-4xl lg:text-[42px] text-white tracking-tight">
              Carried by 2,00,000+ travellers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#181818] p-7 rounded-xl border border-neutral-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-400 gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed italic">
                    "{t.text}"
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-white tracking-wide">{t.author}</span>
                  <span className="text-neutral-500 font-mono text-[11px]">{t.city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. JOURNAL / BLOG SECTION ───────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-[#F7F5F1]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
          <div className="flex justify-between items-baseline mb-10 lg:mb-12">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#E52B32] block mb-1">
                THE JOURNAL
              </span>
              <h2 className="font-heading font-bold text-2xl sm:text-4xl lg:text-[42px] text-[#111111] tracking-tight">
                Notes from the road
              </h2>
            </div>
            <Link
              to="/journal"
              className="text-xs font-mono font-bold text-neutral-500 hover:text-[#111111] uppercase tracking-widest inline-flex items-center gap-1.5 transition-colors hidden sm:inline-flex"
            >
              <span>ALL ARTICLES</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {JOURNAL_POSTS.map((p, idx) => (
              <Link key={idx} to="/journal" className="group block text-left">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-200 mb-3.5 border border-neutral-200/80 shadow-2xs">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-widest text-[#E52B32]">
                  <span>{p.cat}</span>
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Clock size={11} /> {p.readTime}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-[#111111] group-hover:text-[#E52B32] transition-colors line-clamp-2 mt-1.5 leading-snug">
                  {p.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
