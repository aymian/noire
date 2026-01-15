import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Sparkles, Music2, Heart, Headphones, ArrowRight,
    User, Phone, Mail, Camera, Check, Info, Library, Music
} from "lucide-react";
import NoireLogo from "@/components/noire/NoireLogo";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

/**
 * Enhanced Onboarding Page
 * 1. Checks for missing user info (username, email, phone)
 * 2. Profile picture upload to Supabase
 * 3. Genre selection (min 3)
 */

type Step = "welcome" | "info" | "avatar" | "genres" | "finishing";

const Onboarding = () => {
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState<Step>("welcome");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Form State
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const genres = [
        { id: "amapiano", label: "Amapiano", icon: Music },
        { id: "sad", label: "Sad", icon: Heart },
        { id: "calm", label: "Calm", icon: Headphones },
        { id: "afrobeat", label: "Afrobeat", icon: Library },
        { id: "happy", label: "Happy", icon: Sparkles },
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    setUsername(data.username || "");
                    setPhone(data.phone || "");
                    setEmail(data.email || "");
                    setAvatarUrl(data.avatarUrl || "");
                    setSelectedGenres(data.genres || []);

                    // Automatically mark verified in DB if they reached here
                    if (!data.emailVerified) {
                        await updateDoc(doc(db, "users", user.uid), { emailVerified: true });
                    }
                }
                setLoading(false);
            } else {
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleNext = () => {
        if (step === "welcome") setStep("info");
        else if (step === "info") setStep("avatar");
        else if (step === "avatar") setStep("genres");
        else if (step === "genres") handleComplete();
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.uid}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            toast({
                title: "Avatar uploaded!",
                description: "Your profile picture has been updated.",
            });
        } catch (error: any) {
            toast({
                title: "Upload failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const toggleGenre = (id: string) => {
        if (selectedGenres.includes(id)) {
            setSelectedGenres(selectedGenres.filter(g => g !== id));
        } else {
            setSelectedGenres([...selectedGenres, id]);
        }
    };

    const handleComplete = async () => {
        if (selectedGenres.length < 3) {
            toast({
                title: "Select more genres",
                description: "Please choose at least 3 genres to continue.",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                username,
                phone,
                avatarUrl,
                genres: selectedGenres,
                onboardingCompleted: true,
            });

            setStep("finishing");
            setTimeout(() => navigate("/"), 2000);
        } catch (error: any) {
            toast({
                title: "Save failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background" />

            <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                    background: [
                        "radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.2) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)",
                        "radial-gradient(circle at 50% 80%, rgba(251, 191, 36, 0.2) 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.2) 0%, transparent 50%)",
                    ],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative w-full max-w-2xl z-10">
                <AnimatePresence mode="wait">
                    {step === "welcome" && (
                        <motion.div
                            key="welcome"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.1, y: -20 }}
                            className="glass-noire rounded-3xl border border-border/30 p-8 md:p-12 text-center"
                        >
                            <div className="flex justify-center mb-8">
                                <NoireLogo size={64} showText={true} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                                Welcome to <span className="text-gradient-gold">NOIRE</span>
                            </h1>
                            <p className="text-lg text-muted-foreground font-body mb-8 max-w-md mx-auto">
                                Your account is verified. Let's customize your experience to match your soul's rhythm.
                            </p>
                            <button
                                onClick={handleNext}
                                className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-body font-bold text-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                            >
                                Let's Go
                            </button>
                        </motion.div>
                    )}

                    {step === "info" && (
                        <motion.div
                            key="info"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="glass-noire rounded-3xl border border-border/30 p-8 md:p-10"
                        >
                            <h2 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
                                <Info className="text-primary w-8 h-8" />
                                Complete Your Profile
                            </h2>
                            <p className="text-muted-foreground mb-8">Tell us a bit more about yourself.</p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter username"
                                            className="w-full pl-12 pr-4 py-4 bg-muted/20 border border-border/30 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full pl-12 pr-4 py-4 bg-muted/20 border border-border/30 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            className="w-full pl-12 pr-4 py-4 bg-muted/10 border border-border/30 rounded-2xl text-muted-foreground cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={!username || !phone}
                                    className="group flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-body font-bold disabled:opacity-50 transition-all"
                                >
                                    Continue
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === "avatar" && (
                        <motion.div
                            key="avatar"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="glass-noire rounded-3xl border border-border/30 p-8 md:p-10 text-center"
                        >
                            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Profile Picture</h2>
                            <p className="text-muted-foreground mb-10">Show the world who's listening.</p>

                            <div className="relative inline-block mb-10 group">
                                <div className="w-40 h-40 rounded-full border-4 border-primary/30 overflow-hidden bg-muted/50 p-1">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-20 h-20 text-muted-foreground" />
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-full">
                                            <motion.div
                                                className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 p-3 bg-primary text-primary-foreground rounded-full shadow-lg group-hover:scale-110 transition-transform"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>

                            <div className="flex flex-col gap-4 max-w-xs mx-auto">
                                <button
                                    onClick={handleNext}
                                    className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-body font-bold"
                                >
                                    {avatarUrl ? "Looks Great!" : "Skip for now"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === "genres" && (
                        <motion.div
                            key="genres"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-noire rounded-3xl border border-border/30 p-8 md:p-10"
                        >
                            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Pick Your Vibe</h2>
                            <p className="text-muted-foreground mb-8">Select at least 3 genres you love.</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                                {genres.map((genre) => {
                                    const isSelected = selectedGenres.includes(genre.id);
                                    return (
                                        <motion.button
                                            key={genre.id}
                                            onClick={() => toggleGenre(genre.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`relative flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300 ${isSelected
                                                    ? "bg-primary/20 border-primary shadow-lg shadow-primary/10"
                                                    : "bg-muted/10 border-border/20 hover:border-primary/50"
                                                }`}
                                        >
                                            <div className={`p-4 rounded-2xl ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                <genre.icon className="w-6 h-6" />
                                            </div>
                                            <span className={`font-body font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                {genre.label}
                                            </span>
                                            {isSelected && (
                                                <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center p-1">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-body text-muted-foreground">
                                    {selectedGenres.length} / 3 Selected
                                </span>
                                <button
                                    onClick={handleComplete}
                                    disabled={selectedGenres.length < 3 || saving}
                                    className="relative px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-body font-bold disabled:opacity-50 overflow-hidden"
                                >
                                    {saving ? (
                                        <motion.div
                                            className="w-6 h-6 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full mx-auto"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        />
                                    ) : (
                                        "Complete Journey"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === "finishing" && (
                        <motion.div
                            key="finishing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="inline-block p-4 mb-8"
                            >
                                <Sparkles className="w-16 h-16 text-primary shadow-glow" />
                            </motion.div>
                            <h2 className="text-4xl font-display font-bold text-foreground mb-4">You're All Set!</h2>
                            <p className="text-lg text-muted-foreground max-w-sm mx-auto">
                                Setting up your personalized dashboard. Get ready to lose yourself in the music.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Onboarding;
