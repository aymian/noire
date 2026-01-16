
// Use the token provided by the user as a fallback or initial value
// Note: In a real app, this should be handled via OAuth flow
const HARDCODED_TOKEN = 'BQDaCk5sVTBbhMgnSvFRDRwhuaCR62mDhbxq3E0BGLQzGm1YJCzmWY217hf4o0hdz1lTlmklyq_LV7zBvCYMrED45lydC5mwQ5Ac25fH18gTb7vCb3l679mtG_cvk16jnOFou5MNAmcIPTgTfGoJpkurtG31Rt3chPpHUqnkYeOy3Ydvqd74E-RWEnYISMb_gDsetBw26kgFaewzPzhW4bTq9JYXHAmzAN_XYhLZNufaHWUmxOCPg64ok0bcrhqdFkhWKyRVc9m5saXJ8PLumor-HLn8_ssHbDHIh3WCm5E5kklvRCjKeTFcXmFoyuHjJTk9';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || "";

let accessToken: string | null = HARDCODED_TOKEN;
let tokenExpiry: number | null = null;

async function getAccessToken(): Promise<string> {
    // If we have a Client ID and Secret, we can refresh/get a new token
    if (CLIENT_ID && CLIENT_SECRET) {
        if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
            return accessToken;
        }

        try {
            const response = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
                },
                body: "grant_type=client_credentials",
            });

            const data = await response.json();
            if (data.access_token) {
                accessToken = data.access_token;
                tokenExpiry = Date.now() + data.expires_in * 1000;
                return accessToken;
            }
        } catch (e) {
            console.error("Failed to fetch token with credentials, falling back to hardcoded token", e);
        }
    }

    return accessToken || HARDCODED_TOKEN;
}

async function fetchWebApi(endpoint: string, method: string, body?: any) {
    const token = await getAccessToken();
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        method,
        body: body ? JSON.stringify(body) : undefined
    });
    return await res.json();
}

export async function searchSpotifyTracks(query: string) {
    if (!query) return [];

    try {
        const data = await fetchWebApi(`v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, 'GET');
        return data.tracks?.items || [];
    } catch (error) {
        console.error("Spotify search error:", error);
        return [];
    }
}

export async function getTopTracks() {
    try {
        const data = await fetchWebApi('v1/me/top/tracks?time_range=long_term&limit=5', 'GET');
        return data.items || [];
    } catch (error) {
        console.error("Spotify top tracks error:", error);
        return [];
    }
}
