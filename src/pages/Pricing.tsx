import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check, Lock, Sparkles, Moon,
    Zap, ShieldCheck, HeartPulse, Crown,
    ArrowRight, Info, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const plans = [
    {
        id: "free",
        name: "Feel Only",
        price: "0",
        tagline: "Emotional hook",
        description: "You’re allowed to feel — but not fully.",
        color: "from-gray-500/20 to-transparent",
        glow: "group-hover:shadow-gray-500/10",
        icon: Info,
        features: [
            "Limited 10 skips", 
            "Ads every 3 songs", 
            "No downloads", 
            "4K High Fidelity Sound", 
            "Mood selector: 1 per day"
        ],
        cta: "Current Plan",
        limited: true
    },
    {
        id: "mini",
        name: "Quiet Nights",
        price: "299",
        tagline: "Sleep Better Tonight",
        description: "299 feels like nothing. Peace for your rest.",
        color: "from-blue-500/20 to-transparent",
        glow: "group-hover:shadow-blue-500/20",
        icon: Moon,
        features: ["No ads", "Unlimited listening", "Calm & Sad moods only", "Darker UI unlocked"],
        cta: "Unlock Peace",
        accent: "text-blue-400"
    },
    {
        id: "basic",
        name: "Mood Control",
        price: "699",
        tagline: "Most Chosen",
        description: "Master your emotions. Own your state of mind.",
        color: "from-primary/20 to-transparent",
        glow: "group-hover:shadow-primary/30",
        icon: Zap,
        features: ["All moods unlocked", "Unlimited skips", "Save favorites", "Emotional history"],
        cta: "Take Control",
        recommended: true,
        accent: "text-primary"
    },
    {
        id: "pro",
        name: "Noire Identity",
        price: "1,299",
        tagline: "Status & Depth",
        description: "Don't just listen. Become part of the identity.",
        color: "from-purple-500/20 to-transparent",
        glow: "group-hover:shadow-purple-500/20",
        icon: ShieldCheck,
        features: ["Pro badge on profile", "Ultra-smooth UI", "Higher sound quality", "Exclusive night sessions"],
        cta: "Gain Status",
        accent: "text-purple-400"
    },
    {
        id: "premium",
        name: "Deep Therapy",
        price: "1,999",
        tagline: "For deep feelers",
        description: "Ethical exploitation of pure emotion.",
        color: "from-red-500/20 to-transparent",
        glow: "group-hover:shadow-red-500/20",
        icon: HeartPulse,
        features: ["Offline listening", "Long-form journeys", "Breathing sessions", "Custom mood blends"],
        cta: "Deepen Connection",
        accent: "text-red-400"
    }
];

const elitePlan = {
    id: "elite",
    name: "Inner Circle",
    price: "2,499",
    tagline: "Mystery & Access",
    description: "For the few who truly belong. The ultimate brag.",
    color: "from-amber-500/20 to-transparent",
    glow: "group-hover:shadow-amber-500/40",
    icon: Crown,
    features: ["Early feature access", "Secret UI themes", "Incognito mode", "Priority support"],
    cta: "Join the Circle",
    accent: "text-amber-400"
};

