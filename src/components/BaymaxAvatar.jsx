export default function BaymaxAvatar({ mood = "neutral" }) {
  const moods = {
    neutral: "bg-white border-2 border-gray-200",
    happy: "bg-white border-2 border-green-300",
    concerned: "bg-white border-2 border-yellow-300",
    alert: "bg-white border-2 border-red-300",
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-32 h-32 rounded-full ${moods[mood]} flex items-center justify-center shadow-lg mb-2`}
      >
        <div className="w-24 h-12 bg-black rounded-full flex items-center justify-center relative">
          <div className="w-5 h-5 bg-white rounded-full absolute left-4"></div>
          <div className="w-5 h-5 bg-white rounded-full absolute right-4"></div>
        </div>
      </div>
    </div>
  );
}
