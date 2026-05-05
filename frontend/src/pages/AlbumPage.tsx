import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchAlbum } from '../api'
import type { Track } from '../types'
import { usePlayer } from '../lib/player'
import { TrackRow } from '../components/TrackRow'
import { toggleLike } from '../api'
import { useAuth } from '../lib/auth'

export function AlbumPage() {
  const { id } = useParams()
  const { ready } = useAuth()
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAlbum>> | null>(null)
  const { playTrack, playQueue, current, isPlaying, likedMap, refreshLike } = usePlayer()

  useEffect(() => {
    if (!ready || !id) return
    void fetchAlbum(id).then(setData)
  }, [id, ready])

  const playAll = () => {
    if (!data?.tracks.length) return
    playQueue(data.tracks, 0)
  }

  const onRow = (t: Track) => {
    if (!data) return
    playTrack(t, { queue: data.tracks, startIndex: data.tracks.findIndex((x) => x.id === t.id) })
  }

  const onLike = async (trackId: string) => {
    const next = !likedMap[trackId]
    await toggleLike(trackId, next)
    await refreshLike(trackId)
  }

  if (!data) {
    return (
      <div className="animate-pulse p-8">
        <div className="h-52 w-52 rounded-2xl bg-white/10" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-28">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end">
        <img
          src={data.cover}
          alt=""
          className="h-52 w-52 shrink-0 rounded-2xl object-cover shadow-2xl ring-1 ring-white/15"
        />
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-wf-muted">Album</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">{data.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-wf-muted">
            <Link className="font-semibold text-white hover:underline" to={`/artist/${data.artist.id}`}>
              {data.artist.name}
            </Link>
            <span>·</span>
            <span>{data.year}</span>
            <span>·</span>
            <span>{data.tracks.length} tracks</span>
          </div>
          <button
            type="button"
            onClick={playAll}
            className="mt-6 rounded-full bg-wf-accent px-8 py-3 text-sm font-bold text-black hover:brightness-110"
          >
            Play
          </button>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/10">
        <div className="mb-2 grid grid-cols-[32px_1fr_80px_40px] gap-3 px-2 text-xs font-semibold uppercase tracking-wide text-wf-muted">
          <span>#</span>
          <span>Title</span>
          <span className="text-right">Time</span>
          <span />
        </div>
        {data.tracks.map((t, i) => (
          <TrackRow
            key={t.id}
            track={t}
            index={i}
            isActive={current?.id === t.id}
            isPlaying={isPlaying}
            liked={likedMap[t.id]}
            onPlay={() => onRow(t)}
            onLikeToggle={() => void onLike(t.id)}
          />
        ))}
      </div>
    </motion.div>
  )
}
