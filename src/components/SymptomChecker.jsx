import { useState } from "react";
import BaymaxAvatar from "./BaymaxAvatar";
import MessageBubble from "./MessageBubble";

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "baymax",
      text: "Hello, I am Baymax, your personal healthcare companion. Please describe your symptoms, and I will try to help.",
    },
  ]);

  const handleSubmit = () => {
    if (!symptoms.trim()) return;

    // Add user message
    setMessages([...messages, { sender: "user", text: symptoms }]);

    // Simulate Baymax response
    setTimeout(() => {
      let response = "";
      if (symptoms.toLowerCase().includes("headache")) {
        response =
          "Based on your symptoms, you may be experiencing a tension headache. This could be caused by stress, dehydration, or eye strain. I recommend drinking water, taking a short break from screens, and resting in a dark, quiet room. If the pain persists for more than 24 hours or becomes severe, please consult a healthcare professional.";
      } else if (symptoms.toLowerCase().includes("sore throat")) {
        response =
          "It sounds like you may have a sore throat, possibly due to a viral infection like a cold. I suggest drinking warm liquids, gargling with salt water, and resting your voice. If you develop a fever over 101°F or the pain is severe, please seek medical advice.";
      } else {
        response =
          "I need more specific information about your symptoms to provide accurate advice. Could you please provide more details about what you are experiencing?";
      }

      setMessages((prev) => [...prev, { sender: "baymax", text: response }]);
    }, 1000);

    setSymptoms("");
  };

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex items-center justify-center mb-8">
        <BaymaxAvatar mood="neutral" />
      </div>

      <div className="bg-gray-100 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Symptom Checker</h2>

        <div className="space-y-4 mb-6 overflow-y-auto max-h-80 p-2">
          {messages.map((message, index) => (
            <MessageBubble key={index} sender={message.sender}>
              {message.text}
            </MessageBubble>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms..."
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
