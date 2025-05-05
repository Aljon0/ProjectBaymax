import {
  AlertTriangle,
  Bell,
  Calendar,
  Heart,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import Emergency from "./components/Emergency";
import HealthCheckIn from "./components/HealthCheckIn";
import HealthTips from "./components/HealthTips";
import Journal from "./components/Journal";
import SymptomChecker from "./components/SymptomChecker";
import Header from "./components/Header";

export default function App() {
  const [activeTab, setActiveTab] = useState("symptomChecker");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header Component */}
      <Header 
        activeTab={activeTab} 
        handleTabChange={handleTabChange} 
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4">
        {activeTab === "symptomChecker" && <SymptomChecker />}
        {activeTab === "healthCheckIn" && <HealthCheckIn />}
        {activeTab === "journal" && <Journal />}
        {activeTab === "healthTips" && <HealthTips />}
        {activeTab === "emergency" && <Emergency />}
      </main>

      {/* Footer */}
      <footer className="bg-red-500 text-white p-4 text-center">
        <p>BaymaxAI - Your Personal Healthcare Companion</p>
      </footer>
    </div>
  );
}