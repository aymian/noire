import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, Heart, MoreVertical,
    ChevronRight, Music2, Clock, Globe,
    Sparkles, Flame, Headphones, Lock, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { usePlayer } from "@/contexts/PlayerContext";

interface Song {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    mood: string;
}

const MusicDashboard = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [moodGroups, setMoodGroups] = useState<Record<string, Song[]>>({});
    const [loading, setLoading] = useState(true);
    const { playSong } = usePlayer();

    const [userPlan, setUserPlan] = useState<string>("free");
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserPlan(userDoc.data().plan || "free");
                }
            }
        });
        fetchInitialData();
        return () => unsubscribe();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const songsRef = collection(db, "songs");
            const q = query(songsRef, orderBy("createdAt", "desc"), limit(20));
            const snapshot = await getDocs(q);
            const allSongs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));

            setSongs(allSongs);

            const groups: Record<string, Song[]> = {};
            allSongs.forEach(song => {
                const mood = song.mood || "general";
                if (!groups[mood]) groups[mood] = [];
                groups[mood].push(song);
            });
            setMoodGroups(groups);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySong = (playlist: Song[], index: number) => {
        playSong(playlist, index);
    };

    const CategorySection = ({ title, items, icon: Icon, isLocked = false }: { title: string, items: Song[], icon: any, isLocked?: boolean }) => (
        <section className={`mb-12 relative ${isLocked ? 'opacity-40 grayscale' : ''}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Icon size={20} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white">{title}</h2>
                    {isLocked && <Lock size={16} className="text-primary ml-2" />}
                </div>
                {!isLocked && (
                    <button className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                        See All <ChevronRight size={14} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
                {items.slice(0, 5).map((song, idx) => (
                    <motion.div
                        key={song.id}
                        whileHover={!isLocked ? { y: -8 } : {}}
                        onClick={() => !isLocked && handlePlaySong(items, idx)}
                        className={`group relative glass-noire border border-white/5 rounded-[32px] p-5 transition-all duration-500 ${!isLocked ? 'hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer' : 'cursor-default'}`}
                    >
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/30 mb-4 border border-white/5">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                                <Music2 size={40} className="text-muted-foreground/20 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-bold text-white uppercase border border-white/10">
                                {song.mood}
                            </div>
                            {isLocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                    <Lock size={32} className="text-white/40" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-display font-bold text-sm truncate group-hover:text-primary transition-colors text-white">{song.title}</h3>
                            <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">{song.artist}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {isLocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8">
                    <div className="max-w-xs space-y-4">
                        <Lock size={40} className="text-primary mx-auto mb-2 animate-pulse" />
                        <h4 className="text-xl font-display font-bold text-white">Emotional Access Blocked</h4>
                        <p className="text-xs text-white/60 leading-relaxed font-body">"Feel Only" plan doesn't include full access to these frequencies.</p>
                        <button
                            onClick={() => navigate("/pricing")}
                            className="px-6 py-2 bg-primary text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                        >
                            Complete Your Aura
                        </button>
                    </div>
                </div>
            )}
        </section>
    );

    if (loading) {
        return (
            <div className="pt-32 pb-12 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Soundscape...</p>
            </div>
        );
    }

    // Filter mood groups based on plan
    // MINI: Calm & Sad only. Others: All.
    const getMoodGroups = () => {
        if (userPlan === 'mini') {
            const allowed = ['calm', 'sad'];
            return Object.entries(moodGroups).map(([mood, items]) => ({
                mood,
                items,
                isLocked: !allowed.includes(mood.toLowerCase())
            }));
        }
        if (userPlan === 'free') {
            // Free sees only 1 mood section, others are locked? 
            // Let's say free sees only the first section of moods.
            return Object.entries(moodGroups).map(([mood, items], index) => ({
                mood,
                items,
                isLocked: index > 0
            }));
        }
        return Object.entries(moodGroups).map(([mood, items]) => ({
            mood,
            items,
            isLocked: false
        }));
    };

    return (
        <div className="pt-32 pb-40 container mx-auto px-6">
            <header className="mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-10"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${userPlan !== 'free' ? 'bg-primary' : 'bg-white/20'}`} />
                                Plan: {userPlan.toUpperCase()}
                            </div>
                            {userPlan === 'free' && (
                                <button
                                    onClick={() => navigate("/pricing")}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline group"
                                >
                                    <Zap size={14} className="group-hover:scale-110 transition-transform" />
                                    Upgrade Now
                                </button>
                            )}
                        </div>
                        <h1 className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter leading-none">
                            Good <span className="text-gradient-gold">Vibrations</span>
                        </h1>
                    </div>
                </motion.div>
            </header>

            {/* Recently Deployed is always accessible for now */}
            <CategorySection title="Recently Deployed" items={songs} icon={Clock} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                <div className="glass-noire rounded-[40px] border border-white/5 p-10 relative overflow-hidden group">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
                    <div className="relative z-10">
                        <Flame className="text-primary mb-6" size={40} />
                        <h3 className="text-4xl font-display font-bold mb-3 text-white">Vibe Boosters</h3>
                        <p className="text-sm text-white/40 font-body mb-8 leading-relaxed italic">"Uplifting frequencies to elevate your state of mind."</p>
                        <button className="px-10 py-4 bg-white text-black rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-white/5">Launch Session</button>
                    </div>
                </div>
                <div className="glass-noire rounded-[40px] border border-white/5 p-10 relative overflow-hidden group">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
                    <div className="relative z-10">
                        <Headphones className="text-purple-400 mb-6" size={40} />
                        <h3 className="text-4xl font-display font-bold mb-3 text-white">Soulful Flow</h3>
                        <p className="text-sm text-white/40 font-body mb-8 leading-relaxed italic">"Deep melodies for focused reflection and clarity."</p>
                        <button className="px-10 py-4 border border-white/10 hover:bg-white/5 rounded-2xl font-bold text-sm transition-all text-white">Enter Flow</button>
                    </div>
                </div>
            </div>

            {getMoodGroups().map(({ mood, items, isLocked }) => (
                <CategorySection
                    key={mood}
                    title={`${mood.charAt(0).toUpperCase() + mood.slice(1)} Session`}
                    items={items}
                    icon={Globe}
                    isLocked={isLocked}
                />
            ))}
        </div>
    );
};

export default MusicDashboard;
