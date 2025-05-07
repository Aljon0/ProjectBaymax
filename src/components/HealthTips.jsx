import { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where
} from "firebase/firestore";
import { auth, db } from "../firebase"; // Adjust path as needed
import { onAuthStateChanged } from "firebase/auth";
import BaymaxAvatar from "./BaymaxAvatar";

export default function HealthTips() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTips, setUserTips] = useState([]);
  const [userReminders, setUserReminders] = useState([]);
  const [customReminder, setCustomReminder] = useState({ time: "", message: "" });
  const [showAddReminderForm, setShowAddReminderForm] = useState(false);
  const [mood, setMood] = useState("happy");

  // Default tips and reminders
  const defaultTips = [
    {
      id: "tip1",
      title: "Stay Hydrated",
      description: "Drink at least 8 glasses of water daily to maintain proper hydration.",
      icon: "💧",
    },
    {
      id: "tip2",
      title: "Take Short Breaks",
      description: "For every 45 minutes of work, take a 5-minute break to rest your eyes and stretch.",
      icon: "⏱️",
    },
    {
      id: "tip3",
      title: "Practice Deep Breathing",
      description: "Take 5 deep breaths when feeling stressed to help calm your nervous system.",
      icon: "🫁",
    },
    {
      id: "tip4",
      title: "Limit Screen Time",
      description: "Try to avoid screens at least 1 hour before bedtime for better sleep quality.",
      icon: "📱",
    },
    {
      id: "tip5",
      title: "Get Moving",
      description: "Aim for at least 30 minutes of physical activity every day.",
      icon: "🏃",
    },
    {
      id: "tip6",
      title: "Eat More Vegetables",
      description: "Try to include vegetables in at least two meals daily for better nutrition.",
      icon: "🥦",
    },
  ];

  const defaultReminders = [
    { id: "rem1", time: "08:00", message: "Drink a glass of water" },
    { id: "rem2", time: "10:00", message: "Take a 5-minute stretch break" },
    { id: "rem3", time: "12:30", message: "Eat a balanced lunch" },
    { id: "rem4", time: "15:00", message: "Hydration reminder" },
    { id: "rem5", time: "18:00", message: "Time for a short walk" },
    { id: "rem6", time: "21:00", message: "Begin winding down for sleep" },
  ];

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser.uid);
        fetchUserMood(currentUser.uid);
      } else {
        // Use default data if not logged in
        setUserTips(defaultTips);
        setUserReminders(defaultReminders);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user's mood from their profile
  const fetchUserMood = async (userId) => {
    try {
      const moodRef = doc(db, "users", userId, "profile", "mood");
      const moodDoc = await getDoc(moodRef);
      
      if (moodDoc.exists()) {
        const moodData = moodDoc.data();
        setMood(moodData.currentMood || "happy");
      }
    } catch (error) {
      console.error("Error fetching user mood:", error);
    }
  };

  // Fetch user health tips and reminders
  const fetchUserData = async (userId) => {
    try {
      // Check if user has health tips data
      const healthRef = doc(db, "users", userId, "health", "tips");
      const healthDoc = await getDoc(healthRef);
      
      if (healthDoc.exists()) {
        const data = healthDoc.data();
        setUserTips(data.tips || defaultTips);
        setUserReminders(data.reminders || defaultReminders);
        setNotificationsEnabled(data.notificationsEnabled || false);
      } else {
        // Create default health tips for new user
        await setDoc(healthRef, {
          tips: defaultTips,
          reminders: defaultReminders,
          notificationsEnabled: false
        });
        setUserTips(defaultTips);
        setUserReminders(defaultReminders);
      }
    } catch (error) {
      console.error("Error fetching health tips:", error);
      // Fallback to defaults
      setUserTips(defaultTips);
      setUserReminders(defaultReminders);
    } finally {
      setLoading(false);
    }
  };

  // Toggle notifications and update in Firestore
  const toggleNotifications = async () => {
    if (!user) {
      setNotificationsEnabled(!notificationsEnabled);
      return;
    }
    
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      
      // Update in Firestore
      const healthRef = doc(db, "users", user.uid, "health", "tips");
      await updateDoc(healthRef, {
        notificationsEnabled: newValue
      });
      
      // Here you would also implement the actual push notification registration
      // This depends on your notification service (Firebase Cloud Messaging, etc.)
      if (newValue) {
        // Request notification permission
        if ("Notification" in window) {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            alert("Please allow notifications to receive health reminders");
            setNotificationsEnabled(false);
          }
        }
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
      setNotificationsEnabled(!notificationsEnabled); // Revert UI change
    }
  };

  // Add custom reminder
  const addCustomReminder = async () => {
    if (!customReminder.time || !customReminder.message) {
      alert("Please enter both time and message for your reminder");
      return;
    }
    
    // Create new reminder with unique ID
    const newReminder = { 
      id: `custom-${Date.now()}`, 
      time: customReminder.time, 
      message: customReminder.message 
    };
    
    // Update local state
    const updatedReminders = [...userReminders, newReminder];
    setUserReminders(updatedReminders);
    
    // Clear form
    setCustomReminder({ time: "", message: "" });
    setShowAddReminderForm(false);
    
    // Update in Firestore if user is logged in
    if (user) {
      try {
        const healthRef = doc(db, "users", user.uid, "health", "tips");
        await updateDoc(healthRef, {
          reminders: updatedReminders
        });
      } catch (error) {
        console.error("Error adding reminder:", error);
      }
    }
  };

  // Delete a reminder
  const deleteReminder = async (reminderId) => {
    // Find the reminder to remove
    const reminderToRemove = userReminders.find(r => r.id === reminderId);
    if (!reminderToRemove) return;
    
    // Update local state
    const updatedReminders = userReminders.filter(r => r.id !== reminderId);
    setUserReminders(updatedReminders);
    
    // Update in Firestore if user is logged in
    if (user) {
      try {
        const healthRef = doc(db, "users", user.uid, "health", "tips");
        await updateDoc(healthRef, {
          reminders: updatedReminders
        });
      } catch (error) {
        console.error("Error deleting reminder:", error);
        // Revert local state if error
        setUserReminders(userReminders);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex items-center justify-center mb-8">
        <BaymaxAvatar mood={mood} />
      </div>

      <div className="bg-gray-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Health Tips & Reminders
        </h2>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Notifications</h3>
            <button
              onClick={toggleNotifications}
              className={`px-4 py-2 rounded-full ${
                notificationsEnabled ? "bg-green-500 text-white" : "bg-gray-300"
              }`}
            >
              {notificationsEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Daily Reminders</h4>
              <button 
                onClick={() => setShowAddReminderForm(!showAddReminderForm)}
                className="text-sm px-3 py-1 bg-red-500 text-white rounded-full"
              >
                {showAddReminderForm ? 'Cancel' : '+ Add'}
              </button>
            </div>
            
            {showAddReminderForm && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex flex-col md:flex-row gap-2 mb-2">
                  <input
                    type="time"
                    value={customReminder.time}
                    onChange={(e) => setCustomReminder({...customReminder, time: e.target.value})}
                    className="p-2 border rounded flex-1"
                  />
                  <input
                    type="text"
                    value={customReminder.message}
                    onChange={(e) => setCustomReminder({...customReminder, message: e.target.value})}
                    placeholder="Reminder message"
                    className="p-2 border rounded flex-2"
                  />
                </div>
                <button 
                  onClick={addCustomReminder}
                  className="w-full bg-red-500 text-white py-1 rounded"
                >
                  Save Reminder
                </button>
              </div>
            )}
            
            <div className="space-y-2">
              {userReminders.length === 0 ? (
                <p className="text-gray-500 text-center py-2">No reminders set</p>
              ) : (
                userReminders
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex justify-between items-center p-2 border-b border-gray-100"
                    >
                      <span className="font-medium">
                        {reminder.time.includes(":") ? reminder.time : `${reminder.time.substring(0, 2)}:${reminder.time.substring(2)}`}
                      </span>
                      <span>{reminder.message}</span>
                      <button 
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-medium mb-4">Health Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userTips.map((tip) => (
              <div key={tip.id} className="bg-white rounded-lg shadow p-4">
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