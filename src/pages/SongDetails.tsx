import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, SkipForward, SkipBack,
    Heart, Share2, Volume2, ArrowLeft,
    MoreHorizontal, Music2, Waves, Zap,
    Sparkles, Mic2, Disc, Command,
    Layers, Infinity as InfinityIcon
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { usePlayer } from "@/contexts/PlayerContext";

const SongDetails = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {
        playSong, isPlaying, setIsPlaying,
        progress, currentTime, duration, seek,
        queue, currentIndex
    } = usePlayer();

    const [song, setSong] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    const currentSong = queue[currentIndex];
    const isThisSongPlaying = currentSong?.id === song?.id;
    const audioId = searchParams.get("id");

    useEffect(() => {
        if (audioId) {
            fetchSongDetail(audioId);
        } else {
            const title = searchParams.get("title");
            const artist = searchParams.get("artist");
            const url = searchParams.get("url");
            const mood = searchParams.get("mood");

            if (title && artist && url) {
                setSong({ title, artist, audioUrl: url, mood });
                setLoading(false);
            }
        }
    }, [audioId]);

    const fetchSongDetail = async (id: string) => {
        setLoading(true);
        try {
            const songDoc = await getDoc(doc(db, "songs", id));
            if (songDoc.exists()) {
                setSong({ id: songDoc.id, ...songDoc.data() });
            }
        } catch (error) {
            console.error("Error fetching song detail:", error);
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = () => {
        if (!isThisSongPlaying && song) {
            playSong([song], 0);
            return;
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isThisSongPlaying && duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            seek(percentage * duration);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-t-2 border-primary rounded-full shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#020202] text-white overflow-hidden flex items-center justify-center p-4 md:p-12 selection:bg-primary selection:text-black">
            {/* AMBIENT CINEMATIC BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05),transparent_70%)]" />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[140px] rounded-full ${song?.mood === 'sad' ? 'bg-blue-600/30' :
                        song?.mood === 'happy' ? 'bg-amber-400/20' :
                            'bg-primary/20'
                        }`}
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            {/* THE CENTRAL IMMERSIVE CONSOLE */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-[500px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[64px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            >
                {/* Header Actions */}
                <div className="absolute top-5 left-8 right-8 flex items-center justify-between z-20">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all backdrop-blur-md"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div className="flex gap-2.5">
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all backdrop-blur-md">
                            <Share2 size={14} />
                        </button>
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all backdrop-blur-md">
                            <MoreHorizontal size={14} />
                        </button>
                    </div>
                </div>

                {/* Content Container */}
                <div className="flex flex-col items-center">
                    {/* Visualizer Section */}
                    <div className="w-full pt-10 pb-6 flex items-center justify-center relative bg-gradient-to-b from-white/[0.02] to-transparent">
                        <div className="relative group">
                            {/* Pulse Rings */}
                            <AnimatePresence>
                                {isPlaying && [1].map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0.8, opacity: 0.5 }}
                                        animate={{ scale: 1.3, opacity: 0 }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute inset-0 border border-primary/20 rounded-full"
                                    />
                                ))}
                            </AnimatePresence>

                            {/* Main Disc */}
                            <motion.div
                                animate={{ rotate: isPlaying ? 360 : 0 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="relative w-36 h-36 md:w-40 md:h-40 rounded-full p-1.5 border border-white/10 shadow-2xl bg-[#0a0a0a]"
                            >
                                <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_4px)]" />
                                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
                                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg relative z-10 p-2.5">
                                        <Disc size={24} className="text-black/80" />
                                    </div>
                                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5 -translate-x-1/2" />
                                    <div className="absolute left-0 right-0 top-1/2 h-px bg-white/5 -translate-y-1/2" />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="w-full px-12 text-center space-y-0.5 pb-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-1.5"
                        >
                            <Sparkles size={10} className="text-primary" />
                            <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">{song?.mood || "Atmosphere"}</span>
                        </motion.div>
                        <h1 className="text-2xl font-display font-medium text-white tracking-tight leading-tight">
                            {song?.title || "Noire Vibration"}
                        </h1>
                        <p className="text-white/40 font-body font-medium uppercase tracking-[0.3em] text-[8px] pt-0.5">
                            {song?.artist || "The Architect"}
                        </p>
                    </div>

                    {/* Interaction Hub */}
                    <div className="w-full px-10 space-y-6 pb-6">
                        {/* Luxury Slider */}
                        <div className="space-y-2.5">
                            <div
                                className="relative h-1 w-full bg-white/5 rounded-full cursor-pointer group"
                                onClick={handleProgressChange}
                            >
                                <motion.div
                                    className="absolute h-full bg-primary rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform shadow-lg" />
                            </div>
                            <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase tracking-widest font-body">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Deck Control */}
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className={`p-3.5 rounded-[20px] transition-all duration-300 ${isLiked ? 'bg-primary/20 text-primary shadow-glow-gold' : 'bg-white/5 text-white/20 hover:text-white'}`}
                            >
                                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                            </button>

                            <div className="flex items-center gap-5">
                                <button className="p-1.5 text-white/40 hover:text-white transition-all active:scale-90">
                                    <SkipBack size={20} />
                                </button>
                                <button
                                    onClick={togglePlay}
                                    className="w-16 h-16 bg-white text-black rounded-[28px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                                >
                                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
                                </button>
                                <button className="p-1.5 text-white/40 hover:text-white transition-all active:scale-90">
                                    <SkipForward size={20} />
                                </button>
                            </div>

                            <button className="p-3.5 rounded-[20px] bg-white/5 text-white/20 hover:text-white transition-all">
                                <Waves size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="bg-white/2 border-t border-white/5 p-4 flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Mic2 size={10} className="text-white/40" />
                            <span className="text-[6px] font-bold text-white/40 uppercase tracking-widest">Hi-Fi</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <InfinityIcon size={10} className="text-primary" />
                            <span className="text-[6px] font-bold text-white/40 uppercase tracking-widest">Lossless</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        <span className="text-[6px] font-bold text-white/20 uppercase tracking-widest">Live Sync</span>
                    </div>
                </div>
            </motion.div>

            {/* FLOATING PROTOCOL DECORATION */}
            <div className="absolute bottom-12 left-12 md:flex flex-col gap-1 hidden opacity-10">
                <div className="text-[10px] font-bold tracking-[0.5em] text-white">NOIRE PROTOCOL</div>
                <div className="text-[8px] font-bold tracking-[0.3em] text-primary uppercase">v2.0.4.8_SOLACE</div>
            </div>
        </div>
    );
};

export default SongDetails;
