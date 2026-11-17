export default function Badge({ children, color = "red" }) {
  const colors = {
    red: "bg-[#E8272A] text-white",
    gold: "bg-[#C9A84C] text-white",
    green: "bg-green-600 text-white",
    blue: "bg-blue-600 text-white",
    yellow: "bg-yellow-500 text-black",
    gray: "bg-gray-200 text-gray-700",
  };
  return (
    <span className={`inline-block text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-sm font-medium ${colors[color] || colors.red}`}>
      {children}
    </span>
  );
}
