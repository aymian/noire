import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Heart, Headphones, Music2, Share2,
  Play, Info, ArrowLeft, Volume2, Moon, Sun,
  Leaf, Zap, Flame, Wind, Cloud
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import Navbar from "@/components/noire/Navbar";
import MobileBottomNav from "@/components/noire/MobileBottomNav";
import FloatingSidebar from "@/components/noire/FloatingSidebar";

/**
 * PRO Moods Page - Immersive Emotion Discovery
 */

const Moods = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState("free");
  const [lastMoodSelection, setLastMoodSelection] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserPlan(data.plan || "free");
          setLastMoodSelection(data.lastMoodSelectionDate?.toDate() || null);
        }
        setLoading(false);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleMoodSelect = async (moodId: string) => {
    if (userPlan === 'free' && lastMoodSelection) {
      const now = new Date();
      const diffHours = (now.getTime() - lastMoodSelection.getTime()) / (1000 * 60 * 60);

      if (diffHours < 24) {
        alert("Free Aura allows only 1 Mood selection per 24 hours. Upgrade for limitless flow.");
        navigate("/pricing");
        return;
      }
    }

    // Record the selection if free
    if (userPlan === 'free') {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          lastMoodSelectionDate: serverTimestamp()
        });
      }
    }

    setSelectedMood(moodId);
  };

  const moodCategories = [
    {
      id: "euphoric",
      label: "Euphoric",
      icon: Zap,
      color: "from-amber-400 to-orange-600",
      description: "High energy, light, and pure joy.",
      genre: "Afrobeat / Pop"
    },
    {
      id: "melancholic",
      label: "Melancholic",
      icon: Moon,
      color: "from-indigo-600 to-purple-800",
      description: "Deep, soulful, and introspective.",
      genre: "Soul / R&B"
    },
    {
      id: "rhythmic",
      label: "Rhythmic",
      icon: Flame,
      color: "from-red-600 to-rose-700",
      description: "Steady beats that move your soul.",
      genre: "Amapiano / Afro-House"
    },
    {
      id: "serene",
      label: "Serene",
      icon: Leaf,
      color: "from-emerald-500 to-teal-700",
      description: "Calm, peaceful, and weightless.",
      genre: "Lo-Fi / Ambient"
    },
    {
      id: "intense",
      label: "Intense",
      icon: Wind,
      color: "from-slate-700 to-zinc-900",
      description: "Powerful, driving, and boundary-pushing.",
      genre: "Experimental"
    },
    {
      id: "nostalgic",
      label: "Nostalgic",
      icon: Sun,
      color: "from-orange-400 to-pink-600",
      description: "Familiar rhythms from a golden era.",
      genre: "Classic Highlife"
    }
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-24 content-shift">
      {!loading && <FloatingSidebar />}
      <Navbar />

      <main className="container mx-auto px-6 pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <div className="px-4 py-1.5 glass-noire border border-primary/20 rounded-full flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Emotional Discovery</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">How do you <span className="text-gradient-gold">feel?</span></h1>
          <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
            Choose a vibration that resonates with your current state.
            Our AI will craft a sonic journey tailored to your heart's rhythm.
          </p>
        </motion.div>

        {/* Mood Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {moodCategories.map((mood, idx) => (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleMoodSelect(mood.id)}
              className="group relative h-80 rounded-[40px] overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-500 shadow-2xl"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-20 group-hover:opacity-40 transition-opacity duration-700`} />

              {/* Animated Background Pulse */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className={`absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br ${mood.color} blur-[120px] animate-pulse`} />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-10 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-3xl bg-white/5 border border-white/10 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-500`}>
                    <mood.icon className="w-8 h-8" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button className="p-3 glass-noire rounded-full hover:bg-white/10">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-3 glass-noire rounded-full hover:bg-white/10">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-left">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-2">{mood.genre}</p>
                  <h3 className="text-3xl font-display font-bold mb-2">{mood.label}</h3>
                  <p className="text-sm text-muted-foreground font-body max-w-[200px] leading-relaxed group-hover:text-foreground/80 transition-colors">
                    {mood.description}
                  </p>
                </div>
              </div>

              {/* Bottom Glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>
      </main>

      {/* Selected Mood Overlay */}
      <AnimatePresence>
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <div className="absolute top-10 left-10">
              <button
                onClick={() => setSelectedMood(null)}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body"
              >
                <ArrowLeft size={18} />
                Back to Vibrations
              </button>
            </div>

            <div className="text-center max-w-3xl">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-10 inline-block"
              >
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-primary/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-20" />
                  <div className="absolute inset-0 rounded-full border border-primary/50 animate-pulse" />
                  <Volume2 className="w-20 h-20 md:w-32 md:h-32 text-primary" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-display font-bold mb-6"
              >
                Crafting your <span className="text-primary capitalize">{selectedMood}</span> Sanctuary...
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground font-body mb-10"
              >
                Our AI is currently analyzing billions of rhythm patterns to find the perfect sonic signature for your mood.
              </motion.p>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-4"
              >
                <button className="px-12 py-5 bg-primary text-primary-foreground rounded-3xl font-bold text-xl hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-3">
                  <Play size={24} fill="currentColor" />
                  Begin Journey
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileBottomNav />
    </div>
  );
};

export default Moods;
