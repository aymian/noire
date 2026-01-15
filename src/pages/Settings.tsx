import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Settings as SettingsIcon, Bell, Shield,
    Volume2, Globe, CreditCard, LogOut, ChevronRight,
    Camera, Check, Info, Smartphone, Mail, Phone
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Navbar from "@/components/noire/Navbar";
import MobileBottomNav from "@/components/noire/MobileBottomNav";
import FloatingSidebar from "@/components/noire/FloatingSidebar";
import { useToast } from "@/hooks/use-toast";

/**
 * PRO Settings Page - Organized, Clean, Functional
 */

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("account");
    const navigate = useNavigate();
    const { toast } = useToast();

    // Form states
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    setFullName(data.fullName || "");
                    setUsername(data.username || "");
                    setPhone(data.phone || "");
                }
                setLoading(false);
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                fullName,
                username,
                phone
            });
            toast({
                title: "Profile Updated",
                description: "Your settings have been saved locally in the aura.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to update profile. Check your connection.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    if (loading) return null;

    const menuItems = [
        { id: "account", label: "Account Details", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Privacy & Security", icon: Shield },
        { id: "audio", label: "Audio Profile", icon: Volume2 },
        { id: "billing", label: "Subscription", icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-24 content-shift">
            {user && <FloatingSidebar />}
            <Navbar />

            <main className="container mx-auto px-6 pt-32 max-w-6xl">
                <header className="mb-12">
                    <h1 className="text-4xl font-display font-bold flex items-center gap-4">
                        <SettingsIcon className="text-primary w-10 h-10" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground font-body mt-2">Manage your NOIRE experience and account preferences.</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar Menu */}
                    <aside className="lg:w-72 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-body text-sm ${activeTab === item.id
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                                    }`}
                            >
                                <item.icon size={18} />
                                <span className="flex-1 text-left font-bold">{item.label}</span>
                                {activeTab === item.id && <ChevronRight size={14} />}
                            </button>
                        ))}

                        <div className="pt-8">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-body text-sm font-bold"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="glass-noire border border-white/5 rounded-[40px] p-8 md:p-12">
                            {activeTab === "account" && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-[32px] overflow-hidden border-2 border-primary/30 relative">
                                                {userData?.avatarUrl ? (
                                                    <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-muted flex items-center justify-center text-primary">
                                                        <User size={32} />
                                                    </div>
                                                )}
                                            </div>
                                            <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-xl shadow-xl hover:scale-110 transition-transform">
                                                <Camera size={14} />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-display font-bold">{userData?.fullName || "User Name"}</h3>
                                            <p className="text-sm text-muted-foreground font-body">Pro Plan Member since Jan 2024</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="text"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 bg-muted/20 border border-white/5 rounded-2xl font-body text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                                        placeholder="Your Name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Username</label>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">@</div>
                                                    <input
                                                        type="text"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-4 bg-muted/20 border border-white/5 rounded-2xl font-body text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                                        placeholder="username"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="email"
                                                        value={user?.email || ""}
                                                        disabled
                                                        className="w-full pl-12 pr-4 py-4 bg-muted/5 border border-white/5 rounded-2xl font-body text-sm text-muted-foreground cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Phone Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 bg-muted/20 border border-white/5 rounded-2xl font-body text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold font-body transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
                                            >
                                                {saving ? "Syncing..." : "Save Changes"}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab !== "account" && (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Info size={32} className="text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-display font-bold mb-2">Section Under Construction</h3>
                                    <p className="text-muted-foreground font-body max-w-sm mx-auto">
                                        We are currently fine-tuning these settings to provide you with a world-class experience. Stay tuned.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
};

export default Settings;
