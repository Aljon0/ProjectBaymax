export default function MessageBubble({ sender, children }) {
  return (
    <div
      className={`mb-4 max-w-4xl ${
        sender === "baymax" ? "mr-auto" : "ml-auto"
      }`}
    >
      <div
        className={`rounded-2xl p-4 ${
          sender === "baymax"
            ? "bg-white border border-gray-200 text-gray-800"
            : "bg-red-500 text-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
