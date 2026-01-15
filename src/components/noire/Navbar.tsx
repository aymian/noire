import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Home, Compass, Music2, Library as LibraryIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NoireLogo from "./NoireLogo";
import UserDropdown from "./UserDropdown";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import SearchOverlay from "./SearchOverlay";
import { usePlayer } from "@/contexts/PlayerContext";

/**
 * NOIRE Navbar - Cinematic Top Bar
 */

interface NavbarProps {
  onAuthClick?: (action: "login" | "signup") => void;
  adminMode?: boolean;
}

const Navbar = ({ onAuthClick, adminMode }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      // Press 's' to search (but not when in an input/textarea)
      if (e.key === "s" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const guestNavItems = [
    { label: "Moods", href: "/moods" },
    { label: "Experience", href: "#sound" },
    { label: "Artists", href: "#afrobeat" },
  ];

  const proNavItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Compass, label: "Discovery", path: "/discovery" },
    { icon: Music2, label: "Moods", path: "/moods" },
    { icon: LibraryIcon, label: "Library", path: "/library" },
  ];

  const handleAuthClick = (action: "login" | "signup") => {
    if (onAuthClick) {
      onAuthClick(action);
    } else {
      window.location.href = `/login?action=${action}`;
    }
  };

  const adminUser = {
    displayName: "Yves",
    email: "yves@noire.pro",
    photoURL: null
  };

  const adminData = {
    username: "yves2008",
    fullName: "Yves Admin",
    plan: "ADMIN"
  };

  return (
    <>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-6 left-6 z-50 hidden md:flex"
      >
        <div className="glass-noire rounded-full px-4 py-2 border border-border/30">
          <button onClick={() => navigate("/")}>
            <NoireLogo size={28} showText={true} />
          </button>
        </div>
      </motion.div>

      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-6 right-6 z-50 hidden md:flex"
      >
        <div className="glass-noire rounded-full px-3 py-2 flex items-center gap-2 border border-border/30">
          {!adminMode && guestNavItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.label === "Moods" ? undefined : item.href}
              onClick={() => item.label === "Moods" ? navigate("/moods") : null}
              className="px-4 py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-300 rounded-full hover:bg-muted/30 cursor-pointer"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              {item.label}
            </motion.a>
          ))}

          {!adminMode && (
            <motion.button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-4 h-4" />
            </motion.button>
          )}

          <div className="w-px h-6 bg-border/50" />

          <div className="flex items-center gap-2">
            {adminMode ? (
              <UserDropdown user={adminUser as any} userData={adminData} />
            ) : user ? (
              <UserDropdown user={user} userData={userData} />
            ) : (
              <>
                <button
                  onClick={() => handleAuthClick("login")}
                  className="px-4 py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => handleAuthClick("signup")}
                  className="px-5 py-2 text-sm font-body font-medium bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Top Navbar */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="glass-noire px-4 py-3 flex items-center justify-between border-b border-border/20">
          <button onClick={() => navigate("/")}>
            <NoireLogo size={26} showText={true} />
          </button>

          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-foreground rounded-full hover:bg-muted/30"
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-background/98 backdrop-blur-xl z-40"
              onClick={() => setIsMenuOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center justify-center h-full gap-6 pt-16"
                onClick={(e) => e.stopPropagation()}
              >
                {(user ? proNavItems : guestNavItems).map((item, index) => (
                  <motion.button
                    key={item.label}
                    onClick={() => {
                      if ('path' in item) {
                        navigate(item.path);
                      } else if (item.label === "Moods") {
                        navigate("/moods");
                      } else {
                        // Link to section
                      }
                      setIsMenuOpen(false);
                    }}
                    className="font-display text-3xl text-foreground hover:text-primary transition-colors text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                  >
                    {item.label}
                  </motion.button>
                ))}

                <div className="flex flex-col gap-3 mt-8 w-64 items-center">
                  {adminMode ? (
                    <UserDropdown user={adminUser as any} userData={adminData} />
                  ) : user ? (
                    <UserDropdown user={user} userData={userData} />
                  ) : (
                    <>
                      <button
                        onClick={() => handleAuthClick("login")}
                        className="w-full px-6 py-3 text-base font-body text-foreground border border-border/50 rounded-full hover:bg-muted/30 transition-colors"
                      >
                        Sign in
                      </button>
                      <button
                        onClick={() => handleAuthClick("signup")}
                        className="w-full px-6 py-3 text-base font-body font-medium bg-primary text-primary-foreground rounded-full"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onPlaySong={(song) => {
          setIsSearchOpen(false);
          playSong([song], 0);
          navigate(`/song-details?id=${song.id}&title=${song.title}&artist=${song.artist}&url=${song.audioUrl}&mood=${song.mood}`);
        }}
      />
    </>
  );
};

export default Navbar;
