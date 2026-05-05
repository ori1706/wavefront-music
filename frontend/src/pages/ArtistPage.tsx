import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchArtist } from '../api'
import type { Track } from '../types'
import { usePlayer } from '../lib/player'
import { TrackRow } from '../components/TrackRow'
import { toggleLike } from '../api'
import { useAuth } from '../lib/auth'

export function ArtistPage() {
  const { id } = useParams()
  const { ready } = useAuth()
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchArtist>> | null>(null)
  const { playTrack, playQueue, current, isPlaying, likedMap, refreshLike } = usePlayer()

  useEffect(() => {
    if (!ready || !id) return
    void fetchArtist(id).then(setData)
  }, [id, ready])

  const playPopular = () => {
    if (!data?.popular.length) return
    playQueue(data.popular, 0)
  }

  const onRow = (t: Track) => {
    if (!data) return
    playTrack(t, { queue: data.popular, startIndex: data.popular.findIndex((x) => x.id === t.id) })
  }

  const onLike = async (trackId: string) => {
    const next = !likedMap[trackId]
    await toggleLike(trackId, next)
    await refreshLike(trackId)
  }

  if (!data) {
    return (
      <div className="animate-pulse p-8">
        <div className="h-48 w-full rounded-2xl bg-white/10" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-28">
      <div
        className="relative overflow-hidden bg-gradient-to-b from-emerald-900/50 to-wf-bg px-8 pb-10 pt-12"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(5,5,10,0.85), rgba(5,5,10,0.95)), url(${data.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-end">
          <img
            src={data.image}
            alt=""
            className="h-48 w-48 shrink-0 rounded-full object-cover shadow-2xl ring-4 ring-black/40"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-wf-muted">Artist</p>
            <h1 className="mt-2 text-5xl font-black tracking-tight text-white">{data.name}</h1>
            {data.bio && <p className="mt-4 max-w-xl text-sm text-white/80">{data.bio}</p>}
            <button
              type="button"
              onClick={playPopular}
              className="mt-6 rounded-full bg-wf-accent px-8 py-3 text-sm font-bold text-black hover:brightness-110"
            >
              Play popular
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pt-8">
        <h2 className="mb-4 text-2xl font-bold text-white">Popular</h2>
        <div className="rounded-2xl bg-white/[0.03] p-2 ring-1 ring-white/10">
          {data.popular.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              showAlbum
              isActive={current?.id === t.id}
              isPlaying={isPlaying}
              liked={likedMap[t.id]}
              onPlay={() => onRow(t)}
              onLikeToggle={() => void onLike(t.id)}
            />
          ))}
        </div>

        <h2 className="mb-4 mt-12 text-2xl font-bold text-white">Discography</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data.discography.map((al) => (
            <Link
              key={al.id}
              to={`/album/${al.id}`}
              className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10 hover:bg-white/10"
            >
              <img src={al.cover} alt="" className="mb-2 aspect-square w-full rounded-lg object-cover" />
              <p className="line-clamp-2 font-medium text-white">{al.title}</p>
              <p className="text-xs text-wf-muted">{al.year}</p>
            </Link>
          ))}
        </div>

        <h2 className="mb-4 mt-12 text-2xl font-bold text-white">Fans also like</h2>
        <div className="flex flex-wrap gap-4">
          {data.related.map((a) => (
            <Link
              key={a.id}
              to={`/artist/${a.id}`}
              className="flex w-36 flex-col items-center gap-2 rounded-xl bg-white/5 p-3 text-center ring-1 ring-white/10 hover:bg-white/10"
            >
              <img src={a.image} alt="" className="h-24 w-24 rounded-full object-cover" />
              <span className="text-sm font-medium text-white">{a.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
