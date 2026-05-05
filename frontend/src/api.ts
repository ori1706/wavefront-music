import axios from 'axios'
import type { HomePayload, SearchResult, Track } from './types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete api.defaults.headers.common.Authorization
}

export async function demoAuth(): Promise<{ token: string }> {
  const { data } = await api.post<{ token: string }>('/api/auth/demo')
  return data
}

export async function fetchHome(): Promise<HomePayload> {
  const { data } = await api.get<HomePayload>('/api/home')
  return data
}

export async function search(q: string): Promise<SearchResult> {
  const { data } = await api.get<SearchResult>('/api/search', { params: { q } })
  return data
}

export async function fetchAlbum(id: string) {
  const { data } = await api.get<{
    id: string
    title: string
    year: number
    cover: string
    artist: { id: string; name: string; image: string }
    tracks: Track[]
  }>(`/api/albums/${id}`)
  return data
}

export async function fetchArtist(id: string) {
  const { data } = await api.get<{
    id: string
    name: string
    image: string
    bio: string | null
    popular: Track[]
    discography: { id: string; title: string; year: number; cover: string }[]
    related: { id: string; name: string; image: string }[]
  }>(`/api/artists/${id}`)
  return data
}

export async function fetchPlaylists() {
  const { data } = await api.get<
    { id: string; name: string; description: string | null; cover: string | null; trackCount: number }[]
  >('/api/playlists')
  return data
}

export async function fetchPlaylist(id: string) {
  const { data } = await api.get<{
    id: string
    name: string
    description: string | null
    cover: string | null
    trackCount: number
    tracks: ({ position: number } & Track)[]
  }>(`/api/playlists/${id}`)
  return data
}

export async function fetchLiked() {
  const { data } = await api.get<{
    id: string
    name: string
    description: string
    tracks: ({ position: number } & Track)[]
  }>('/api/liked')
  return data
}

export async function createPlaylist(name: string) {
  const { data } = await api.post('/api/playlists', { name })
  return data as { id: string }
}

export async function updatePlaylist(id: string, body: { name?: string; description?: string }) {
  const { data } = await api.patch(`/api/playlists/${id}`, body)
  return data
}

export async function addTrackToPlaylist(playlistId: string, trackId: string) {
  await api.post(`/api/playlists/${playlistId}/tracks`, { trackId })
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  await api.delete(`/api/playlists/${playlistId}/tracks/${trackId}`)
}

export async function reorderPlaylist(playlistId: string, orderedTrackIds: string[]) {
  await api.put(`/api/playlists/${playlistId}/reorder`, { orderedTrackIds })
}

export async function postListen(trackId: string) {
  await api.post('/api/listen', { trackId })
}

export async function toggleLike(trackId: string, like: boolean) {
  if (like) await api.post(`/api/likes/${trackId}`)
  else await api.delete(`/api/likes/${trackId}`)
}

export async function fetchLikeState(trackId: string): Promise<boolean> {
  const { data } = await api.get<{ liked: boolean }>(`/api/likes/${trackId}`)
  return data.liked
}

export async function fetchLibraryAlbums() {
  const { data } = await api.get<
    { id: string; title: string; year: number; cover: string; artist: { id: string; name: string } }[]
  >('/api/library/albums')
  return data
}

export async function fetchLibraryArtists() {
  const { data } = await api.get<{ id: string; name: string; image: string }[]>('/api/library/artists')
  return data
}

export { api }
