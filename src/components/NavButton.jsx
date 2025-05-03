export default function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
        active ? "bg-white text-red-500" : "text-white hover:bg-red-400"
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
