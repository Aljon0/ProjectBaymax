import { useState } from "react";
import BaymaxAvatar from "./BaymaxAvatar";

export default function Journal() {
  const [journalEntry, setJournalEntry] = useState("");
  const [entries, setEntries] = useState([
    {
      date: "May 2, 2025",
      content: "I had trouble sleeping last night. Feeling tired today.",
      mood: "concerned",
    },
    {
      date: "May 1, 2025",
      content: "Great day today! Went for a long walk and ate healthy meals.",
      mood: "happy",
    },
  ]);

  const handleSubmit = () => {
    if (!journalEntry.trim()) return;

    const today = new Date();
    const options = { month: "short", day: "numeric", year: "numeric" };
    const formattedDate = today.toLocaleDateString("en-US", options);

    let mood = "neutral";
    if (
      journalEntry.toLowerCase().includes("happy") ||
      journalEntry.toLowerCase().includes("great") ||
      journalEntry.toLowerCase().includes("wonderful")
    ) {
      mood = "happy";
    } else if (
      journalEntry.toLowerCase().includes("sad") ||
      journalEntry.toLowerCase().includes("worried") ||
      journalEntry.toLowerCase().includes("anxious")
    ) {
      mood = "concerned";
    }

    setEntries([
      { date: formattedDate, content: journalEntry, mood },
      ...entries,
    ]);
    setJournalEntry("");
  };

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex items-center justify-center mb-8">
        <BaymaxAvatar mood="neutral" />
      </div>

      <div className="bg-gray-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Journal & Reflection
        </h2>

        <div className="mb-8">
          <div className="mb-4">
            <label className="block text-lg font-medium mb-2">
              How are you feeling today?
            </label>
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Write your thoughts here..."
              className="w-full p-4 rounded-lg border border-gray-300 h-32 focus:outline-none focus:ring-2 focus:ring-red-500"
            ></textarea>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Save Journal Entry
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-medium">Previous Entries</h3>

          {entries.map((entry, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-500">{entry.date}</span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    entry.mood === "happy"
                      ? "bg-green-500"
                      : entry.mood === "concerned"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                ></div>
              </div>
              <p>{entry.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