const Pricing = () => {
    const [userPlan, setUserPlan] = useState("free");
    const [loading, setLoading] = useState(false);
    const [showElite, setShowElite] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserPlan(userDoc.data().plan || "free");
                }
            }
        });

        // Elite reveal logic: show after 10 seconds or scroll
        const timer = setTimeout(() => setShowElite(true), 15000);
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                setShowElite(true);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            unsubscribe();
            clearTimeout(timer);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleUpgrade = async (planId: string) => {
        const user = auth.currentUser;
        if (!user) {
            navigate("/login");
            return;
        }

        if (planId === userPlan) return;

        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                plan: planId,
                upgradedAt: new Date()
            });
            setUserPlan(planId);
            toast({
                title: "Upgrade Done",
                description: `Frequency shifted to ${planId.toUpperCase()}.`,
            });
            setTimeout(() => navigate("/"), 1500);
        } catch (error) {
            toast({
                title: "Shift Failed",
                description: "Emotional link interrupted. Try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-40 px-6 font-body">
            {/* Header */}
            <header className="max-w-4xl mx-auto text-center mb-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.4em]">
                        Subscription to Feelings
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-bold leading-none tracking-tighter">
                        Feel Without <span className="text-gradient-gold">Limits</span>
                    </h1>
                    <p className="text-white/40 max-w-lg mt-6 text-sm md:text-base leading-relaxed">
                        Noire is more than sound. It's control. Choose how deeply you want to belong to your own emotions.
                    </p>
                </motion.div>
            </header>

            {/* Plans Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className={`group relative glass-noire border ${plan.recommended ? 'border-primary/50' : 'border-white/5'} rounded-[40px] p-8 transition-all duration-500 hover:bg-white/[0.02] ${plan.glow}`}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-black text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">
                                Most Chosen
                            </div>
                        )}

                        <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className={`p-4 rounded-3xl bg-white/5 border border-white/5 ${plan.accent}`}>
                                    <plan.icon size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{plan.tagline}</div>
                                    <h3 className="text-2xl font-display font-bold">{plan.name}</h3>
                                </div>
                            </div>

                            <p className="text-sm text-white/40 mb-8 leading-relaxed italic">
                                "{plan.description}"
                            </p>

                            <div className="mb-10 flex items-baseline gap-2">
                                <span className="text-4xl font-display font-bold animate-pulse-slow">
                                    {plan.price}
                                </span>
                                <span className="text-xs font-bold text-white/20 uppercase tracking-widest">RWF / month</span>
                            </div>

                            <ul className="space-y-4 mb-12 flex-1">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-3 text-xs md:text-sm text-white/60">
                                        <div className={`w-1.5 h-1.5 rounded-full ${plan.accent || 'bg-white/20'}`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={loading || userPlan === plan.id}
                                className={`w-full py-5 rounded-3xl font-bold text-sm uppercase tracking-widest transition-all duration-500 overflow-hidden relative group/btn ${userPlan === plan.id
                                        ? 'bg-white/5 text-white/20 cursor-default'
                                        : 'bg-white text-black hover:bg-primary hover:text-black hover:shadow-2xl hover:shadow-primary/20'
                                    }`}
                            >
                                <span className="relative z-10">
                                    {userPlan === plan.id ? 'Already Aligned' : plan.cta}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                ))}

                {/* Elite Plan - Conditional Reveal */}
                <AnimatePresence>
                    {showElite && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            transition={{ type: "spring", damping: 12 }}
                            className="group relative glass-noire border border-amber-500/30 rounded-[40px] p-8 transition-all duration-500 bg-gradient-to-br from-amber-500/5 to-transparent hover:shadow-2xl hover:shadow-amber-500/20"
                        >
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-full">
                                Elite Pulse
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="p-4 rounded-3xl bg-amber-500/20 border border-amber-500/30 text-amber-500">
                                        <Crown size={24} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest mb-1">{elitePlan.tagline}</div>
                                        <h3 className="text-2xl font-display font-bold text-amber-500">{elitePlan.name}</h3>
                                    </div>
                                </div>

                                <p className="text-sm text-amber-500/40 mb-8 leading-relaxed italic">
                                    "{elitePlan.description}"
                                </p>

                                <div className="mb-10 flex items-baseline gap-2">
                                    <span className="text-4xl font-display font-bold text-amber-500 animate-heartbeat">
                                        {elitePlan.price}
                                    </span>
                                    <span className="text-xs font-bold text-amber-500/40 uppercase tracking-widest">RWF / month</span>
                                </div>

                                <ul className="space-y-4 mb-12 flex-1">
                                    {elitePlan.features.map(feature => (
                                        <li key={feature} className="flex items-center gap-3 text-xs md:text-sm text-amber-500/60">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleUpgrade(elitePlan.id)}
                                    disabled={loading || userPlan === elitePlan.id}
                                    className="w-full py-5 rounded-3xl font-bold text-sm uppercase tracking-widest transition-all duration-500 bg-amber-500 text-black hover:bg-white hover:scale-105"
                                >
                                    {userPlan === elitePlan.id ? 'Circle Access' : 'Enter the Circle'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Trust Footer */}
            <footer className="max-w-2xl mx-auto text-center border-t border-white/5 pt-12">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-4">Secured by Mood Shift Protocol</p>
                <div className="flex justify-center gap-8 items-center text-white/40">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-display font-bold text-white">100%</span>
                        <span className="text-[8px] uppercase tracking-widest">Safe</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-display font-bold text-white">0</span>
                        <span className="text-[8px] uppercase tracking-widest">Interruptions</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-display font-bold text-white">10s</span>
                        <span className="text-[8px] uppercase tracking-widest">Activation</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Pricing;
