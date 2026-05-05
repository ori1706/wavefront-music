import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchLiked } from '../api'
import type { Track } from '../types'
import { usePlayer } from '../lib/player'
import { TrackRow } from '../components/TrackRow'
import { toggleLike } from '../api'
import { useAuth } from '../lib/auth'

export function LikedPage() {
  const { ready } = useAuth()
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchLiked>> | null>(null)
  const { playTrack, current, isPlaying, refreshLike } = usePlayer()

  const load = () => void fetchLiked().then(setData)

  useEffect(() => {
    if (!ready) return
    load()
  }, [ready])

  const tracks = data?.tracks ?? []

  const onPlay = (t: Track) => {
    const clean = tracks.map(({ position: _, ...rest }) => rest as Track)
    playTrack(t, { queue: clean, startIndex: clean.findIndex((x) => x.id === t.id) })
  }

  const onLike = async (id: string) => {
    await toggleLike(id, false)
    await refreshLike(id)
    load()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-28">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex h-56 w-56 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-rose-500 text-6xl shadow-2xl">
          ♥
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-wf-muted">Playlist</p>
          <h1 className="mt-2 text-5xl font-black text-white">Liked Songs</h1>
          <p className="mt-2 text-sm text-wf-muted">{tracks.length} songs you have liked</p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-white/[0.03] p-2 ring-1 ring-white/10">
        {tracks.map((t, i) => (
          <TrackRow
            key={t.id}
            track={t}
            index={i}
            showAlbum
            isActive={current?.id === t.id}
            isPlaying={isPlaying}
            liked
            onPlay={() => onPlay(t)}
            onLikeToggle={() => void onLike(t.id)}
          />
        ))}
      </div>
    </motion.div>
  )
}
