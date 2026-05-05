import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchHome } from '../api'
import type { HomePayload, Track } from '../types'
import { usePlayer } from '../lib/player'
import { useAuth } from '../lib/auth'
import { TrackRow } from '../components/TrackRow'
import { toggleLike } from '../api'

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-bold tracking-tight text-white">{title}</h2>
      {children}
    </section>
  )
}

export function HomePage() {
  const { ready } = useAuth()
  const [data, setData] = useState<HomePayload | null>(null)
  const { playTrack, playQueue, current, isPlaying, likedMap, refreshLike } = usePlayer()

  useEffect(() => {
    if (!ready) return
    void fetchHome().then(setData)
  }, [ready])

  const onPlayTrack = (t: Track, queue: Track[]) => {
    playTrack(t, { queue, startIndex: queue.findIndex((x) => x.id === t.id) })
  }

  const handleLike = async (trackId: string, next: boolean) => {
    try {
      await toggleLike(trackId, next)
      await refreshLike(trackId)
    } catch {
      /* ignore */
    }
  }

  if (!data) {
    return <HomeSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 pb-28"
    >
      <div className="mb-8">
        <p className="text-3xl font-bold tracking-tight text-white">
          {data.greeting}, {data.userName}
        </p>
        <p className="mt-1 text-sm text-wf-muted">Here is your Wavefront dashboard for today.</p>
      </div>

      <Section title="Recently played">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {data.recentlyPlayed.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onPlayTrack(t, data.recentlyPlayed)}
              className="w-40 shrink-0 text-left transition-transform hover:scale-[1.02]"
            >
              <img
                src={t.album.cover}
                alt=""
                className="mb-2 aspect-square w-full rounded-xl object-cover shadow-lg ring-1 ring-white/10"
              />
              <p className="line-clamp-2 text-sm font-medium text-white">{t.title}</p>
              <p className="line-clamp-1 text-xs text-wf-muted">{t.artist.name}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Made for you">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.madeForYou.map((p) => (
            <Link
              key={p.id}
              to={`/playlist/${p.id}`}
              className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-4 ring-1 ring-white/10 transition hover:from-white/15"
            >
              <img src={p.cover} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <div>
                <p className="font-semibold text-white">{p.name}</p>
                <p className="line-clamp-2 text-xs text-wf-muted">{p.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Top this week">
        <div className="rounded-2xl bg-white/[0.03] p-2 ring-1 ring-white/10">
          {data.topThisWeek.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              showAlbum
              isActive={current?.id === t.id}
              isPlaying={isPlaying}
              liked={likedMap[t.id]}
              onPlay={() => onPlayTrack(t, data.topThisWeek)}
              onLikeToggle={() => void handleLike(t.id, !likedMap[t.id])}
            />
          ))}
        </div>
      </Section>

      <Section title="Browse genres">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {data.genres.map((g) => (
            <Link
              key={g.id}
              to={`/search?q=${encodeURIComponent(g.name)}`}
              className="relative h-24 overflow-hidden rounded-xl ring-1 ring-white/10"
            >
              <img src={g.cover} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-2 left-3 text-lg font-bold text-white">{g.name}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Wavefront Radio">
        <button
          type="button"
          onClick={() => playQueue(data.topThisWeek, 0)}
          className="rounded-full bg-wf-accent px-6 py-3 text-sm font-semibold text-black hover:brightness-110"
        >
          Play top picks for you
        </button>
      </Section>
    </motion.div>
  )
}

function HomeSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-8">
      <div className="h-10 w-64 rounded-lg bg-white/10" />
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-40 w-40 rounded-xl bg-white/10" />
        ))}
      </div>
      <div className="h-32 w-full rounded-xl bg-white/10" />
    </div>
  )
}
