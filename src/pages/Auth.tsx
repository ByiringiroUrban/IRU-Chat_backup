import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

// Use proxy in development (empty string = relative URL), direct URL in production
// The Vite proxy will forward /api/* to http://localhost:5000/api/*
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordSignup, setShowPasswordSignup] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/auth/login`;
      console.log('🔵 Sign in request to:', url);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔵 Response status:', res.status, res.statusText);
      console.log('🔵 Response headers:', Object.fromEntries(res.headers.entries()));

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server returned ${res.status}: Expected JSON but got ${contentType}. Make sure the backend server is running on port 5000.`);
      }

      const data = await res.json();
      if (!res.ok) {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.msg || err.message).join(', ');
          throw new Error(errorMessages || "Validation failed");
        }
        throw new Error(data.error || data.message || "Failed to sign in");
      }

      // Store token and user data
      localStorage.setItem(
        "iru-auth",
        JSON.stringify({
          token: data.token,
          user: { 
            id: data.user.id, 
            name: data.user.fullName, 
            email: data.user.email,
            role: data.user.role || 'user',
            createdAt: data.user.createdAt
          },
        })
      );

      toast({ title: "Signed in", description: `Welcome back, ${data.user.fullName}!` });
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/chatbot");
      }
    } catch (err: any) {
      console.error('❌ Sign in error:', err);
      toast({
        title: "Sign in failed",
        description: err.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/auth/register`;
      console.log('🟢 Sign up request to:', url);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, email, password }),
      });

      console.log('🟢 Response status:', res.status, res.statusText);
      console.log('🟢 Response headers:', Object.fromEntries(res.headers.entries()));

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server returned ${res.status}: Expected JSON but got ${contentType}. Make sure the backend server is running on port 5000.`);
      }

      const data = await res.json();
      if (!res.ok) {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.msg || err.message).join(', ');
          throw new Error(errorMessages || "Validation failed");
        }
        throw new Error(data.error || data.message || "Failed to create account");
      }

      localStorage.setItem(
        "iru-auth",
        JSON.stringify({
          token: data.token,
          user: { 
            id: data.user.id, 
            name: data.user.fullName, 
            email: data.user.email,
            role: data.user.role || 'user',
            createdAt: data.user.createdAt
          },
        })
      );

      toast({ title: "Account created", description: `Welcome, ${data.user.fullName}!` });
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/chatbot");
      }
    } catch (err: any) {
      console.error('❌ Sign up error:', err);
      toast({
        title: "Sign up failed",
        description: err.message || "Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // For now, this is a placeholder - you'll need to implement Google OAuth
    toast({
      title: "Google Sign In",
      description: "Google authentication will be available soon!",
    });
  };

  const handleGoogleSignUp = async () => {
    // For now, this is a placeholder - you'll need to implement Google OAuth
    toast({
      title: "Google Sign Up",
      description: "Google authentication will be available soon!",
    });
  };

  const renderSignInForm = () => (
    <form onSubmit={handleSignIn}>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back</h2>
      <p className="text-gray-600 mb-6">Sign in to your account to continue chatting</p>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          required
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
            Password
          </label>
          <span className="text-sm text-gray-400">Keep it safe</span>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••"
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full btn-hero" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-gray-700 font-medium shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-gray-800">Sign in with Google</span>
      </button>
    </form>
  );

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp}>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Create an account</h2>

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email-signup" className="block text-gray-700 text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email-signup"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password-signup" className="block text-gray-700 text-sm font-medium mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPasswordSignup ? "text" : "password"}
            id="password-signup"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••"
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            required
          />
          <button
            type="button"
            onClick={() => setShowPasswordSignup(!showPasswordSignup)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPasswordSignup ? "Hide password" : "Show password"}
          >
            {showPasswordSignup ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full btn-hero mt-4" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-gray-700 font-medium shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-gray-800">Sign up with Google</span>
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        {/* Back to Home Button */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        {/* Tab Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
          <button
            className={`flex-1 py-2 text-center rounded-md text-lg font-medium transition-all duration-300 ${
              activeTab === "signIn" ? "bg-white shadow text-gray-800" : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("signIn")}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 text-center rounded-md text-lg font-medium transition-all duration-300 ${
              activeTab === "signUp" ? "bg-white shadow text-gray-800" : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("signUp")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        {activeTab === "signIn" ? renderSignInForm() : renderSignUpForm()}
      </div>
    </div>
  );
};

export default AuthPage;