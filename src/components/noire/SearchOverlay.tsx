import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Music2, User, Mic2, Play, ArrowRight, History, Zap, Command, Sparkles, TrendingUp } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

interface Song {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    mood: string;
}

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onPlaySong: (song: Song) => void;
}

const SearchOverlay = ({ isOpen, onClose, onPlaySong }: SearchOverlayProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem("noire_recent_searches");
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") setSelectedIndex(prev => Math.min(prev + 1, results.length + recentSearches.length - 1));
            if (e.key === "ArrowUp") setSelectedIndex(prev => Math.max(prev - 1, 0));
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, results.length, recentSearches.length]);

    useEffect(() => {
        const searchSongs = async () => {
            if (searchTerm.trim().length === 0) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                // We'll perform a simple prefix-like search using Firestore
                // Note: Firestore doesn't support true full-text search without 3rd party
                // But we can approximate for small datasets
                const songsRef = collection(db, "songs");

                // Search by title (case sensitive in firestore, but we'll try to match)
                const q = query(
                    songsRef,
                    limit(10)
                );

                const snapshot = await getDocs(q);
                const allSongs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));

                // Manual filtering for better UX (since firestore is limited)
                const filtered = allSongs.filter(song =>
                    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    song.mood.toLowerCase().includes(searchTerm.toLowerCase())
                );

                setResults(filtered);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(searchSongs, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const addToRecent = (term: string) => {
        const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("noire_recent_searches", JSON.stringify(updated));
    };

    const handleSelect = (song: Song) => {
        addToRecent(song.title);
        onPlaySong(song);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start pt-[10vh] px-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
                    />

                    {/* Search Hud */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full max-w-2xl glass-noire border border-white/10 rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
                    >
                        {/* Search Input Area */}
                        <div className="p-8 border-b border-white/5 space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-primary/10 rounded-2xl text-primary animate-pulse">
                                    <Search size={28} />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Vibrations, artists, moods..."
                                    className="flex-1 bg-transparent border-none outline-none text-2xl font-display font-medium text-white placeholder:text-white/20"
                                />
                                <button
                                    onClick={onClose}
                                    className="p-3 hover:bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Shortcut Indicators */}
                            <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                    <Command size={10} />
                                    <span>K</span>
                                </div>
                                <span>to search</span>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                    <span>ESC</span>
                                </div>
                                <span>to close</span>
                            </div>
                        </div>

                        {/* Search Content */}
                        <div className="max-h-[60vh] overflow-y-auto no-scrollbar pb-8">
                            {searchTerm.length === 0 ? (
                                <div className="p-8 space-y-10">
                                    {/* Recent Searches */}
                                    {recentSearches.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-white/40 mb-4 px-2">
                                                <History size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Recently Vibrated</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {recentSearches.map((term, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSearchTerm(term)}
                                                        className="flex items-center justify-between p-4 px-6 rounded-3xl hover:bg-white/5 transition-all text-left group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-primary transition-colors">
                                                                <TrendingUp size={14} />
                                                            </div>
                                                            <span className="font-medium text-white/60 group-hover:text-white transition-colors">{term}</span>
                                                        </div>
                                                        <ArrowRight size={14} className="text-white/10 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Explores */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-white/40 mb-4 px-2">
                                            <Sparkles size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Quick Frequencies</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {['Afro-Soul', 'Midnight', 'Deep Focus', 'High Energy', 'Lounge'].map((mood) => (
                                                <button
                                                    key={mood}
                                                    onClick={() => setSearchTerm(mood)}
                                                    className="flex flex-col gap-3 p-6 rounded-[32px] bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group items-start text-left"
                                                >
                                                    <div className="p-2 bg-white/5 rounded-xl text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                                        <Zap size={16} />
                                                    </div>
                                                    <span className="font-bold text-sm text-white/60 group-hover:text-white transition-colors">{mood}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 space-y-2">
                                    {loading ? (
                                        <div className="p-12 flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[10px] font-bold text-primary animate-pulse tracking-widest uppercase">Tuning Frequencies...</span>
                                        </div>
                                    ) : results.length > 0 ? (
                                        results.map((song, i) => (
                                            <motion.button
                                                key={song.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => handleSelect(song)}
                                                className="w-full flex items-center justify-between p-4 px-6 rounded-[32px] hover:bg-white/5 group border border-transparent hover:border-white/5 transition-all"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20" />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Music2 className="text-primary/40 group-hover:scale-110 transition-transform" />
                                                        </div>
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                                            <Play size={20} fill="white" className="text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="text-lg font-display font-bold text-white group-hover:text-primary transition-colors">{song.title}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{song.artist}</span>
                                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                                            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{song.mood}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 pr-2">
                                                    <Mic2 size={14} className="text-white/10 group-hover:text-primary transition-colors" />
                                                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowRight size={14} className="text-white" />
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))
                                    ) : (
                                        <div className="p-20 flex flex-col items-center text-center space-y-6">
                                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                                <X size={32} />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-xl font-display font-medium text-white/80">Silent Void</h4>
                                                <p className="text-sm text-white/30 font-body max-w-[240px]">We couldn't find any vibrations matching your intent.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Search Footer */}
                        <div className="p-6 bg-white/2 border-t border-white/5 flex items-center justify-between">
                            <NoireStatus />
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                    <span className="text-[8px] font-bold text-white/40 tracking-[0.2em] uppercase">Engine Online</span>
                                </div>
                                <div className="text-[8px] font-bold text-white/20 tracking-[0.2em] uppercase">v2.0.4.8_SEARCH</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const NoireStatus = () => (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-full border border-white/5">
        <Sparkles size={10} className="text-primary animate-spin-slow" />
        <span className="text-[8px] font-bold text-white/60 tracking-[0.2em] uppercase">Noire Protocol</span>
    </div>
);

export default SearchOverlay;
