import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Library as LibraryIcon, Heart, ListMusic, User,
    Search, Filter, Plus, Play, MoreVertical,
    Clock, Music2, Grid, List
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import Navbar from "@/components/noire/Navbar";
import MobileBottomNav from "@/components/noire/MobileBottomNav";
import FloatingSidebar from "@/components/noire/FloatingSidebar";
import { usePlayer } from "@/contexts/PlayerContext";

/**
 * PRO Library Page - Cinematic, Organized, Emotional
 */

const Library = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"playlists" | "liked" | "artists">("playlists");
    const [viewType, setViewType] = useState<"grid" | "list">("grid");
    const [likedSongs, setLikedSongs] = useState<any[]>([]);
    const { playSong } = usePlayer();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchLikedSongs(currentUser.uid);
            } else {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchLikedSongs = async (uid: string) => {
        try {
            const likedRef = collection(db, "users", uid, "liked_songs");
            const q = query(likedRef, orderBy("likedAt", "desc"));
            const snapshot = await getDocs(q);
            const songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLikedSongs(songs);
        } catch (error) {
            console.error("Error fetching liked songs:", error);
        } finally {
            setLoading(false);
        }
    };

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

    const tabs = [
        { id: "playlists", label: "Playlists", icon: ListMusic },
        { id: "liked", label: "Liked Songs", icon: Heart },
        { id: "artists", label: "Artists", icon: User },
    ];

    const playlists = [
        { id: 1, name: "Midnight Vibe", tracks: 24, color: "from-purple-500/20", type: "Personal" },
        { id: 2, name: "Afro-Soul Fusion", tracks: 15, color: "from-amber-500/20", type: "Mood" },
        { id: 3, name: "Amapiano Heat", tracks: 42, color: "from-red-500/20", type: "Genre" },
        { id: 4, name: "Focus & Flow", tracks: 12, color: "from-blue-500/20", type: "Personal" },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-24 content-shift">
            {user && <FloatingSidebar />}
            <Navbar />

            {/* Header Section */}
            <header className="pt-32 pb-12 container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div>
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <LibraryIcon size={24} />
                            <span className="text-sm font-bold uppercase tracking-[0.2em]">Your Sanctuary</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold">Library</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold font-body hover:shadow-lg hover:shadow-primary/20 transition-all">
                            <Plus size={20} />
                            New Playlist
                        </button>
                    </div>
                </motion.div>
            </header>

            {/* Navigation & Filters */}
            <section className="sticky top-20 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 py-4">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex bg-muted/20 p-1 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-body transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow-lg"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search sanctuary..."
                                className="w-full pl-11 pr-4 py-2.5 bg-muted/20 border border-white/5 rounded-xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setViewType("grid")}
                                className={`p-2 rounded-lg transition-all ${viewType === "grid" ? "bg-muted text-primary" : "text-muted-foreground"}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewType("list")}
                                className={`p-2 rounded-lg transition-all ${viewType === "list" ? "bg-muted text-primary" : "text-muted-foreground"}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="container mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    {activeTab === "playlists" && (
                        <motion.div
                            key="playlists"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={viewType === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-3"}
                        >
                            {playlists.map((playlist) => (
                                <motion.div
                                    key={playlist.id}
                                    whileHover={{ y: -5 }}
                                    className={`group relative overflow-hidden glass-noire border border-white/10 rounded-[32px] p-6 transition-all duration-500 hover:border-primary/50 ${viewType === "list" ? "flex items-center gap-4 p-4" : ""}`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${playlist.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    {/* Playlist Cover Art Placeholder */}
                                    <div className={`relative aspect-square rounded-2xl overflow-hidden bg-muted/50 mb-4 border border-white/5 ${viewType === 'list' ? 'w-16 h-16 mb-0' : 'w-full'}`}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Music2 className="text-muted-foreground/30 w-12 h-12" />
                                        </div>
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                                        >
                                            <button className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl">
                                                <Play size={20} fill="currentColor" />
                                            </button>
                                        </motion.div>
                                    </div>

                                    <div className="relative flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">{playlist.type}</p>
                                                <h3 className="text-xl font-display font-bold mb-1 truncate group-hover:text-primary transition-colors">{playlist.name}</h3>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-body">
                                                    <Clock size={12} /> {playlist.tracks} tracks
                                                </p>
                                            </div>
                                            <button className="p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Empty State / Add New Card */}
                            {viewType === "grid" && (
                                <button className="group h-full min-h-[280px] border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all bg-muted/5">
                                    <div className="w-16 h-16 rounded-3xl bg-muted/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all text-muted-foreground group-hover:text-primary">
                                        <Plus size={32} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-display font-bold text-lg">Create Vibe</p>
                                        <p className="text-xs text-muted-foreground font-body">Add a new playlist</p>
                                    </div>
                                </button>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "liked" && (
                        <motion.div
                            key="liked"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-noire rounded-[40px] border border-white/5 overflow-hidden"
                        >
                            <div className="p-10 bg-gradient-to-br from-primary/10 to-transparent flex flex-col md:flex-row items-center gap-8 border-b border-white/5">
                                <div className="w-48 h-48 bg-gradient-to-br from-primary to-purple-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3 group overflow-hidden">
                                    <Heart size={80} className="text-white fill-white/20 animate-pulse" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Liked Songs</h2>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground font-body">
                                        <span className="flex items-center gap-2"><User size={16} /> @{user?.displayName || "You"}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <span>{likedSongs.length} songs</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <span className="text-primary font-bold">Infinite Aura</span>
                                    </div>
                                    {likedSongs.length > 0 && (
                                        <button
                                            onClick={() => playSong(likedSongs, 0)}
                                            className="mt-8 px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold font-body shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3"
                                        >
                                            <Play size={20} fill="currentColor" />
                                            Play Collection
                                        </button>
                                    )}
                                </div>
                            </div>

                            {likedSongs.length > 0 ? (
                                <div className="p-6 md:p-10">
                                    <div className="space-y-2">
                                        {likedSongs.map((song, idx) => (
                                            <motion.div
                                                key={song.id}
                                                whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.03)" }}
                                                onClick={() => playSong(likedSongs, idx)}
                                                className="group flex items-center justify-between p-4 rounded-2xl cursor-pointer border border-transparent hover:border-white/5 transition-all"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <span className="text-xs font-bold text-white/20 group-hover:text-primary transition-colors w-4 underline decoration-primary/0 group-hover:decoration-primary/50">{idx + 1}</span>
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/5">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                                                            <Music2 size={24} className="text-white/20 group-hover:scale-110 transition-transform" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold font-display group-hover:text-primary transition-colors">{song.title}</h4>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{song.artist}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <span className="hidden md:block text-[10px] font-bold text-white/20 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{song.mood}</span>
                                                    <Heart size={16} className="text-primary fill-primary" />
                                                    <button className="p-2 text-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-10 text-center py-32">
                                    <div className="max-w-xs mx-auto space-y-4">
                                        <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Heart size={32} className="text-muted-foreground" />
                                        </div>
                                        <p className="font-display font-bold text-xl">No heartbeats yet</p>
                                        <p className="text-sm text-muted-foreground font-body leading-relaxed">
                                            Songs you like will appear here. Start discovering music that resonates with your mood.
                                        </p>
                                        <button onClick={() => navigate("/")} className="text-primary font-bold hover:underline">Start Exploring</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "artists" && (
                        <motion.div
                            key="artists"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8"
                        >
                            {[1, 2].map(i => (
                                <div key={i} className="text-center group">
                                    <div className="relative aspect-square rounded-full overflow-hidden bg-muted/50 mb-4 border border-white/10 group-hover:border-primary/50 transition-all p-1">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
                                            <User size={48} className="text-muted-foreground/30" />
                                        </div>
                                    </div>
                                    <h4 className="font-display font-bold truncate">Discover Artist</h4>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Follow</p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <MobileBottomNav />
        </div>
    );
};

export default Library;
