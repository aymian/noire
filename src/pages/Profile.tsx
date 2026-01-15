import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Mail, Phone, Calendar, Music, Heart,
    MapPin, Edit3, Share2, Shield, Settings,
    ArrowLeft, CheckCircle, Sparkles, Headphones
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "@/components/noire/Navbar";
import FloatingSidebar from "@/components/noire/FloatingSidebar";

/**
 * PRO Profile Page - Immersive, Cinematic, Unique
 */

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [firebaseUser, setFirebaseUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setFirebaseUser(user);
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
                setLoading(false);
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                />
            </div>
        );
    }

    const stats = [
        { label: "Listening Time", value: "128h", icon: Headphones },
        { label: "Mood Playlists", value: "12", icon: Music },
        { label: "Saved Songs", value: "842", icon: Heart },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden content-shift">
            {firebaseUser && <FloatingSidebar />}
            <Navbar />

            {/* Hero Header Section */}
            <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
                {/* Cinematic Background Blur */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/80 to-background" />
                    <motion.div
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.3 }}
                        transition={{ duration: 1.5 }}
                        className="w-full h-full"
                        style={{
                            backgroundImage: `url(${userData?.avatarUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(60px)'
                        }}
                    />
                </div>

                <div className="relative z-10 container mx-auto px-6 pt-20">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                        {/* Profile Avatar with Unique Glow */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative group"
                        >
                            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative w-32 h-32 md:w-44 md:h-44 bg-muted/50 rounded-3xl overflow-hidden border border-border/30 backdrop-blur-md">
                                {userData?.avatarUrl ? (
                                    <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/20 text-primary">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute bottom-2 right-2 p-2.5 bg-primary text-primary-foreground rounded-xl shadow-xl z-20"
                            >
                                <Edit3 size={18} />
                            </motion.button>
                        </motion.div>

                        {/* User Info Branding */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-center md:text-left flex-1"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                                <h1 className="text-4xl md:text-5xl font-display font-bold">
                                    {userData?.fullName || "Aura Listener"}
                                </h1>
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/20 uppercase tracking-widest flex items-center gap-1">
                                        <Sparkles size={10} />
                                        PRO MEMBER
                                    </span>
                                    <CheckCircle size={18} className="text-blue-500" />
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground font-body">
                                <p className="flex items-center gap-1.5"><User size={14} className="text-primary" /> @{userData?.username || "aura"}</p>
                                <p className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> Earth, Milky Way</p>
                                <p className="flex items-center gap-1.5 text-primary/80"><Calendar size={14} /> Joined {new Date(userData?.createdAt?.seconds * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex gap-3"
                        >
                            <button className="flex items-center gap-2 px-6 py-3 glass-noire border border-border/30 rounded-2xl hover:bg-muted/30 transition-all font-body">
                                <Share2 size={18} />
                                Share
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:shadow-lg hover:shadow-primary/20 transition-all font-body font-bold">
                                <Settings size={18} />
                                Manage
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Main Profile Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-12 gap-10">

                    {/* Sidebar / Info Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass-noire rounded-3xl border border-border/30 p-8"
                        >
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Experience Stats</h3>
                            <div className="grid gap-6">
                                {stats.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 group-hover:scale-110 transition-transform text-primary">
                                            <stat.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-display font-bold leading-none">{stat.value}</p>
                                            <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Favorite Genres Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="glass-noire rounded-3xl border border-border/30 p-8"
                        >
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Your Vibe Palette</h3>
                            <div className="flex flex-wrap gap-3">
                                {userData?.genres?.map((genre: string) => (
                                    <span key={genre} className="px-4 py-2 bg-muted/20 border border-border/20 rounded-xl text-xs font-body capitalize hover:border-primary/50 transition-colors cursor-default">
                                        {genre}
                                    </span>
                                )) || <p className="text-sm text-muted-foreground italic">No genres selected</p>}
                            </div>
                        </motion.div>

                        {/* Security Note */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-3xl flex items-start gap-4"
                        >
                            <Shield className="text-green-500 w-10 h-10 mt-1" />
                            <div>
                                <p className="font-bold text-sm mb-1 text-green-500">Secured Profile</p>
                                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                                    Your identity is protected with end-to-end encryption. Only choosing what you share keeps your vibe yours.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Activity / Feed Area */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Recent Listening Component Placeholder */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-display font-bold">Recent Vibrations</h3>
                                <button className="text-sm text-primary hover:underline font-body">View History</button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className="flex items-center gap-4 p-4 glass-noire border border-border/30 rounded-2xl group transition-all"
                                    >
                                        <div className="w-16 h-16 bg-muted/50 rounded-xl overflow-hidden relative border border-border/20">
                                            <div className="absolute inset-0 bg-primary/10 group-hover:opacity-0 transition-opacity" />
                                            <Music className="w-full h-full p-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm truncate">Atmospheric Wave #{i}</p>
                                            <p className="text-xs text-muted-foreground">Original Soundtrack</p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-glow-sm"
                                        >
                                            <Music size={16} />
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Mood Board Placeholder */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 blur opacity-10 rounded-[34px]"></div>
                            <div className="relative glass-noire rounded-[32px] border border-border/30 p-10 overflow-hidden">
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[100px]" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs">
                                            <Sparkles size={14} />
                                            AI Insight
                                        </div>
                                        <h3 className="text-3xl font-display font-bold">Your Soul Sound</h3>
                                        <p className="text-muted-foreground font-body leading-relaxed">
                                            Based on your recent journey, you gravitate towards <span className="text-primary font-bold italic">Cinematic Amapiano</span>.
                                            This rhythm reflects a balance between energy and introspection.
                                        </p>
                                        <button className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold font-body">
                                            Generate New Mix
                                        </button>
                                    </div>
                                    <div className="w-full md:w-1/2 grid grid-cols-2 gap-3 rotate-3 group-hover:rotate-0 transition-transform duration-700">
                                        {[1, 2, 3, 4].map(j => (
                                            <div key={j} className="aspect-square bg-muted/30 rounded-2xl border border-border/20 shadow-xl overflow-hidden">
                                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 animate-pulse" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer Space */}
            <div className="h-32" />
        </div>
    );
};

export default Profile;
