import React from "react";

const MessageBubble = ({ children, sender }) => {
  const isBaymax = sender === "baymax";
  
  return (
    <div className={`mb-4 max-w-4xl ${isBaymax ? "mr-auto" : "ml-auto"}`}>
      <div
        className={`rounded-2xl p-4 ${
          isBaymax
            ? "bg-white border border-gray-200 text-gray-800"
            : "bg-red-500 text-white"
        }`}
      >
        <div className="prose prose-sm">{children}</div>
      </div>
    </div>
  );
};

export default MessageBubble;