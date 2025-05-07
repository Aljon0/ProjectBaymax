import { useState, useEffect } from "react";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp,
  arrayUnion // Added missing import
} from "firebase/firestore";
import { auth, db } from "../firebase"; // Adjust path as needed
import { onAuthStateChanged } from "firebase/auth";
import BaymaxAvatar from "./BaymaxAvatar";

export default function Emergency() {
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserEmergencyData(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user's emergency information from Firestore
  const fetchUserEmergencyData = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const emergencyRef = doc(db, "users", userId, "emergency", "info");
      const emergencyDoc = await getDoc(emergencyRef);
      
      if (emergencyDoc.exists()) {
        const data = emergencyDoc.data();
        setContactName(data.contactName || "");
        setContactPhone(data.contactPhone || "");
        setBloodType(data.bloodType || "");
        setAllergies(data.allergies || "");
        setMedications(data.medications || "");
      }
    } catch (error) {
      console.error("Error fetching emergency data:", error);
      setError("Failed to load your emergency information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save emergency information to Firestore
  const handleSave = async () => {
    if (!user) {
      alert("Please sign in to save your emergency information.");
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const emergencyRef = doc(db, "users", user.uid, "emergency", "info");
      
      // Prepare data object
      const emergencyData = {
        contactName,
        contactPhone,
        bloodType,
        allergies,
        medications,
        lastUpdated: Timestamp.now()
      };
      
      // Save to Firestore
      await setDoc(emergencyRef, emergencyData, { merge: true });
      
      // Show success message
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving emergency info:", error);
      setError("Failed to save your information. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle emergency contact functionality
  const handleContactEmergency = () => {
    if (!contactPhone) {
      alert("Please add an emergency contact first.");
      return;
    }
    
    // In a real app, this would integrate with SMS/calling API
    // For demonstration, we'll just show an alert
    alert(`In a real application, this would send a message to ${contactName} at ${contactPhone}`);
    
    // In a real implementation, you could also log this emergency contact attempt
    if (user) {
      try {
        const emergencyLogRef = doc(db, "users", user.uid, "emergency", "logs");
        updateDoc(emergencyLogRef, {
          contactAttempts: arrayUnion({
            timestamp: Timestamp.now(),
            contactName,
            contactPhone
          })
        }).catch(error => {
          // If document doesn't exist yet, create it
          if (error.code === "not-found") {
            setDoc(emergencyLogRef, {
              contactAttempts: [{
                timestamp: Timestamp.now(),
                contactName,
                contactPhone
              }]
            });
          }
        });
      } catch (error) {
        console.error("Error logging emergency contact attempt:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner-border text-red-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading emergency information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex items-center justify-center mb-8">
        <BaymaxAvatar mood="alert" />
      </div>

      <div className="bg-gray-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Emergency Information
        </h2>

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8">
            <p className="text-yellow-700">
              Sign in to save your emergency information securely.
            </p>
          </div>
        )}

        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-8">
          <h3 className="text-red-600 font-bold text-lg mb-2">
            Important Notice
          </h3>
          <p>
            This is not a substitute for emergency services. If you are
            experiencing a medical emergency, please call 911 or your local
            emergency number immediately.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-medium mb-4">Emergency Contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Contact Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Contact Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter phone number"
                />
              </div>

              <button
                type="button"
                onClick={handleContactEmergency}
                disabled={!contactPhone}
                className={`w-full ${!contactPhone ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} text-white py-3 rounded-lg transition-colors`}
              >
                Contact Emergency Person
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-4">Medical Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Blood Type</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Allergies</label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 h-20"
                  placeholder="List any allergies"
                ></textarea>
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Current Medications
                </label>
                <textarea
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 h-20"
                  placeholder="List any medications"
                ></textarea>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !user}
                className={`w-full ${saving || !user ? 'bg-gray-400' : saved ? 'bg-green-500' : 'bg-red-500 hover:bg-red-600'} text-white py-3 rounded-lg transition-colors`}
              >
                {saving ? "Saving..." : saved ? "Information Saved!" : "Save Medical Information"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}