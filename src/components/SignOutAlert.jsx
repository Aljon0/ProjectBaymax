import { useState } from "react";
import { XCircle, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// This component would replace the current logout button in your Header component
export default function SignOutAlert() {
  const [showAlert, setShowAlert] = useState(false);
  
  const { logout } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
  try {
    await logout();
    setShowAlert(false);
    navigate("/login");
  } catch (error) {
    console.error("Failed to log out", error);
  }
};

  return (
    <>
      {/* Button that triggers the alert */}
      <button 
        onClick={() => setShowAlert(true)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </button>

      {/* Alert Overlay */}
      {showAlert && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            {/* Alert Header */}
            <div className="bg-red-500 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                  <LogOut className="h-4 w-4 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Sign Out</h3>
              </div>
              <button 
                onClick={() => setShowAlert(false)}
                className="text-white hover:text-red-100"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {/* Alert Body */}
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <p className="text-center text-gray-700 mb-6">
                Are you sure you want to sign out of your BaymaxAI account?
              </p>
              
              {/* Alert Actions */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowAlert(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}