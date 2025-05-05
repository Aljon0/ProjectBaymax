import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
  User,
  ExternalLink,
  PlayCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { showSuccessToast, showErrorToast, showBaymaxToast } from "./ToastService";
import "react-toastify/dist/ReactToastify.css";

export default function AuthPages() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { login, register, loginWithGoogle, signInAnonymously, getCurrentUser } = useAuth();
  const navigate = useNavigate();

  // Clear error when switching auth modes
  useEffect(() => {
    setError("");
  }, [isLogin]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all required fields");
      showErrorToast("Please fill in all required fields");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      showErrorToast("Passwords do not match");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters long");
      showErrorToast("Password must be at least 6 characters long");
      return;
    }

    try {
      setError("");
      setLoading(true);
      
      if (isLogin) {
        await login(email, password);
        showSuccessToast("Welcome back to BaymaxAI!");
      } else {
        await register(email, password, name);
        showSuccessToast("Account created successfully! Welcome to BaymaxAI.");
      }
      
      navigate("/");
    } catch (error) {
      console.error(error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        showErrorToast('Invalid email or password');
        setError('Invalid email or password');
      } else if (error.code === 'auth/email-already-in-use') {
        showErrorToast('Email is already in use');
        setError('Email is already in use');
      } else if (error.code === 'auth/weak-password') {
        showErrorToast('Password is too weak');
        setError('Password is too weak');
      } else if (error.code === 'auth/invalid-email') {
        showErrorToast('Invalid email address');
        setError('Invalid email address');
      } else if (error.code === 'auth/invalid-credential') {
        showErrorToast('Invalid credentials. Please try again.');
        setError('Invalid credentials. Please try again.');
      } else {
        showErrorToast('Failed to ' + (isLogin ? 'sign in' : 'create account'));
        setError('Failed to ' + (isLogin ? 'sign in' : 'create account'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      showSuccessToast("Successfully signed in with Google!");
      navigate("/");
    } catch (error) {
      console.error(error);
      setError("Failed to sign in with Google");
      showErrorToast("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    try {
      setError("");
      setLoading(true);
      
      // Use Firebase anonymous authentication instead of credentials
      await signInAnonymously();
      
      showSuccessToast("Welcome to the BaymaxAI Demo! You're exploring as a guest user.");
      navigate("/");
    } catch (error) {
      console.error("Anonymous auth error:", error);
      
      // Provide specific error feedback for anonymous authentication
      if (error.code === 'auth/operation-not-allowed') {
        setError("Demo mode is currently unavailable. Anonymous authentication is not enabled.");
        showErrorToast("Demo mode is currently unavailable. Please try creating an account instead.");
      } else {
        setError("Failed to access demo mode: " + error.message);
        showErrorToast("Failed to access demo mode. Please try again or create an account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-red-50 flex flex-col">
      {/* Toast Container placed at the app root level for better visibility */}
      <ToastContainer 
        position="top-right"
        autoClose={4000}
        limit={3}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
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
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? "Welcome Back" : "Create Your Account"}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin
                ? "Sign in to access your health companion"
                : "Join BaymaxAI for personalized healthcare support"}
            </p>
          </div>

          {/* Demo Button - Displayed prominently at the top when on login page */}
          {isLogin && (
            <div className="mb-6">
              <button
                onClick={handleDemoAccess}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-4 px-4 rounded-lg flex items-center justify-center transition-all shadow-lg hover:shadow-xl group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in to Demo...
                  </span>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-white/10 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    <div className="flex items-center justify-center space-x-2 relative">
                      <PlayCircle className="h-6 w-6" />
                      <span className="text-lg">Continue as Guest</span>
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-2">
                No account required • Try out features instantly as a guest
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center mb-6 shadow-sm">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-5">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    className="pl-10 w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="mb-5">
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

            <div className="mb-5">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="pl-10 pr-10 w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="pl-10 pr-10 w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="mb-6 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-red-500 hover:text-red-600 transition-colors"
                  onClick={() => showBaymaxToast("Redirecting to password reset...")}
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="mt-5 w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-gray-700 font-medium">
                {isLogin ? "Sign in with Google" : "Sign up with Google"}
              </span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
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