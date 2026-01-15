import React, { createContext, useContext, useState, ReactNode } from "react";

interface Song {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    mood: string;
}

interface PlayerContextType {
    queue: Song[];
    currentIndex: number;
    isOpen: boolean;
    playSong: (songs: Song[], index: number) => void;
    closePlayer: () => void;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    progress: number;
    setProgress: (p: number) => void;
    currentTime: number;
    setCurrentTime: (t: number) => void;
    duration: number;
    setDuration: (d: number) => void;
    seek: (time: number) => void;
    seekRequest: number | null;
    clearSeekRequest: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const [queue, setQueue] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seekRequest, setSeekRequest] = useState<number | null>(null);

    const playSong = (songs: Song[], index: number) => {
        setQueue(songs);
        setCurrentIndex(index);
        setIsOpen(true);
        setIsPlaying(true);
    };

    const closePlayer = () => {
        setIsOpen(false);
    };

    const seek = (time: number) => {
        setSeekRequest(time);
    };

    const clearSeekRequest = () => {
        setSeekRequest(null);
    };

    return (
        <PlayerContext.Provider value={{
            queue, currentIndex, isOpen, playSong, closePlayer,
            isPlaying, setIsPlaying, progress, setProgress,
            currentTime, setCurrentTime, duration, setDuration,
            seek, seekRequest, clearSeekRequest
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
};
