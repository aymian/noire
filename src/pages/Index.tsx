import Navbar from "@/components/noire/Navbar";
import MobileBottomNav from "@/components/noire/MobileBottomNav";
import HeroSection from "@/components/noire/HeroSection";
import MoodSection from "@/components/noire/MoodSection";
import SoundVisualization from "@/components/noire/SoundVisualization";
import AfrobeatSpotlight from "@/components/noire/AfrobeatSpotlight";
import CallToEmotion from "@/components/noire/CallToEmotion";
import Footer from "@/components/noire/Footer";
import FloatingSidebar from "@/components/noire/FloatingSidebar";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import MusicDashboard from "@/components/noire/MusicDashboard";

/**
 * NOIRE Landing Page / Dashboard
 */
const Index = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthClick = (action: "login" | "signup") => {
    window.location.href = `/login?action=${action}`;
  };

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden content-shift">
      {user && <FloatingSidebar />}
      <Navbar onAuthClick={handleAuthClick} />

      {user ? (
        <MusicDashboard />
      ) : (
        <>
          <HeroSection onAuthClick={handleAuthClick} />
          <MoodSection onAuthClick={handleAuthClick} />
          <SoundVisualization onAuthClick={handleAuthClick} />
          <AfrobeatSpotlight onAuthClick={handleAuthClick} />
          <CallToEmotion onAuthClick={handleAuthClick} />
          <Footer />
        </>
      )}

      <MobileBottomNav onAuthClick={handleAuthClick} />
      <div className="h-24 md:h-0" />
    </main>
  );
};

export default Index;
