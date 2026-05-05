export interface Track {
  id: string
  title: string
  durationSeconds: number
  audioUrl: string
  trackNumber: number
  artist: { id: string; name: string; image: string }
  album: { id: string; title: string; year: number; cover: string }
}

export interface PlaylistSummary {
  id: string
  name: string
  description: string | null
  cover: string | null
  trackCount?: number
}

export interface HomePayload {
  greeting: string
  userName: string
  recentlyPlayed: Track[]
  madeForYou: { id: string; name: string; description: string | null; cover: string }[]
  topThisWeek: Track[]
  genres: { id: string; name: string; cover: string }[]
}

export interface SearchResult {
  tracks: Track[]
  artists: { id: string; name: string; image: string }[]
  albums: {
    id: string
    title: string
    year: number
    cover: string
    artist: { id: string; name: string }
  }[]
  playlists: { id: string; name: string; description: string | null; cover: string | null }[]
}
