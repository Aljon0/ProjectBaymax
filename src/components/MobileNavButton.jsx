export default function MobileNavButton({ icon, label, active, onClick }) {
  return (
    <button
      className={`flex items-center gap-2 p-4 w-full text-left border-b border-gray-100 ${
        active ? "bg-red-100 text-red-500" : "hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
