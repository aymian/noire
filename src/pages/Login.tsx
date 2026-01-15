import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Headphones,
  Radio,
  Mic2,
  Music2,
} from "lucide-react";
import NoireLogo from "@/components/noire/NoireLogo";
import { auth, db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

/**
 * NOIRE Login Page - Compact 2-Column Layout
 * No scrolling needed - everything fits perfectly
 */

type AuthMode = "login" | "signup";
type InputType = "email" | "username" | "phone";

// Real brand SVG icons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const Login = () => {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [inputType, setInputType] = useState<InputType>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const socialProviders = [
    { name: "Google", icon: GoogleIcon, color: "hover:bg-blue-500/10 hover:border-blue-500/50" },
    { name: "Apple", icon: AppleIcon, color: "hover:bg-gray-500/10 hover:border-gray-400/50" },
    { name: "GitHub", icon: GitHubIcon, color: "hover:bg-purple-500/10 hover:border-purple-500/50" },
  ];

  const inputTypes = [
    { type: "email" as InputType, icon: Mail, placeholder: "your@email.com" },
    { type: "username" as InputType, icon: User, placeholder: "@username" },
    { type: "phone" as InputType, icon: Phone, placeholder: "+1 (555) 000-0000" },
  ];

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { strength: 0, label: "", color: "" };
    if (pass.length < 6) return { strength: 25, label: "Weak", color: "bg-red-500" };
    if (pass.length < 10) return { strength: 50, label: "Fair", color: "bg-orange-500" };
    if (pass.length < 14) return { strength: 75, label: "Good", color: "bg-yellow-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Safeguard: Force stop loading after 15 seconds if nothing happens
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        toast({
          title: "Connection Timeout",
          description: "The request is taking too long. Please check your internet connection.",
          variant: "destructive",
        });
      }
    }, 15000);

    try {
      if (authMode === "signup") {
        if (inputType !== "email") {
          toast({
            title: "Email Required",
            description: "Please use email for signup",
            variant: "destructive",
          });
          setIsLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        console.log("Starting Firebase Signup...");

        // 1. Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, identifier, password);
        const user = userCredential.user;
        console.log("Firebase User Created Successfully:", user.uid);

        // 2. Save user to Firestore
        try {
          console.log("Saving to Firestore...");
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: identifier,
            fullName: fullName || "",
            createdAt: serverTimestamp(),
            emailVerified: false,
          });
          console.log("Firestore Record Created");
        } catch (firestoreError: any) {
          console.error("Firestore Error:", firestoreError);
          // If Firestore fails, we still have the user created, but we should inform them
        }

        // 3. Send verification email via Supabase
        try {
          console.log("Sending Supabase OTP...");
          const { error: supabaseError } = await supabase.auth.signInWithOtp({
            email: identifier,
            options: {
              emailRedirectTo: `${window.location.origin}/onboarding`,
            },
          });

          if (supabaseError) {
            console.warn("Supabase OTP Warning:", supabaseError.message);
          } else {
            console.log("Supabase Verification Sent");
          }
        } catch (supabaseEx) {
          console.error("Supabase Exception:", supabaseEx);
        }

        toast({
          title: "Success",
          description: "Account created! Redirecting to verification...",
        });

        // Small delay to ensure state updates
        setTimeout(() => {
          console.log("Navigating to verify-email...");
          navigate("/verify-email");
        }, 500);

      } else {
        // Sign in
        console.log("Starting Firebase Signin...");
        await signInWithEmailAndPassword(auth, identifier, password);
        console.log("Firebase Signin Success");

        toast({
          title: "Welcome back!",
          description: "Sign in successful",
        });

        navigate("/");
      }
    } catch (error: any) {
      console.error("Critical Auth error:", error);
      let errorMsg = "Something went wrong. Please try again.";

      if (error.code === 'auth/email-already-in-use') {
        errorMsg = "This email is already registered.";
      } else if (error.code === 'auth/weak-password') {
        errorMsg = "Password should be at least 6 characters.";
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = "Please enter a valid email address.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMsg = "Invalid email or password.";
      }

      toast({
        title: "Authentication Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    try {
      let authProvider;

      if (provider === "Google") {
        authProvider = new GoogleAuthProvider();
      } else if (provider === "GitHub") {
        authProvider = new GithubAuthProvider();
      } else {
        toast({
          title: "Coming Soon",
          description: `${provider} authentication will be available soon`,
        });
        return;
      }

      const result = await signInWithPopup(auth, authProvider);
      const user = result.user;

      // Save user to Firestore if new
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || "",
        createdAt: serverTimestamp(),
        emailVerified: user.emailVerified,
      }, { merge: true });

      toast({
        title: "Success!",
        description: `Signed in with ${provider}`,
      });

      navigate("/");
    } catch (error: any) {
      console.error("Social auth error:", error);
      toast({
        title: "Authentication Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center">
      {/* 2-Column Grid - Centered */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 p-6">

          {/* LEFT COLUMN - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative hidden lg:flex flex-col justify-center p-8 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent rounded-2xl overflow-hidden"
          >
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  "radial-gradient(circle at 30% 50%, rgba(251, 191, 36, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 30% 50%, rgba(251, 191, 36, 0.15) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />

            {/* Floating Icons */}
            {[Headphones, Radio, Mic2, Music2].map((Icon, i) => (
              <motion.div
                key={i}
                className="absolute text-primary/5"
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${20 + i * 15}%`,
                }}
              >
                <Icon className="w-16 h-16" />
              </motion.div>
            ))}

            {/* Content */}
            <div className="relative z-10 space-y-6">
              <NoireLogo size={48} showText={true} />

              <div className="space-y-3">
                <h1 className="text-4xl font-display font-bold text-foreground leading-tight">
                  Your emotions.
                  <br />
                  <span className="text-gradient-gold">Our soundtrack.</span>
                </h1>
                <p className="text-lg text-muted-foreground font-body">
                  Music that understands how you feel
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-6 pt-4">
                {[
                  { value: "100K+", label: "Listeners" },
                  { value: "50K+", label: "Playlists" },
                  { value: "1M+", label: "Songs" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-display font-bold text-primary">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Visualizer */}
              <div className="flex items-end gap-1 h-12 pt-4">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gradient-to-t from-primary/50 to-primary rounded-full"
                    animate={{
                      height: [`${Math.random() * 30 + 20}%`, `${Math.random() * 60 + 40}%`, `${Math.random() * 30 + 20}%`],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center"
          >
            <div className="w-full max-w-md mx-auto space-y-6">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center">
                <NoireLogo size={36} showText={true} />
              </div>

              {/* Header */}
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-1">
                  {authMode === "login" ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-sm text-muted-foreground font-body">
                  {authMode === "login" ? "Sign in to continue" : "Join thousands of music lovers"}
                </p>
              </div>

              {/* Auth Mode Toggle */}
              <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
                {(["login", "signup"] as AuthMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAuthMode(mode)}
                    className={`flex-1 py-2 rounded-lg text-sm font-body font-medium transition-all duration-300 ${authMode === mode
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {mode === "login" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              {/* Social Auth with Real Icons */}
              <div className="grid grid-cols-3 gap-3">
                {socialProviders.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => handleSocialAuth(provider.name)}
                    className={`flex items-center justify-center p-3 bg-muted/20 border border-border/30 rounded-xl transition-all duration-300 ${provider.color}`}
                    title={`Continue with ${provider.name}`}
                  >
                    <provider.icon />
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground font-body">Or</span>
                </div>
              </div>

              {/* Input Type Selector */}
              <div className="flex gap-2">
                {inputTypes.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => setInputType(type.type)}
                    className={`flex-1 flex items-center justify-center p-2 rounded-lg border transition-all duration-300 ${inputType === type.type
                      ? "bg-primary/10 border-primary/50 text-primary"
                      : "bg-muted/20 border-border/30 text-muted-foreground"
                      }`}
                  >
                    <type.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Full Name (Signup) */}
                <AnimatePresence>
                  {authMode === "signup" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative"
                    >
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full pl-10 pr-3 py-2.5 text-sm bg-muted/30 border border-border/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email/Username/Phone */}
                <div className="relative">
                  {(() => {
                    const Icon = inputTypes.find(t => t.type === inputType)!.icon;
                    return <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />;
                  })()}
                  <input
                    type={inputType === "email" ? "email" : "text"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={inputTypes.find(t => t.type === inputType)?.placeholder}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-muted/30 border border-border/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-muted/30 border border-border/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength */}
                <AnimatePresence>
                  {authMode === "signup" && password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1"
                    >
                      <div className="flex justify-between text-xs font-body">
                        <span className="text-muted-foreground">Strength</span>
                        <span className={`font-medium ${passwordStrength.strength >= 75 ? "text-green-500" :
                          passwordStrength.strength >= 50 ? "text-yellow-500" : "text-red-500"
                          }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${passwordStrength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.strength}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forgot Password */}
                {authMode === "login" && (
                  <div className="flex justify-end">
                    <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors font-body">
                      Forgot password?
                    </a>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-body font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      {authMode === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="space-y-3">
                <p className="text-center text-xs text-muted-foreground font-body">
                  {authMode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    {authMode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-body">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Secured & encrypted</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Back to Home */}
      <a
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        Home
      </a>
    </div>
  );
};

export default Login;
