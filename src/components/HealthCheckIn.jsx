import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import BaymaxAvatar from "./BaymaxAvatar";
import { onAuthStateChanged } from "firebase/auth";

export default function HealthCheckIn() {
  const [physicalRating, setPhysicalRating] = useState(5);
  const [mentalRating, setMentalRating] = useState(5);
  const [savedToday, setSavedToday] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [todayEntry, setTodayEntry] = useState(null);
  const [baymaxResponse, setBaymaxResponse] = useState("");
  
  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        // Small delay to ensure auth is fully processed
        setTimeout(() => checkTodayEntry(user.uid), 500);
      } else {
        setUserId(null);
        setTodayEntry(null);
        setSavedToday(false);
        setBaymaxResponse(getMoodText());
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Check if user has already submitted an entry today
  const checkTodayEntry = async (uid) => {
    try {
      if (!uid) return; // Skip if no user ID
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const entryRef = doc(db, "healthCheckins", `${uid}_${today}`);
      
      // Handle potential permission errors with a timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout")), 5000)
      );
      
      const entrySnapPromise = getDoc(entryRef);
      const entrySnap = await Promise.race([entrySnapPromise, timeoutPromise])
        .catch(err => {
          console.warn("Could not fetch today's entry:", err);
          return null;
        });
      
      if (entrySnap && entrySnap.exists()) {
        const data = entrySnap.data();
        setPhysicalRating(data.physicalRating);
        setMentalRating(data.mentalRating);
        setBaymaxResponse(data.baymaxResponse || getMoodText());
        setTodayEntry(data);
        setSavedToday(true);
      } else {
        setBaymaxResponse(getMoodText());
      }
    } catch (err) {
      console.error("Error checking today's entry:", err);
      // Don't show an error to the user here, just set default values
      setBaymaxResponse(getMoodText());
    }
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

  // Get Baymax response based on mood ratings
  const getBaymaxResponse = () => {
    // Simply use the static responses instead of API
    return getMoodText();
  };

  const handleSave = async () => {
    if (!userId) {
      setError("Please sign in to save your health check-in");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const docId = `${userId}_${today}`;
      
      // Get Baymax response (now synchronous)
      const response = getBaymaxResponse();
      setBaymaxResponse(response);
      
      // Create the health check-in data object
      const healthData = {
        userId,
        date: today,
        timestamp: serverTimestamp(),
        physicalRating,
        mentalRating,
        averageRating: (physicalRating + mentalRating) / 2,
        mood: updateMood(),
        baymaxResponse: response
      };
      
      // Try to save to Firebase with error handling
      try {
        // Save to Firebase
        await setDoc(doc(db, "healthCheckins", docId), healthData);
        
        setSavedToday(true);
        setTodayEntry({
          physicalRating,
          mentalRating,
          date: today
        });
      } catch (firebaseErr) {
        console.error("Firebase error:", firebaseErr);
        
        // Check if it's a permissions error
        if (firebaseErr.code === 'permission-denied') {
          setError("Permission denied: Please check your account access");
        } else {
          setError("Could not save to database: " + firebaseErr.message);
        }
        
        // Store locally anyway for the current session
        setSavedToday(true);
        setTodayEntry({
          physicalRating,
          mentalRating,
          date: today
        });
      }
      
      // Reset loading after delay for visual feedback
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error in save process:", err);
      setError("Failed to save your health check-in");
      setLoading(false);
      setSavedToday(false);
    }
  };

  const updateMood = () => {
    const average = (physicalRating + mentalRating) / 2;
    if (average <= 3) return "concerned";
    if (average >= 8) return "happy";
    return "neutral";
  };
  
  // Update Baymax's response when sliders change (if not already saved)
  useEffect(() => {
    if (!savedToday) {
      setBaymaxResponse(getMoodText());
    }
  }, [physicalRating, mentalRating]);

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex items-center justify-center mb-8">
        <BaymaxAvatar mood={updateMood()} />
      </div>

      <div className="bg-gray-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Daily Health Check-In
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
            <span className="block sm:inline">{error}</span>
            {error.includes("Permission denied") && (
              <div className="mt-2 text-sm">
                <p>Try refreshing the page or signing out and back in.</p>
              </div>
            )}
            <button 
              className="absolute top-2 right-2 text-red-700"
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}

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
                disabled={savedToday}
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
                disabled={savedToday}
              />
              <span className="text-green-500">Very well</span>
            </div>
            <div className="text-center font-medium">{mentalRating}/10</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Baymax says:</h3>
            <p>{baymaxResponse}</p>
          </div>

          {userId ? (
            <button
              onClick={handleSave}
              disabled={savedToday || loading}
              className={`w-full py-3 rounded-lg transition-colors ${
                savedToday
                  ? "bg-green-500 text-white"
                  : loading
                  ? "bg-gray-400 text-white"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {loading
                ? "Saving..."
                : savedToday
                ? "Saved! Thank you for checking in."
                : "Save Today's Check-In"}
            </button>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-center text-yellow-700 font-medium">
                Please sign in to save your health check-in.
              </p>
            </div>
          )}
          
          {savedToday && (
            <div className="text-center text-gray-500">
              Your health data was saved for {todayEntry?.date || "today"}
              {error && error.includes("Permission") && 
                <span className="block text-xs mt-1 text-yellow-600">
                  (Saved locally only due to database permission issues)
                </span>
              }
            </div>
          )}
          
          {savedToday && (
            <button
              onClick={() => {
                setSavedToday(false);
                setTodayEntry(null);
                setError(null);
              }}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Reset form to track another check-in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}