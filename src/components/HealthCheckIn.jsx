import { useState } from "react";
import BaymaxAvatar from "./BaymaxAvatar";

export default function HealthCheckIn() {
  const [physicalRating, setPhysicalRating] = useState(5);
  const [mentalRating, setMentalRating] = useState(5);
  const [savedToday, setSavedToday] = useState(false);

  const handleSave = () => {
    setSavedToday(true);
    setTimeout(() => setSavedToday(false), 3000);
  };

  const getMoodText = () => {
    if (physicalRating <= 3 && mentalRating <= 3)
      return "I'm concerned about how you're feeling today. Would you like to talk about it?";
    if (physicalRating <= 3)
      return "Your physical wellness seems low today. Remember to rest and take care of your body.";
    if (mentalRating <= 3)
      return "Your mental wellness seems low today. Consider taking a moment for yourself.";
    if (physicalRating >= 8 && mentalRating >= 8)
      return "You're doing great today! Keep up the positive momentum!";
    return "Thank you for checking in. Remember that your health is important.";
  };

  const updateMood = () => {
    const average = (physicalRating + mentalRating) / 2;
    if (average <= 3) return "concerned";
    if (average >= 8) return "happy";
    return "neutral";
  };

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex items-center justify-center mb-8">
        <BaymaxAvatar mood={updateMood()} />
      </div>

      <div className="bg-gray-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Daily Health Check-In
        </h2>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="block text-lg font-medium">
              How are you feeling physically today?
            </label>
            <div className="flex items-center gap-4">
              <span className="text-red-500">Not well</span>
              <input
                type="range"
                min="1"
                max="10"
                value={physicalRating}
                onChange={(e) => setPhysicalRating(parseInt(e.target.value))}
                className="flex-1 accent-red-500"
              />
              <span className="text-green-500">Very well</span>
            </div>
            <div className="text-center font-medium">{physicalRating}/10</div>
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-medium">
              How are you feeling mentally today?
            </label>
            <div className="flex items-center gap-4">
              <span className="text-red-500">Not well</span>
              <input
                type="range"
                min="1"
                max="10"
                value={mentalRating}
                onChange={(e) => setMentalRating(parseInt(e.target.value))}
                className="flex-1 accent-red-500"
              />
              <span className="text-green-500">Very well</span>
            </div>
            <div className="text-center font-medium">{mentalRating}/10</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Baymax says:</h3>
            <p>{getMoodText()}</p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            {savedToday
              ? "Saved! Thank you for checking in."
              : "Save Today's Check-In"}
          </button>
        </div>
      </div>
    </div>
  );
}
