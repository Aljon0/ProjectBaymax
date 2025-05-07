import { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs,
  Timestamp,
  doc,
  setDoc 
} from "firebase/firestore";
import { auth, db } from "../firebase"; // Adjust path as needed
import { onAuthStateChanged } from "firebase/auth";
import BaymaxAvatar from "./BaymaxAvatar";

export default function Journal() {
  const [journalEntry, setJournalEntry] = useState("");
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entriesExpanded, setEntriesExpanded] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 4;

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        fetchEntries(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch journal entries from Firestore
  const fetchEntries = async (userId) => {
    try {
      const journalRef = collection(db, "users", userId, "journal");
      const q = query(journalRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      
      const entriesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.timestamp.toDate().toLocaleDateString("en-US", {
            month: "short", 
            day: "numeric", 
            year: "numeric"
          }),
          time: data.timestamp.toDate().toLocaleTimeString("en-US", {
            hour: '2-digit',
            minute: '2-digit'
          }),
          content: data.content,
          mood: data.mood
        };
      });
      
      setEntries(entriesData);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    }
  };

  // Get mood emoji based on detected mood
  const getMoodEmoji = (mood) => {
    switch(mood) {
      case "happy": return "😊";
      case "concerned": return "😔";
      default: return "😐";
    }
  };

  // Detect mood from journal entry text
  const detectMood = (text) => {
    const textLower = text.toLowerCase();
    
    const happyWords = ['happy', 'great', 'wonderful', 'joy', 'excited', 'amazing', 'good'];
    const concernedWords = ['sad', 'worried', 'anxious', 'stress', 'tired', 'upset', 'depressed'];
    
    let mood = "neutral";
    
    for (const word of happyWords) {
      if (textLower.includes(word)) {
        mood = "happy";
        break;
      }
    }
    
    if (mood === "neutral") {
      for (const word of concernedWords) {
        if (textLower.includes(word)) {
          mood = "concerned";
          break;
        }
      }
    }
    
    return mood;
  };

  // Save journal entry to Firestore
  const handleSubmit = async () => {
    if (!journalEntry.trim() || !user) return;

    const mood = detectMood(journalEntry);
    const timestamp = Timestamp.now();
    
    try {
      // Save to the user's journal subcollection
      const journalRef = collection(db, "users", user.uid, "journal");
      await addDoc(journalRef, {
        content: journalEntry,
        mood,
        timestamp
      });
      
      // Optionally, update the user's profile with the latest mood
      const userProfileRef = doc(db, "users", user.uid, "profile", "mood");
      await setDoc(userProfileRef, {
        currentMood: mood,
        lastUpdated: timestamp
      }, { merge: true });
      
      // Refresh entries
      fetchEntries(user.uid);
      
      // Clear input
      setJournalEntry("");
      
      // Make sure entries are expanded after adding a new one
      setEntriesExpanded(true);
      
      // Reset to first page to show the new entry
      setCurrentPage(1);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      alert("Failed to save your journal entry. Please try again.");
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(entries.length / entriesPerPage);
  const currentEntries = entries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get mood-based colors
  const getMoodColor = (mood) => {
    switch(mood) {
      case "happy": return "bg-gradient-to-r from-green-400 to-green-500";
      case "concerned": return "bg-gradient-to-r from-amber-400 to-amber-500";
      default: return "bg-gradient-to-r from-gray-400 to-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-200 h-16 w-16 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-lg mx-auto mt-12">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
        <p className="text-gray-600">Please sign in to use the journal feature and track your daily reflections.</p>
      </div>
    );
  }

  const latestMood = entries.length > 0 ? entries[0].mood : "neutral";

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-16 px-4">
      {/* Sticky Journal Input Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 sticky top-0 z-10 pt-2 pb-6 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <BaymaxAvatar mood={latestMood} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg max-w-3xl mx-auto border border-gray-100">
          <h2 className="text-2xl font-bold mb-5 text-center text-gray-800">
            Daily Reflection
          </h2>

          <div>
            <div className="mb-4">
              <label className="block text-lg font-medium mb-2 text-gray-700">
                How are you feeling today?
              </label>
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full p-4 rounded-xl border border-gray-200 h-28 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all shadow-sm"
              ></textarea>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Save Journal Entry
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Previous Entries Section */}
      <div className="mt-8 max-w-3xl mx-auto">
        <div 
          className="flex justify-between items-center mb-4 cursor-pointer"
          onClick={() => setEntriesExpanded(!entriesExpanded)}
        >
          <h3 className="text-xl font-medium flex items-center text-gray-800">
            <button className="mr-2 text-red-500 hover:text-red-700 transition-colors w-6 h-6 flex items-center justify-center">
              {entriesExpanded ? (
                <span className="text-lg">▼</span>
              ) : (
                <span className="text-lg">▶</span>
              )}
            </button>
            Past Reflections {entries.length > 0 && <span className="ml-2 text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{entries.length}</span>}
          </h3>
          
          {entries.length > 0 && entriesExpanded && (
            <div className="text-sm text-gray-500 italic">
              {entries.length > entriesPerPage && (
                <span>
                  Showing {(currentPage - 1) * entriesPerPage + 1}-
                  {Math.min(currentPage * entriesPerPage, entries.length)} of {entries.length}
                </span>
              )}
            </div>
          )}
        </div>

        {entriesExpanded && (
          <>
            {entries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-500">No journal entries yet.</p>
                <p className="text-gray-400 text-sm mt-1">Write your first reflection above to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <div className={`w-2 h-10 rounded-full mr-3 ${getMoodColor(entry.mood)}`}></div>
                        <div>
                          <div className="font-medium text-gray-800">{entry.date}</div>
                          <div className="text-xs text-gray-500">{entry.time}</div>
                        </div>
                      </div>
                      <div className="text-2xl" title={`Mood: ${entry.mood}`}>
                        {getMoodEmoji(entry.mood)}
                      </div>
                    </div>
                    <div className="pl-5 border-l-2 border-gray-100 mt-4 text-gray-700">
                      {entry.content}
                    </div>
                  </div>
                ))}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-8">
                    <button 
                      onClick={prevPage} 
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === 1 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-white text-red-600 hover:bg-red-50 border border-red-200 shadow-sm hover:shadow transition-all"
                      }`}
                    >
                      ← Previous
                    </button>
                    
                    <div className="flex items-center px-4">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 mx-1 rounded-full flex items-center justify-center transition-all ${
                            currentPage === i + 1
                              ? "bg-red-500 text-white shadow-md"
                              : "hover:bg-red-100 text-gray-700"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      onClick={nextPage} 
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === totalPages 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-white text-red-600 hover:bg-red-50 border border-red-200 shadow-sm hover:shadow transition-all"
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}