import {
  AlertTriangle,
  Bell,
  Calendar,
  Heart,
  Menu,
  MessageSquare,
  X,
} from "lucide-react";
import { useState } from "react";
import Emergency from "./components/Emergency";
import HealthCheckIn from "./components/HealthCheckIn";
import HealthTips from "./components/HealthTips";
import Journal from "./components/Journal";
import MobileNavButton from "./components/MobileNavButton";
import NavButton from "./components/NavButton";
import SymptomChecker from "./components/SymptomChecker";

export default function BaymaxApp() {
  const [activeTab, setActiveTab] = useState("symptomChecker");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-red-500 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold">BaymaxAI</h1>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <NavButton
              icon={<Heart />}
              label="Symptom Checker"
              active={activeTab === "symptomChecker"}
              onClick={() => handleTabChange("symptomChecker")}
            />
            <NavButton
              icon={<Calendar />}
              label="Health Check-In"
              active={activeTab === "healthCheckIn"}
              onClick={() => handleTabChange("healthCheckIn")}
            />
            <NavButton
              icon={<MessageSquare />}
              label="Journal"
              active={activeTab === "journal"}
              onClick={() => handleTabChange("journal")}
            />
            <NavButton
              icon={<Bell />}
              label="Health Tips"
              active={activeTab === "healthTips"}
              onClick={() => handleTabChange("healthTips")}
            />
            <NavButton
              icon={<AlertTriangle />}
              label="Emergency"
              active={activeTab === "emergency"}
              onClick={() => handleTabChange("emergency")}
            />
          </nav>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-16 left-0 right-0 z-10">
          <div className="flex flex-col">
            <MobileNavButton
              icon={<Heart />}
              label="Symptom Checker"
              active={activeTab === "symptomChecker"}
              onClick={() => handleTabChange("symptomChecker")}
            />
            <MobileNavButton
              icon={<Calendar />}
              label="Health Check-In"
              active={activeTab === "healthCheckIn"}
              onClick={() => handleTabChange("healthCheckIn")}
            />
            <MobileNavButton
              icon={<MessageSquare />}
              label="Journal"
              active={activeTab === "journal"}
              onClick={() => handleTabChange("journal")}
            />
            <MobileNavButton
              icon={<Bell />}
              label="Health Tips"
              active={activeTab === "healthTips"}
              onClick={() => handleTabChange("healthTips")}
            />
            <MobileNavButton
              icon={<AlertTriangle />}
              label="Emergency"
              active={activeTab === "emergency"}
              onClick={() => handleTabChange("emergency")}
            />
          </div>
        </div>
      )}

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
