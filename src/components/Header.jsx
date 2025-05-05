import { Heart, Bell, Calendar, MessageSquare, AlertTriangle, User, LogOut, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import NavButton from "./NavButton";
import MobileNavButton from "./MobileNavButton";

export default function Header({ activeTab, handleTabChange }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close profile menu if opening mobile menu
    if (!isMobileMenuOpen) setIsProfileOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Add logout functionality here
    console.log("Logging out...");
    setIsProfileOpen(false);
  };

  return (
    <>
      <header className="bg-red-500 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold">BaymaxAI</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
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

            {/* User Profile Button */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={toggleProfileMenu}
                className="flex items-center gap-2 ml-6 bg-white text-red-500 py-2 px-4 rounded-full hover:bg-red-50 transition-colors"
              >
                <span className="font-medium">John Doe</span>
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-red-500" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900">john.doe@example.com</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu and Profile Buttons */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Profile Button */}
            <button 
              onClick={toggleProfileMenu}
              className="flex items-center justify-center h-9 w-9 rounded-full bg-white text-red-500"
            >
              <User className="h-5 w-5" />
            </button>

            {/* Mobile Menu Button */}
            <button className="flex items-center justify-center" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Profile Dropdown */}
      {isProfileOpen && (
        <div className="md:hidden absolute top-16 right-2 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-30">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-sm text-gray-500">john.doe@example.com</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-16 left-0 right-0 z-20">
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
    </>
  );
}