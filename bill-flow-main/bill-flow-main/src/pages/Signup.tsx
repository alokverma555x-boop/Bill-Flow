import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";

import { 
  auth, 
  googleProvider, 
  signInWithPopup 
} from "@/firebase";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Email Signup (Firebase)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // 👇 Save name
      await updateProfile(userCred.user, {
        displayName: name,
      });

      navigate("/dashboard");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Signup/Login (same)
  const signupWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md fade-up">

        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold">Bill Manager</h1>
            <p className="text-xs">Home Utility Tracker</p>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold mb-1">Create account</h2>
          <p className="text-sm mb-6">Start managing your bills</p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <Button className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          {/* Google Signup */}
          <Button
            type="button"
            onClick={signupWithGoogle}
            className="w-full mt-3 bg-white hover:bg-gray-200 flex gap-2 items-center justify-center"
          >
            <svg
  className="h-4 w-4"
  viewBox="0 0 48 48"
  xmlns="http://www.w3.org/2000/svg"
>
  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.826 32.658 29.28 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.732 0-14.318 4.327-17.694 10.691z"/>
  <path fill="#4CAF50" d="M24 44c5.22 0 9.92-1.998 13.521-5.239l-6.25-5.278C29.083 35.091 26.715 36 24 36c-5.264 0-9.799-3.317-11.627-7.946l-6.52 5.025C9.15 39.556 16.227 44 24 44z"/>
  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.255 3.658-4.801 6.347-9.303 6.347-5.284 0-9.817-3.32-11.64-7.961l-6.52 5.025C9.15 39.556 16.227 44 24 44c11.045 0 20-8.955 20-20 0-1.341-.138-2.65-.389-3.917z"/>
</svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Signup;