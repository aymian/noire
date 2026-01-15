import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Mail, CheckCircle, RefreshCw, ArrowRight, Sparkles, Image as ImageIcon } from "lucide-react";
import NoireLogo from "@/components/noire/NoireLogo";
import { auth, db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

/**
 * Email Verification Page with Screenshot Guide
 * Shows users how to verify their email step-by-step
 */

const VerifyEmail = () => {
    const [emailSent, setEmailSent] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [userEmail, setUserEmail] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in and get their email
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || "");
                // If email is already verified, redirect to onboarding
                if (user.emailVerified) {
                    navigate("/onboarding");
                }
            } else {
                // If no user, redirect to login
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        // Countdown timer for resend button
        if (countdown > 0 && emailSent) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown, emailSent]);

    const handleResendEmail = async () => {
        if (!userEmail || countdown > 0) return;

        setIsResending(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: userEmail,
                options: {
                    emailRedirectTo: `${window.location.origin}/onboarding`,
                },
            });

            if (error) throw error;

            setEmailSent(true);
            setCountdown(60);
        } catch (error) {
            console.error("Error sending verification email:", error);
        } finally {
            setIsResending(false);
        }
    };

    const handleCheckVerification = async () => {
        if (!auth.currentUser) return;

        setIsChecking(true);
        try {
            await auth.currentUser.reload();

            if (auth.currentUser.emailVerified) {
                // Update Firestore
                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    emailVerified: true,
                });

                // Redirect to onboarding with welcome message
                navigate("/onboarding?welcome=true");
            } else {
                alert("Email not verified yet. Please check your inbox and click the verification link.");
            }
        } catch (error) {
            console.error("Error checking verification:", error);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background" />

            <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                    background: [
                        "radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.15) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)",
                        "radial-gradient(circle at 50% 80%, rgba(251, 191, 36, 0.15) 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.15) 0%, transparent 50%)",
                    ],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            {/* Main Content - 2 Column Layout */}
            <div className="relative w-full max-w-6xl z-10">
                <div className="grid lg:grid-cols-2 gap-8">

                    {/* LEFT - Screenshot Guide */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <div className="glass-noire rounded-2xl border border-border/30 p-6">
                            <h3 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-primary" />
                                How to Verify Your Email
                            </h3>

                            {/* Screenshot Placeholders */}
                            <div className="space-y-4">
                                {/* Step 1 Screenshot */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                            <span className="text-sm font-bold text-primary">1</span>
                                        </div>
                                        <p className="text-sm font-body font-semibold text-foreground">Check Your Email Inbox</p>
                                    </div>
                                    <div className="relative aspect-video bg-muted/20 rounded-xl border border-border/20 overflow-hidden group shadow-inner">
                                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                            <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                <Mail className="w-8 h-8 text-primary" />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-widest bg-muted/50 px-2 py-1 rounded">Inbox Preview Placeholder</p>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
                                    </div>
                                </div>

                                {/* Step 2 Screenshot */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                            <span className="text-sm font-bold text-primary">2</span>
                                        </div>
                                        <p className="text-sm font-body font-semibold text-foreground">Open the NOIRE Verification Link</p>
                                    </div>
                                    <div className="relative aspect-video bg-muted/20 rounded-xl border border-border/20 overflow-hidden group shadow-inner">
                                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                            <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                <ArrowRight className="w-8 h-8 text-primary" />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-widest bg-muted/50 px-2 py-1 rounded">Email Content Placeholder</p>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
                                    </div>
                                </div>

                                {/* Step 3 Screenshot */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                            <span className="text-sm font-bold text-primary">3</span>
                                        </div>
                                        <p className="text-sm font-body font-semibold text-foreground">Get Redirected to Onboarding</p>
                                    </div>
                                    <div className="relative aspect-video bg-muted/20 rounded-xl border border-border/20 overflow-hidden group shadow-inner">
                                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                            <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                <Sparkles className="w-8 h-8 text-primary" />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-widest bg-muted/50 px-2 py-1 rounded">Success Redirect Placeholder</p>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                <p className="text-sm text-foreground font-body">
                                    💡 <strong>Tip:</strong> Can't find the email? Check your spam/junk folder!
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT - Verification Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center"
                    >
                        <div className="w-full">
                            {/* Glow Effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-20 blur-3xl rounded-3xl" />

                            {/* Card Content */}
                            <div className="relative glass-noire rounded-3xl border border-border/30 p-8 shadow-2xl">
                                {/* Logo */}
                                <motion.div
                                    className="flex justify-center mb-6"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                >
                                    <NoireLogo size={48} showText={true} />
                                </motion.div>

                                {/* Icon */}
                                <motion.div
                                    className="flex justify-center mb-6"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                        <div className="relative w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Mail className="w-10 h-10 text-primary" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Title */}
                                <motion.div
                                    className="text-center mb-6"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                >
                                    <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                                        Verify Your Email
                                    </h1>
                                    <p className="text-muted-foreground font-body flex items-center justify-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        One more step to get started
                                    </p>
                                </motion.div>

                                {/* Email Display */}
                                <motion.div
                                    className="mb-6 p-4 bg-muted/30 rounded-xl border border-border/30"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 0.6 }}
                                >
                                    <p className="text-sm text-muted-foreground font-body text-center mb-2">
                                        We've sent a verification link to:
                                    </p>
                                    <p className="text-foreground font-body font-medium text-center break-all">
                                        {userEmail}
                                    </p>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    className="space-y-3"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.7, duration: 0.6 }}
                                >
                                    {/* Check Verification Button */}
                                    <button
                                        onClick={handleCheckVerification}
                                        disabled={isChecking}
                                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-body font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isChecking ? (
                                            <>
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                Checking...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                I've Verified My Email
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>

                                    {/* Resend Email Button */}
                                    <button
                                        onClick={handleResendEmail}
                                        disabled={countdown > 0 || isResending}
                                        className="w-full py-3 bg-muted/30 text-foreground border border-border/30 rounded-xl font-body font-medium transition-all duration-300 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isResending ? (
                                            <>
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-5 h-5" />
                                                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Verification Email"}
                                            </>
                                        )}
                                    </button>
                                </motion.div>

                                {/* Footer */}
                                <motion.div
                                    className="mt-6 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.6 }}
                                >
                                    <p className="text-xs text-muted-foreground font-body">
                                        Wrong email?{" "}
                                        <a
                                            href="/login"
                                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                                        >
                                            Sign in with a different account
                                        </a>
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Back to Login */}
            <a
                href="/login"
                className="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
            >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Login
            </a>
        </div>
    );
};

export default VerifyEmail;
