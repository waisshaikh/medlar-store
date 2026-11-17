export default function LoadingSpinner({ size = "md", color = "red" }) {
  const sizes = { sm: "w-4 h-4 border-2", md: "w-8 h-8 border-2", lg: "w-12 h-12 border-3" };
  const colors = { red: "border-[#E8272A]", white: "border-white", dark: "border-[#111]" };
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
