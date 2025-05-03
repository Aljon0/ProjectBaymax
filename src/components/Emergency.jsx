import { useState } from "react";
import BaymaxAvatar from "./BaymaxAvatar";

export default function Emergency() {
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleContactEmergency = () => {
    if (contactPhone) {
      alert(
        `In a real application, this would send a message to ${contactName} at ${contactPhone}`
      );
    } else {
      alert("Please add an emergency contact first.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex items-center justify-center mb-8">
        <BaymaxAvatar mood="alert" />
      </div>

      <div className="bg-gray-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Emergency Information
        </h2>

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
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
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
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                {saved ? "Information Saved!" : "Save Medical Information"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
