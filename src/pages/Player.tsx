import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, SkipForward, SkipBack,
    Heart, Share2, ListMusic, Volume2,
    X, Maximize2, Repeat, Shuffle,
    Waves, ArrowLeft, MoreHorizontal, Music2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const Player = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [song, setSong] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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

    useEffect(() => {
        if (song?.audioUrl && audioRef.current) {
            audioRef.current.src = song.audioUrl;
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed:", e));
            }
        }
    }, [song]);

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
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            const progressPercent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(progressPercent || 0);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current && duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            audioRef.current.currentTime = percentage * duration;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-3xl z-50 flex items-center justify-center p-4">
            {/* Animated Dynamic Glow */}
            <div className={`absolute inset-0 z-0 transition-colors duration-1000 ${song?.mood === 'sad' ? 'bg-blue-900/20' :
                    song?.mood === 'happy' ? 'bg-amber-500/10' :
                        'bg-primary/10'
                }`} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 w-full max-w-[440px] glass-noire border border-white/10 rounded-[48px] overflow-hidden shadow-2xl"
            >
                <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                />

                {/* Player Header */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Now Playing</span>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                {/* Artwork Section */}
                <div className="px-8 py-6">
                    <div className="relative aspect-square w-full rounded-[40px] overflow-hidden group">
                        {/* Artwork Reveal Animation */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-purple-500/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: isPlaying ? 360 : 0 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="w-48 h-48 rounded-full border border-white/5 flex items-center justify-center bg-black/40 shadow-inner"
                                style={{ backgroundImage: 'repeating-radial-gradient(circle, transparent 0 5%, rgba(255,255,255,0.03) 5% 5.2%)' }}
                            >
                                <Music2 size={64} className="text-primary/30" />
                            </motion.div>
                        </div>

                        {/* Mood Badge */}
                        <div className="absolute bottom-6 left-6">
                            <div className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-2">
                                <Waves size={14} className="text-primary animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{song?.mood || 'Vibe'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Track Info */}
                <div className="px-8 text-center mb-8">
                    <motion.h2
                        key={song?.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-display font-bold text-white mb-2 truncate px-4"
                    >
                        {song?.title}
                    </motion.h2>
                    <p className="text-white/40 font-medium tracking-widest text-xs uppercase">{song?.artist}</p>
                </div>

                {/* Controls Area */}
                <div className="px-10 pb-12 space-y-8">
                    {/* Scrub Bar */}
                    <div className="space-y-3">
                        <div
                            className="relative h-1.5 w-full bg-white/5 rounded-full cursor-pointer group"
                            onClick={handleProgressChange}
                        >
                            <motion.div
                                className="absolute h-full bg-primary rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                            <motion.div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ left: `${progress}%`, marginLeft: '-8px' }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Main Actions */}
                    <div className="flex items-center justify-between">
                        <button className="text-white/20 hover:text-white transition-colors">
                            <Shuffle size={18} />
                        </button>

                        <div className="flex items-center gap-6">
                            <button className="text-white/60 hover:text-white active:scale-90 transition-all">
                                <SkipBack size={24} />
                            </button>

                            <button
                                onClick={togglePlay}
                                className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>

                            <button className="text-white/60 hover:text-white active:scale-90 transition-all">
                                <SkipForward size={24} />
                            </button>
                        </div>

                        <button className="text-white/20 hover:text-white transition-colors">
                            <Repeat size={18} />
                        </button>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={`${isLiked ? 'text-primary' : 'text-white/20'} hover:text-primary transition-colors`}
                        >
                            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                        <div className="flex items-center gap-3">
                            <Volume2 size={16} className="text-white/20" />
                            <div className="w-16 h-1 bg-white/5 rounded-full">
                                <div className="w-2/3 h-full bg-white/20 rounded-full" />
                            </div>
                        </div>
                        <button className="text-white/20 hover:text-white transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Player;
