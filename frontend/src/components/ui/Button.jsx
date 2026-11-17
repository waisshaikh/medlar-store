export default function Button({ children, variant = "primary", className = "", disabled, loading, onClick, type = "button", fullWidth }) {
  const base = "inline-flex items-center justify-center gap-2 text-xs tracking-[0.15em] uppercase font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3";
  const variants = {
    primary: "bg-[#E8272A] text-white hover:opacity-90",
    secondary: "bg-transparent text-white border border-white hover:bg-white hover:text-[#111]",
    dark: "bg-[#111] text-white hover:bg-[#1a1a1a]",
    outline: "bg-transparent text-[#111] border border-[#111] hover:bg-[#111] hover:text-white",
    ghost: "bg-transparent text-[#E8272A] hover:underline px-0",
  };
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
}
