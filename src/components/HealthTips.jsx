import { useState } from "react";
import BaymaxAvatar from "./BaymaxAvatar";

export default function HealthTips() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const tips = [
    {
      title: "Stay Hydrated",
      description:
        "Drink at least 8 glasses of water daily to maintain proper hydration.",
      icon: "💧",
    },
    {
      title: "Take Short Breaks",
      description:
        "For every 45 minutes of work, take a 5-minute break to rest your eyes and stretch.",
      icon: "⏱️",
    },
    {
      title: "Practice Deep Breathing",
      description:
        "Take 5 deep breaths when feeling stressed to help calm your nervous system.",
      icon: "🫁",
    },
    {
      title: "Limit Screen Time",
      description:
        "Try to avoid screens at least 1 hour before bedtime for better sleep quality.",
      icon: "📱",
    },
    {
      title: "Get Moving",
      description:
        "Aim for at least 30 minutes of physical activity every day.",
      icon: "🏃",
    },
    {
      title: "Eat More Vegetables",
      description:
        "Try to include vegetables in at least two meals daily for better nutrition.",
      icon: "🥦",
    },
  ];

  const reminders = [
    { time: "8:00 AM", message: "Drink a glass of water" },
    { time: "10:00 AM", message: "Take a 5-minute stretch break" },
    { time: "12:30 PM", message: "Eat a balanced lunch" },
    { time: "3:00 PM", message: "Hydration reminder" },
    { time: "6:00 PM", message: "Time for a short walk" },
    { time: "9:00 PM", message: "Begin winding down for sleep" },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex items-center justify-center mb-8">
        <BaymaxAvatar mood="happy" />
      </div>

      <div className="bg-gray-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Health Tips & Reminders
        </h2>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Notifications</h3>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`px-4 py-2 rounded-full ${
                notificationsEnabled ? "bg-green-500 text-white" : "bg-gray-300"
              }`}
            >
              {notificationsEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-medium mb-2">Daily Reminders</h4>
            <div className="space-y-2">
              {reminders.map((reminder, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 border-b border-gray-100"
                >
                  <span className="font-medium">{reminder.time}</span>
                  <span>{reminder.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-medium mb-4">Health Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{tip.icon}</span>
                  <h4 className="font-medium">{tip.title}</h4>
                </div>
                <p className="text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
