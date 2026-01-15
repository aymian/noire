import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShieldCheck, Users, Music, Activity,
    TrendingUp, Settings, LogOut, Search,
    Plus, MoreVertical, BarChart3, Database,
    Lock, KeyRound, AlertCircle,
    Sparkles
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, query, limit, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Navbar from "@/components/noire/Navbar";
import { useToast } from "@/hooks/use-toast";
import {
    Trash2, Mail, UserCog, CheckCircle2,
    XCircle, Clock, CreditCard
} from "lucide-react";

/**
 * NOIRE Admin Dashboard - Exclusive Command Center
 */

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginStep, setLoginStep] = useState<"username" | "password">("username");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ users: 0, songs: 124, active: 42 });
    const [users, setUsers] = useState<any[]>([]);
    const [fetchingUsers, setFetchingUsers] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingUser, setEditingUser] = useState<any>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const fetchStats = async () => {
        try {
            const usersRef = collection(db, "users");
            const songsRef = collection(db, "songs");
            const [usersSnap, songsSnap] = await Promise.all([
                getDocs(usersRef),
                getDocs(songsRef)
            ]);

            setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setStats(prev => ({
                ...prev,
                users: usersSnap.size,
                songs: songsSnap.size
            }));
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setFetchingUsers(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            setFetchingUsers(true);
            fetchStats();
        }
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginStep === "username") {
            if (username === "yves2008") {
                setLoginStep("password");
                setError("");
            } else {
                setError("Unauthorized access point.");
            }
        } else {
            if (password === "azert") {
                setLoading(true);
                setTimeout(() => {
                    setIsAuthenticated(true);
                    setLoading(false);
                    // Save admin status to localStorage for persistence
                    localStorage.setItem("noire_admin_access", "true");
                    toast({
                        title: "Access Granted",
                        description: "Welcome back, Admin Yves.",
                    });
                }, 1500);
            } else {
                setError("Invalid secure key.");
            }
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to erase this user from the system?")) return;

        try {
            await deleteDoc(doc(db, "users", userId));
            setUsers(prev => prev.filter(u => u.id !== userId));
            toast({ title: "User Erased", description: "The profile has been wiped from Noire." });
        } catch (err) {
            toast({ title: "Wipe Failed", description: "Database error.", variant: "destructive" });
        }
    };

    const updateUserPlan = async (userId: string, newPlan: string) => {
        try {
            await updateDoc(doc(db, "users", userId), { plan: newPlan });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
            toast({ title: "Plan Updated", description: `User is now on ${newPlan}` });
        } catch (err) {
            toast({ title: "Update Failed", description: "Database error.", variant: "destructive" });
        }
    };

    const handleResetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            toast({ title: "Reset Sent", description: "A secure reset link has been dispatched." });
        } catch (err) {
            toast({ title: "Error", description: "Could not send reset email.", variant: "destructive" });
        }
    };

    useEffect(() => {
        const persisted = localStorage.getItem("noire_admin_access");
        if (persisted === "true") setIsAuthenticated(true);
    }, []);

    const filteredUsers = users.filter(u =>
        (u.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-noire-hero overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/20 blur-[150px] rounded-full animate-pulse-slow" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="glass-noire border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/30 rotate-12 group-hover:rotate-0 transition-transform">
                                <ShieldCheck size={40} className="text-primary" />
                            </div>
                            <h1 className="text-3xl font-display font-bold">Admin Portal</h1>
                            <p className="text-muted-foreground font-body text-sm mt-2">Internal Command Center Access</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {loginStep === "username" ? (
                                    <motion.div
                                        key="user"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Identity</label>
                                            <div className="relative">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    placeholder="Admin Username"
                                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="pass"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Secure Key</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-xs flex items-center gap-2 px-1"
                                >
                                    <AlertCircle size={14} />
                                    {error}
                                </motion.p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold font-body hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                            >
                                {loading ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                        <Database size={20} />
                                    </motion.div>
                                ) : (
                                    <>
                                        <span>{loginStep === "username" ? "Next Step" : "Authorize Access"}</span>
                                        <KeyRound size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar adminMode={true} />

            <main className="container mx-auto px-6 pt-32 pb-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <ShieldCheck size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Command Center</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold">Admin <span className="text-gradient-gold">Deck</span></h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                            <Settings size={20} className="text-muted-foreground" />
                            <span className="text-sm font-bold font-body">System Config</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsAuthenticated(false);
                                localStorage.removeItem("noire_admin_access");
                            }}
                            className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {[
                        { label: "Total Listeners", val: stats.users.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "Track Count", val: stats.songs.toString(), icon: Music, color: "text-primary", bg: "bg-primary/10" },
                        { label: "System Uptime", val: "99.9%", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" }
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-noire border border-white/5 rounded-[32px] p-8"
                        >
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold mb-1">{stat.label}</p>
                            <h3 className="text-4xl font-display font-bold">{stat.val}</h3>
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-500 font-bold bg-emerald-500/5 px-2 py-1 rounded-full w-fit">
                                <TrendingUp size={12} />
                                +12.5% this month
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Action Center */}
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-noire border border-white/5 rounded-[40px] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-display font-bold">User Management</h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search auras..."
                                    className="pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {fetchingUsers ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                        <Database className="text-primary w-8 h-8 opacity-50" />
                                    </motion.div>
                                    <p className="text-xs text-muted-foreground animate-pulse">Syncing user database...</p>
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <div key={user.id} className="p-6 rounded-[32px] bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.username} className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-primary">
                                                            {(user.username?.[0] || user.email?.[0] || "?").toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${user.onboardingCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold font-body text-base text-foreground flex items-center gap-2">
                                                        {user.username || "Anonymous"}
                                                        {user.plan !== "free" && <Sparkles size={14} className="text-primary" />}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground font-body">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleResetPassword(user.email)}
                                                    className="p-2.5 bg-white/5 rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 transition-all border border-white/10"
                                                    title="Send Password Reset"
                                                >
                                                    <KeyRound size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2.5 bg-red-500/10 rounded-xl text-red-500 hover:text-white hover:bg-red-500 transition-all border border-red-500/10"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                                    <CreditCard size={10} /> Plan
                                                </p>
                                                <select
                                                    value={user.plan || "free"}
                                                    onChange={(e) => updateUserPlan(user.id, e.target.value)}
                                                    className="w-full bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
                                                >
                                                    <option className="bg-black" value="free">FREE</option>
                                                    <option className="bg-black" value="mini">MINI</option>
                                                    <option className="bg-black" value="basic">BASIC</option>
                                                    <option className="bg-black" value="pro">PRO</option>
                                                    <option className="bg-black" value="premium">PREMIUM</option>
                                                    <option className="bg-black" value="elite">ELITE</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                                    <Activity size={10} /> Status
                                                </p>
                                                <p className="text-xs font-medium text-white">{user.onboardingCompleted ? "Active" : "Onboarding"}</p>
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock size={10} /> Joined
                                                </p>
                                                <p className="text-xs font-medium text-white/60">
                                                    {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : "Historical"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-24">
                                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
                                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">No matches found</p>
                                </div>
                            )}
                        </div>

                        <button className="w-full mt-8 py-4 border border-white/10 rounded-2xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                            View All User Profiles
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div className="glass-noire border border-white/5 rounded-[40px] p-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary opacity-5 group-hover:opacity-10 transition-opacity" />
                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/40 text-primary-foreground transform group-hover:scale-110 transition-transform">
                                    <Plus size={32} />
                                </div>
                                <h3 className="text-xl font-display font-bold mb-2">Deploy Music</h3>
                                <p className="text-xs text-muted-foreground font-body mb-6">Upload or curate new emotional tracks for the platform.</p>
                                <button
                                    onClick={() => navigate("/admin/music")}
                                    className="w-full py-4 bg-white text-black rounded-2xl font-bold text-xs hover:bg-primary hover:text-white transition-all shadow-xl"
                                >
                                    Access Music Studio
                                </button>
                            </div>
                        </div>

                        <div className="glass-noire border border-white/5 rounded-[32px] p-6">
                            <h4 className="text-sm font-display font-bold mb-4 flex items-center gap-2">
                                <BarChart3 size={16} className="text-primary" />
                                Platform Health
                            </h4>
                            <div className="space-y-4">
                                {[
                                    { label: "Auth Flow", status: "Operational", color: "text-emerald-500" },
                                    { label: "Supabase St.", status: "Active", color: "text-primary" },
                                    { label: "CDN Latency", status: "14ms", color: "text-emerald-500" }
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-xs text-muted-foreground font-body">{item.label}</span>
                                        <span className={`text-[10px] font-bold ${item.color}`}>{item.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Admin;
