import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Heart, Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setError("");
      setMessage("");
      setLoading(true);
      
      await resetPassword(email);
      setMessage("Check your email for password reset instructions");
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        setError("No account found with this email");
      } else if (error.code === 'auth/invalid-email') {
        setError("Invalid email address");
      } else {
        setError("Failed to send password reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-red-50 flex flex-col">
      <header className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-center items-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-md">
              <Heart className="h-7 w-7 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold">BaymaxAI</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md border border-gray-100">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
            <p className="text-gray-600 mt-2">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center mb-6">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center mb-6">
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="pl-10 w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="flex items-center justify-center text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-red-500 to-red-600 text-white p-5 text-center shadow-inner">
        <p className="font-medium">
          BaymaxAI - Your Personal Healthcare Companion
        </p>
        <p className="text-sm mt-1 text-red-100">
          © {new Date().getFullYear()} All Rights Reserved
        </p>
      </footer>
    </div>
  );
}