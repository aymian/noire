import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, SkipForward, SkipBack,
    Heart, Share2, Volume2, X,
    Maximize2, Repeat, Shuffle, Waves, Music2,
    ChevronUp, ChevronDown, Zap, Lock,
    Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { usePlayer } from "@/contexts/PlayerContext";

interface Song {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    mood: string;
}

interface PlayerModalProps {
    queue: Song[];
    initialIndex: number;
    onClose: () => void;
}

const PlayerModal = ({ queue: propQueue, initialIndex, onClose }: PlayerModalProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const {
        isPlaying, setIsPlaying,
        progress, setProgress,
        currentTime, setCurrentTime,
        duration, setDuration,
        queue: globalQueue,
        currentIndex: globalIndex
    } = usePlayer();

    // Use global state if available, fallback to props (though in this design they should be the same)
    const queue = globalQueue.length > 0 ? globalQueue : propQueue;
    const [currentIndex, setCurrentIndex] = useState(globalIndex !== -1 ? globalIndex : initialIndex);
    const song = queue[currentIndex];

    const [isLiked, setIsLiked] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [userPlan, setUserPlan] = useState("free");

    // Skip Logic State
    const [skipCount, setSkipCount] = useState(() => {
        return parseInt(localStorage.getItem("noire_skips") || "0");
    });
    const [lockoutUntil, setLockoutUntil] = useState(() => {
        return parseInt(localStorage.getItem("noire_lockout_until") || "0");
    });
    const [timeLeft, setTimeLeft] = useState(0);

    const [songsPlayed, setSongsPlayed] = useState(0);
    const [isShowingAd, setIsShowingAd] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const adAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserPlan(userDoc.data().plan || "free");
                }
                // Check if currently playing song is liked
                const likedDoc = await getDoc(doc(db, "users", user.uid, "liked_songs", song.id));
                setIsLiked(likedDoc.exists());
            }
        });

        // Lockout timer
        const timer = setInterval(() => {
            const now = Date.now();
            if (lockoutUntil > 0) {
                if (now >= lockoutUntil) {
                    setLockoutUntil(0);
                    setSkipCount(0);
                    localStorage.removeItem("noire_lockout_until");
                    localStorage.setItem("noire_skips", "0");
                } else {
                    setTimeLeft(Math.ceil((lockoutUntil - now) / 1000));
                }
            }
        }, 1000);

        if (song?.audioUrl && audioRef.current) {
            audioRef.current.src = song.audioUrl;
            audioRef.current.play().catch(e => console.error("Playback failed:", e));
            setIsPlaying(true);
        }
        return () => {
            unsubscribe();
            clearInterval(timer);
        };
    }, [song, lockoutUntil]);

    // Persist skips
    useEffect(() => {
        localStorage.setItem("noire_skips", skipCount.toString());
    }, [skipCount]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Handle Seek from Context
    const { seekRequest, clearSeekRequest } = usePlayer();
    useEffect(() => {
        if (seekRequest !== null && audioRef.current) {
            audioRef.current.currentTime = seekRequest;
            clearSeekRequest();
        }
    }, [seekRequest, clearSeekRequest]);

    const handleSkip = (direction: 'next' | 'prev') => {
        if (userPlan === 'free') {
            const now = Date.now();
            if (lockoutUntil > now) {
                return; // Buttons should be disabled anyway
            }

            const newSkipCount = skipCount + 1;
            setSkipCount(newSkipCount);

            if (newSkipCount >= 10) {
                const thirtyMins = 30 * 60 * 1000;
                const until = now + thirtyMins;
                setLockoutUntil(until);
                localStorage.setItem("noire_lockout_until", until.toString());
            }

            // Trigger Ad logic: every 3 tracks/skips
            if (newSkipCount % 3 === 0) {
                playAd();
            }
        }

        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * queue.length);
            setCurrentIndex(randomIndex);
        } else {
            if (direction === 'next') {
                setCurrentIndex((prev) => (prev + 1) % queue.length);
            } else {
                setCurrentIndex((prev) => (prev - 1 + queue.length) % queue.length);
            }
        }
    };

    const playAd = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            setIsShowingAd(true);

            // In a real app, we'd have a specific ad URL
            // We'll simulate it by pausing playback and showing an 'Ad' overlay
            // and using a placeholder ad sound if available
            if (adAudioRef.current) {
                adAudioRef.current.src = "/assets/audio/noire-ad.mp3"; // Asset based ad
                adAudioRef.current.play().catch(e => console.log("Ad sound missing, using overlay only"));
            }

            setTimeout(() => {
                setIsShowingAd(false);
                setIsPlaying(true);
                audioRef.current?.play();
            }, 5000); // 5 second ad simulation
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const time = audioRef.current.currentTime;
            setCurrentTime(time);
            const progressPercent = (time / audioRef.current.duration) * 100;
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

    const toggleLike = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            toast({
                title: "Authentication Required",
                description: "Sign in to save this melody to your sanctuary.",
                variant: "destructive",
            });
            return;
        }

        const likedRef = doc(db, "users", currentUser.uid, "liked_songs", song.id);

        try {
            if (isLiked) {
                await deleteDoc(likedRef);
                setIsLiked(false);
                toast({
                    title: "Removed from Sanctuary",
                    description: "The vibration has been archived.",
                });
            } else {
                await setDoc(likedRef, {
                    ...song,
                    likedAt: new Date().toISOString()
                });
                setIsLiked(true);
                toast({
                    title: "Added to Sanctuary",
                    description: "Frequency successfully synced with your soul.",
                });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            toast({
                title: "Sync Error",
                description: "Could not update your library at this time.",
                variant: "destructive",
            });
        }
    };

    const openFullPage = () => {
        const params = new URLSearchParams({
            id: song.id,
            title: song.title,
            artist: song.artist,
            url: song.audioUrl,
            mood: song.mood
        });
        window.open(`/song-details?${params.toString()}`, '_blank');
    };

    return (
        <div className="fixed bottom-24 md:bottom-12 right-6 z-[100] flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        height: isMinimized ? "80px" : "auto"
                    }}
                    exit={{ y: 50, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    className="relative w-full max-w-[360px] bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto"
                >
                    <audio
                        ref={audioRef}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => {
                            const nextSongsPlayed = songsPlayed + 1;
                            setSongsPlayed(nextSongsPlayed);

                            if (userPlan === 'free' && nextSongsPlayed % 3 === 0) {
                                playAd();
                            } else {
                                if (isRepeat) {
                                    if (audioRef.current) {
                                        audioRef.current.currentTime = 0;
                                        audioRef.current.play();
                                    }
                                } else {
                                    handleSkip('next');
                                }
                            }
                        }}
                    />
                    <audio ref={adAudioRef} />

                    {/* Minimize/Close Controls */}
                    <div className="absolute top-4 right-14 z-10 flex gap-1">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-2.5 text-white/20 hover:text-white transition-colors bg-white/5 rounded-full"
                        >
                            {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>

                    <div className="absolute top-4 right-4 z-10">
                        <button onClick={onClose} className="p-2.5 text-white/20 hover:text-white transition-colors bg-white/5 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-5 flex flex-col gap-4">
                        {/* Info Header */}
                        <div className={`flex items-center gap-4 ${isMinimized ? '' : 'mb-2'}`}>
                            <div className={`relative ${isMinimized ? 'w-10 h-10' : 'w-16 h-16'} rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/10" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Music2 size={isMinimized ? 20 : 28} className={`text-primary/40 ${isPlaying ? 'animate-pulse' : ''}`} />
                                </div>
                            </div>
                            <div className="overflow-hidden flex-1">
                                <h3 className={`font-display font-bold text-white truncate ${isMinimized ? 'text-sm' : 'text-lg'}`}>{song.title}</h3>
                                <p className={`text-white/40 font-medium uppercase tracking-widest truncate ${isMinimized ? 'text-[8px]' : 'text-[10px]'}`}>{song.artist}</p>
                            </div>

                            {isMinimized && (
                                <button
                                    onClick={togglePlay}
                                    className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all"
                                >
                                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                </button>
                            )}
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Scrub Bar */}
                                <div className="space-y-2">
                                    <div
                                        className="relative h-1 w-full bg-white/5 rounded-full cursor-pointer group"
                                        onClick={handleProgressChange}
                                    >
                                        <motion.div
                                            className="absolute h-full bg-primary rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase tracking-tighter">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                {/* Control Deck */}
                                <div className="flex items-center justify-between px-2">
                                    <button
                                        onClick={() => setIsShuffle(!isShuffle)}
                                        className={`transition-all ${isShuffle ? 'text-primary' : 'text-white/20 hover:text-white'}`}
                                    >
                                        <Shuffle size={14} className={isShuffle ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''} />
                                    </button>
                                    <div className="flex items-center gap-5">
                                        <button
                                            onClick={() => handleSkip('prev')}
                                            disabled={lockoutUntil > Date.now()}
                                            className={`${lockoutUntil > Date.now() ? 'opacity-20 cursor-not-allowed' : 'text-white/50 hover:text-white active:scale-90'} transition-all`}
                                        >
                                            <SkipBack size={18} />
                                        </button>
                                        <button
                                            onClick={togglePlay}
                                            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
                                        >
                                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                                        </button>
                                        <button
                                            onClick={() => handleSkip('next')}
                                            disabled={lockoutUntil > Date.now()}
                                            className={`${lockoutUntil > Date.now() ? 'opacity-20 cursor-not-allowed' : 'text-white/50 hover:text-white active:scale-90'} transition-all flex flex-col items-center`}
                                        >
                                            <SkipForward size={18} />
                                            {userPlan === 'free' && lockoutUntil === 0 && (
                                                <span className="text-[6px] text-primary/50 mt-0.5">{10 - skipCount} left</span>
                                            )}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setIsRepeat(!isRepeat)}
                                        className={`transition-all ${isRepeat ? 'text-primary' : 'text-white/20 hover:text-white'}`}
                                    >
                                        <Repeat size={14} className={isRepeat ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''} />
                                    </button>
                                </div>

                                {/* Status Bar */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={toggleLike}
                                            className={`${isLiked ? 'text-primary' : 'text-white/20'} hover:text-white transition-colors`}
                                        >
                                            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                                        </button>
                                        <button onClick={openFullPage} className="p-1 text-white/20 hover:text-primary transition-all">
                                            <Maximize2 size={14} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {userPlan === 'free' ? (
                                            <button
                                                onClick={() => navigate("/pricing")}
                                                className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-primary text-[7px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all"
                                            >
                                                <Zap size={10} />
                                                Upgrade
                                            </button>
                                        ) : (
                                            <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg flex items-center gap-1.5 opacity-50">
                                                <Waves size={10} className="text-primary" />
                                                <span className="text-[7px] font-bold uppercase tracking-widest text-white">{userPlan}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {userPlan === 'free' && (
                                    <div className="flex flex-col gap-1 items-center justify-center mt-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-2">
                                            <Lock size={8} className="text-white" />
                                            <span className="text-[7px] text-white font-body uppercase tracking-[0.2em]">
                                                {lockoutUntil > Date.now()
                                                    ? `Skip Restoration: ${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s`
                                                    : "Limited Aura Experience"}
                                            </span>
                                        </div>
                                        <div className="px-2 py-0.5 bg-primary/20 rounded-full">
                                            <span className="text-[6px] text-primary font-bold uppercase tracking-widest">4K High Fidelity Sound</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Ad Overlay */}
                        <AnimatePresence>
                            {isShowingAd && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
                                >
                                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                                        <Sparkles className="text-primary" size={32} />
                                    </div>
                                    <h4 className="text-sm font-display font-bold text-white mb-1">A Word from Noire</h4>
                                    <p className="text-[10px] text-white/50 font-body mb-4 tracking-wide leading-relaxed">
                                        Fueling your vibrations through sound. <br /> Upgrade to Noire Pro for ad-free listening.
                                    </p>
                                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 5, ease: "linear" }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default PlayerModal;
