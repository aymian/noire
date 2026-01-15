import { motion, AnimatePresence } from "framer-motion";
import {
    Home, Search, Music2, Library, Heart,
    Settings, Zap, Compass, Plus, ChevronRight,
    PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * NOIRE Floating Sidebar - Premium, Collapsible navigation
 */

interface SidebarProps {
    onToggle?: (collapsed: boolean) => void;
}

const FloatingSidebar = ({ onToggle }: SidebarProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        if (onToggle) onToggle(newState);
        // Update CSS variable for the rest of the app to respect
        document.documentElement.style.setProperty(
            "--sidebar-width",
            newState ? "100px" : "280px"
        );
    };

    useEffect(() => {
        // Set initial width
        document.documentElement.style.setProperty("--sidebar-width", "280px");
        return () => {
            document.documentElement.style.setProperty("--sidebar-width", "0px");
        };
    }, []);

    const menuItems = [
        { icon: Home, label: "Home", path: "/" },
        { icon: Compass, label: "Discovery", path: "/discovery" },
        { icon: Music2, label: "Moods", path: "/moods" },
        { icon: Library, label: "Library", path: "/library" },
        { icon: Heart, label: "Favourites", path: "/favourites" },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{
                x: 0,
                opacity: 1,
                width: isCollapsed ? "72px" : "240px"
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-6 top-28 z-[40] hidden lg:flex flex-col gap-6"
        >
            {/* Navigation Menu */}
            <div className="glass-noire rounded-[32px] border border-white/10 p-3 flex flex-col gap-2 shadow-2xl relative overflow-hidden transition-all duration-500">
                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="flex items-center justify-center p-3 text-muted-foreground hover:text-primary transition-colors mb-2 rounded-2xl hover:bg-white/5"
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <div className="flex items-center gap-3 w-full px-1"><PanelLeftClose size={20} /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Navigation</span></div>}
                </button>

                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <motion.button
                            key={item.label}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative overflow-hidden ${active
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                }`}
                        >
                            <item.icon size={20} className={`flex-shrink-0 ${active ? "animate-pulse-slow" : ""}`} />

                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="text-xs font-bold font-body whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {active && (
                                <motion.div
                                    layoutId="sidebar-active-pill"
                                    className="absolute -left-1 w-1.5 h-6 bg-white rounded-full shadow-[0_0_8px_white]"
                                />
                            )}
                        </motion.button>
                    );
                })}

                <div className="h-px bg-white/5 my-2 mx-2" />

                {/* Settings */}
                <motion.button
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/settings")}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all relative overflow-hidden"
                >
                    <Settings size={20} className="flex-shrink-0" />
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-xs font-bold font-body whitespace-nowrap"
                            >
                                Settings
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Visualizer / Quick Action Area */}
            {!isCollapsed && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-noire rounded-[32px] border border-white/10 p-4 flex flex-col items-center gap-4 shadow-2xl"
                >
                    <button className="w-full h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all group overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3 relative z-10 px-4">
                            <Plus size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Create</span>
                        </div>
                    </button>

                    <div className="flex flex-col items-center gap-1.5 w-full">
                        <div className="flex items-center gap-2 mb-2 w-full justify-center">
                            <Zap size={12} className="text-primary" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aura Energy</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full relative overflow-hidden">
                            <motion.div
                                className="absolute bottom-0 left-0 top-0 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]"
                                animate={{ width: ["20%", "60%", "40%", "80%", "30%"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.aside>
    );
};

export default FloatingSidebar;
