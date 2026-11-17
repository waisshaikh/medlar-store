import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const shopLinks = [
  { label: "Backpacks", to: "/collections/backpacks" },
  { label: "Laptop/Office Bags", to: "/collections/laptop-bags" },
  { label: "Messenger Bags", to: "/collections/messenger-bags" },
  { label: "Sling Bags", to: "/collections/sling-bags" },
  { label: "Duffel Bags", to: "/collections/duffel-bags" },
  { label: "Travel Bags", to: "/collections/travel-bags" },
];

const supportLinks = [
  { label: "Contact Us", to: "/contact" },
  { label: "Shipping & Returns", to: "/shipping" },
  { label: "Warranty", to: "/warranty" },
  { label: "FAQs", to: "/faqs" },
];

const companyLinks = [
  { label: "Our Story", to: "/our-story" },
  { label: "Journal", to: "/journal" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Thank you for joining the journey!");
    setEmail("");
  };

  return (
    <footer className="bg-[#101010] text-white border-t border-neutral-900">
      {/* Main footer content */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Left Brand Column */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-block">
              <div className="bg-white px-3.5 py-1.5 rounded-lg shadow-sm border border-neutral-200/80 inline-flex items-center">
                <img
                  src="/catalog/header/medlar-logo-compact.png"
                  alt="Medlar"
                  className="h-7 sm:h-8 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) e.target.nextSibling.style.display = "block";
                  }}
                />
                <span className="hidden font-heading font-black text-sm tracking-widest text-[#111111]">
                  MEDLAR
                </span>
              </div>
            </Link>

            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              Premium travel gear engineered in India. Built for the journey, refined at every altitude.
            </p>

            {/* Newsletter Subscription */}
            <form onSubmit={handleSubscribe} className="flex max-w-sm items-stretch">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-[#1a1a1a] text-white text-xs border border-neutral-800 outline-none focus:border-[#E52B32] transition-colors placeholder-neutral-500 rounded-l-md"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-[#E52B32] hover:bg-[#c92027] text-white flex items-center justify-center transition-colors rounded-r-md cursor-pointer shrink-0"
                title="Subscribe"
              >
                <ArrowRight size={15} />
              </button>
            </form>

            {/* Clean SVG Social Icons */}
            <div className="flex items-center gap-4 text-neutral-400 pt-1">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#E52B32] transition-colors" title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-[#E52B32] transition-colors" title="X">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#E52B32] transition-colors" title="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Right Columns Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Shop Links */}
            <div>
              <h4 className="text-white text-xs font-mono font-bold tracking-[0.2em] uppercase mb-4">
                SHOP
              </h4>
              <ul className="space-y-3">
                {shopLinks.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-neutral-400 text-xs hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-white text-xs font-mono font-bold tracking-[0.2em] uppercase mb-4">
                SUPPORT
              </h4>
              <ul className="space-y-3">
                {supportLinks.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-neutral-400 text-xs hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-white text-xs font-mono font-bold tracking-[0.2em] uppercase mb-4">
                COMPANY
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-neutral-400 text-xs hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-neutral-900 bg-black/40">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 font-mono">
          <p>© {new Date().getFullYear()} Medlar. All rights reserved. Handcrafted with pride in India 🇮🇳</p>
          <p className="tracking-wider uppercase text-[11px]">Designed for every journey.</p>
        </div>
      </div>
    </footer>
  );
}
