import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Music, Plus, Search, Trash2, Edit2,
    Upload, X, Check, Save, Play,
    Pause, Music2, Loader2, ArrowLeft
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
    collection, addDoc, getDocs,
    deleteDoc, doc, updateDoc,
    query, orderBy, serverTimestamp
} from "firebase/firestore";
import Navbar from "@/components/noire/Navbar";
import { useToast } from "@/hooks/use-toast";

const AdminMusic = () => {
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<any>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Form State
    const [fileQueue, setFileQueue] = useState<any[]>([]);
    const [mood, setMood] = useState("amapiano");

    const CLOUD_NAME = "ddbrqfdca";
    const API_KEY = "356824519486849";
    const UPLOAD_PRESET = "noire_unsigned"; // Make sure to create this preset in Cloudinary!

    const moodOptions = [
        { id: "amapiano", label: "Amapiano" },
        { id: "sad", label: "Sad" },
        { id: "calm", label: "Calm" },
        { id: "afrobeat", label: "Afrobeat" },
        { id: "happy", label: "Happy" },
    ];

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        setLoading(true);
        try {
            const songsRef = collection(db, "songs");
            const q = query(songsRef, orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const songsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSongs(songsList);
        } catch (error) {
            console.error("Error fetching songs:", error);
            toast({
                title: "Fetch Failed",
                description: "Could not load the music library.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newQueue = selectedFiles.map(file => {
            // Try to extract metadata from filename (format: "Artist - Title.mp3")
            let artist = "Unknown Artist";
            let title = file.name.replace(/\.[^/.]+$/, ""); // remove extension

            if (title.includes(" - ")) {
                const parts = title.split(" - ");
                artist = parts[0].trim();
                title = parts[1].trim();
            }

            return {
                id: Math.random().toString(36).substr(2, 9),
                file,
                title,
                artist,
                status: "waiting",
                progress: 0
            };
        });
        setFileQueue(prev => [...prev, ...newQueue]);
    };

    const uploadFile = (fileObj: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const cloudFormData = new FormData();
            cloudFormData.append("file", fileObj.file);
            cloudFormData.append("upload_preset", UPLOAD_PRESET);
            cloudFormData.append("cloud_name", CLOUD_NAME);
            cloudFormData.append("resource_type", "auto");

            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded * 100) / e.total);
                    setFileQueue(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress } : f));
                }
            });

            xhr.onreadystatechange = async () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        try {
                            // Save to Firestore
                            await addDoc(collection(db, "songs"), {
                                title: fileObj.title,
                                artist: fileObj.artist,
                                mood: mood,
                                audioUrl: data.secure_url,
                                duration: data.duration,
                                format: data.format,
                                createdAt: serverTimestamp()
                            });
                            setFileQueue(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "done", progress: 100 } : f));
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    } else {
                        setFileQueue(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "error" } : f));
                        reject(new Error("Cloudinary upload failed"));
                    }
                }
            };

            xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, true);
            xhr.send(cloudFormData);
            setFileQueue(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: "uploading" } : f));
        });
    };

    const handleBatchUpload = async () => {
        if (fileQueue.length === 0) return;
        setUploading(true);

        try {
            const waitingFiles = fileQueue.filter(f => f.status === "waiting");
            for (const fileObj of waitingFiles) {
                await uploadFile(fileObj);
            }
            toast({
                title: "Upload Complete",
                description: `Successfully processed ${waitingFiles.length} tracks.`,
            });
            setTimeout(() => {
                setIsUploadModalOpen(false);
                setFileQueue([]);
                fetchSongs();
            }, 2000);
        } catch (error: any) {
            console.error("Batch upload error:", error);
            toast({
                title: "Upload Interrupted",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return;
        try {
            await deleteDoc(doc(db, "songs", id));
            setSongs(prev => prev.filter(s => s.id !== id));
            toast({ title: "Removed", description: `${title} deleted.` });
        } catch (error) {
            toast({ title: "Delete Failed", variant: "destructive" });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSong) return;
        setUploading(true);
        try {
            await updateDoc(doc(db, "songs", editingSong.id), {
                title: editingSong.title,
                artist: editingSong.artist,
                mood: editingSong.mood
            });
            toast({ title: "Track Updated" });
            setEditingSong(null);
            fetchSongs();
        } catch (error) {
            toast({ title: "Update Failed", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.mood?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground bg-noire-hero">
            <Navbar adminMode={true} />

            <main className="container mx-auto px-6 pt-32 pb-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-wider">Back to Deck</span>
                        </button>
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Music size={24} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Audio Lab</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold">Music <span className="text-gradient-gold">Studio</span></h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search library..."
                                className="pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all font-bold text-sm"
                        >
                            <Plus size={20} />
                            Deploy Music
                        </button>
                    </div>
                </header>

                <div className="glass-noire border border-white/5 rounded-[40px] overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-2xl font-display font-bold">Library Assets</h2>
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{filteredSongs.length} Tracks Ready</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-white/5">
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Track</th>
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Artist</th>
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Mood</th>
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Created</th>
                                    <th className="px-8 py-5 text-right text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-8 py-20 text-center"><Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" /></td></tr>
                                ) : filteredSongs.length === 0 ? (
                                    <tr><td colSpan={5} className="px-8 py-20 text-center text-muted-foreground">Studio library is empty.</td></tr>
                                ) : (
                                    filteredSongs.map(song => (
                                        <tr key={song.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Play size={16} /></div>
                                                    <div><p className="font-bold text-sm">{song.title}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-medium text-muted-foreground">{song.artist}</td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded-lg font-bold uppercase">{song.mood || 'vibe'}</span>
                                            </td>
                                            <td className="px-8 py-5 text-xs text-muted-foreground">{song.createdAt?.toDate().toLocaleDateString() || '--'}</td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingSong(song)} className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground hover:text-primary transition-colors"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete(song.id, song.title)} className="p-2 hover:bg-red-500/10 rounded-xl text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsUploadModalOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-2xl glass-noire border border-white/10 rounded-[40px] p-10 relative z-10 shadow-2xl overflow-hidden"
                        >
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors z-20"
                            >
                                <X size={20} />
                            </button>
                            <div className="mb-8">
                                <h2 className="text-3xl font-display font-bold text-gradient-gold">Studio Deployment</h2>
                                <p className="text-sm text-muted-foreground mt-2">Upload multiple tracks or drop a folder. Mood will be applied to the batch.</p>
                            </div>

                            <div className="space-y-8">
                                {/* Mood Selection */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Assigned Context (Mood)</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {moodOptions.map(m => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setMood(m.id)}
                                                className={`py-2.5 rounded-xl text-[10px] font-bold border transition-all ${mood === m.id ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(251,191,36,0.3)]" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"}`}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Drop Zone */}
                                {fileQueue.length === 0 ? (
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            multiple
                                            accept="audio/*"
                                            onChange={handleFileSelection}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-full h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-4 group-hover:bg-white/10 group-hover:border-primary/40 transition-all duration-500" >
                                            <div className="p-4 bg-primary/10 rounded-2xl text-primary scale-110 group-hover:scale-125 transition-transform duration-500">
                                                <Upload size={32} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-white">Click or Drop folder/songs</p>
                                                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Artist - Title.mp3 supported</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{fileQueue.length} Files Queued</span>
                                            {!uploading && (
                                                <button
                                                    onClick={() => setFileQueue([])}
                                                    className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 no-scrollbar">
                                            {fileQueue.map((f) => (
                                                <div key={f.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-bold text-white truncate">{f.title}</span>
                                                            <span className="text-[9px] font-bold text-primary">{f.progress}%</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${f.progress}%` }}
                                                                className="h-full bg-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                    {f.status === "done" ? (
                                                        <div className="text-green-500"><Check size={16} /></div>
                                                    ) : f.status === "error" ? (
                                                        <div className="text-red-500"><X size={16} /></div>
                                                    ) : (
                                                        <div className="text-white/20"><Music2 size={16} /></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleBatchUpload}
                                            disabled={uploading}
                                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {uploading ? (
                                                <><Loader2 size={18} className="animate-spin" /><span>Syncing {fileQueue.filter(f => f.status === "uploading").length}/{fileQueue.length} to Cloud</span></>
                                            ) : (
                                                <><Check size={18} /><span>Start Batch Deployment</span></>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingSong && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingSong(null)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-md glass-noire border border-white/10 rounded-[40px] p-10 relative z-10"
                        >
                            <h2 className="text-2xl font-display font-bold mb-6">Modify Metadata</h2>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <input
                                    type="text"
                                    value={editingSong.title}
                                    onChange={e => setEditingSong({ ...editingSong, title: e.target.value })}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm"
                                    placeholder="Title"
                                />
                                <input
                                    type="text"
                                    value={editingSong.artist}
                                    onChange={e => setEditingSong({ ...editingSong, artist: e.target.value })}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm"
                                    placeholder="Artist"
                                />
                                <select
                                    value={editingSong.mood}
                                    onChange={e => setEditingSong({ ...editingSong, mood: e.target.value })}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none"
                                >
                                    {moodOptions.map(m => (
                                        <option key={m.id} value={m.id} className="bg-background">{m.label}</option>
                                    ))}
                                </select>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingSong(null)}
                                        className="flex-1 py-4 border border-white/10 rounded-2xl font-bold text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-xs flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} />Save Assets
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminMusic;
