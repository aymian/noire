import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Library from "./pages/Library";
import Moods from "./pages/Moods";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import AdminMusic from "./pages/AdminMusic";
import SongDetails from "./pages/SongDetails";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import { PlayerProvider, usePlayer } from "./contexts/PlayerContext";
import PlayerModal from "./components/noire/PlayerModal";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isOpen, queue, currentIndex, closePlayer } = usePlayer();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/library" element={<Library />} />
        <Route path="/moods" element={<Moods />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/music" element={<AdminMusic />} />
        <Route path="/song-details" element={<SongDetails />} />
        <Route path="/pricing" element={<Pricing />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <AnimatePresence>
        {isOpen && currentIndex !== -1 && (
          <PlayerModal
            queue={queue}
            initialIndex={currentIndex}
            onClose={closePlayer}
          />
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
