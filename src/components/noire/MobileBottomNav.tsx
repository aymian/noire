import { motion } from "framer-motion";
import { Disc3, User, LogIn, Home, Search, Library, Music, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * NOIRE Mobile Bottom Navigation
 * Transforms based on auth state
 * Desktop: Hidden
 */

interface MobileBottomNavProps {
  onAuthClick?: (action: "login" | "signup") => void;
}

const MobileBottomNav = ({ onAuthClick }: MobileBottomNavProps) => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAuthClick = (action: "login" | "signup") => {
    if (onAuthClick) {
      onAuthClick(action);
    } else {
      window.location.href = `/login?action=${action}`;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe"
    >
      {/* Gradient fade at top */}
      <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="glass-noire mx-4 mb-4 rounded-3xl px-2 py-2.5 border border-border/20 shadow-2xl">
        {user ? (
          // AUTHENTICATED BOTTOM NAV
          <div className="flex items-center justify-around">
            {[
              { icon: Home, label: "Home", path: "/" },
              { icon: Search, label: "Discovery", path: "/discovery" },
              { icon: Library, label: "Library", path: "/library" },
              { icon: User, label: "Profile", path: "/profile" },
            ].map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center gap-1 p-2 group"
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute -top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]"
                    />
                  )}
                  <item.icon
                    className={`w-5 h-5 transition-all duration-300 ${active ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                  />
                  <span className={`text-[10px] font-body uppercase tracking-[0.1em] font-bold transition-all duration-300 ${active ? "text-primary opacity-100" : "text-muted-foreground opacity-60"
                    }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          // GUEST BOTTOM NAV
          <div className="flex items-center justify-between gap-2">
            <motion.button
              onClick={() => handleAuthClick("signup")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-body font-bold text-sm shadow-lg shadow-primary/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Disc3 className="w-4 h-4 animate-spin-slow" />
              <span>Join NOIRE</span>
            </motion.button>

            <motion.button
              onClick={() => handleAuthClick("login")}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-border/50 text-foreground font-body text-sm bg-muted/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </motion.button>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default MobileBottomNav;
