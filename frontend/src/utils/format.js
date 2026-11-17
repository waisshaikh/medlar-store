export const formatINR = (n = 0) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const fmtDate = (d, withTime = false) => d ? new Date(d).toLocaleString("en-IN", {
  day: "numeric", month: "short", year: "numeric", ...(withTime && { hour: "2-digit", minute: "2-digit" }),
}) : "—";

export const variantLabel = (v) => v ? (v.name || Object.values(v.attributes || {}).join(" / ") || v.color || "Default") : "";

export const activeVariants = (p) => (p?.variants || []).filter((v) => v.active !== false);

export const firstAvailableVariant = (p) => {
  const vs = activeVariants(p);
  return vs.find((v) => v.stock > 0) || vs[0] || null;
};

export const productImage = (p) => p?.images?.[0] || activeVariants(p)[0]?.images?.[0]?.url || "/catalog/catogery/backPack.png";

export const productStock = (p) => activeVariants(p).reduce((s, v) => s + (v.stock || 0), 0);

export const startingPrice = (p) => {
  const prices = activeVariants(p).map((v) => v.price?.amount).filter(Boolean);
  return prices.length ? Math.min(...prices) : p?.price?.amount || 0;
};

export const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export const apiError = (err, fallback = "Something went wrong") => err?.response?.data?.message || fallback;
