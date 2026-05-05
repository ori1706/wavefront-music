import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { search as searchApi } from '../api'
import type { Track } from '../types'
import { usePlayer } from '../lib/player'
import { toggleLike } from '../api'
import { useAuth } from '../lib/auth'

export function SearchPage() {
  const { ready } = useAuth()
  const [params, setParams] = useSearchParams()
  const qParam = params.get('q') ?? ''
  const [input, setInput] = useState(qParam)
  const [debounced, setDebounced] = useState(qParam)
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchApi>> | null>(null)
  const { playTrack, current, likedMap, refreshLike } = usePlayer()

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(input), 250)
    return () => window.clearTimeout(t)
  }, [input])

  useEffect(() => {
    setParams((p) => {
      const next = new URLSearchParams(p)
      if (debounced) next.set('q', debounced)
      else next.delete('q')
      return next
    })
  }, [debounced, setParams])

  useEffect(() => {
    if (!ready) return
    if (!debounced.trim()) {
      setResults({ tracks: [], artists: [], albums: [], playlists: [] })
      return
    }
    const ac = new AbortController()
    void searchApi(debounced).then(setResults)
    return () => ac.abort()
  }, [debounced, ready])

  const grouped = useMemo(() => results, [results])

  const onPlay = (t: Track, arr: Track[]) => {
    playTrack(t, { queue: arr, startIndex: arr.findIndex((x) => x.id === t.id) })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-28">
      <label className="sr-only" htmlFor="search-input">
        Search
      </label>
      <input
        id="search-input"
        autoFocus
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="What do you want to listen to?"
        className="w-full max-w-xl rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-wf-muted focus:border-wf-accent focus:outline-none"
      />

      {grouped && (
        <div className="mt-10 space-y-10">
          {grouped.tracks.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-white">Tracks</h2>
              <div className="rounded-xl bg-white/[0.03] p-2 ring-1 ring-white/10">
                {grouped.tracks.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-white/5"
                    onClick={() => onPlay(t, grouped.tracks)}
                  >
                    <span className="w-6 text-xs text-wf-muted">{i + 1}</span>
                    <img src={t.album.cover} alt="" className="h-10 w-10 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate ${current?.id === t.id ? 'text-wf-accent' : 'text-white'}`}>
                        {t.title}
                      </p>
                      <p className="truncate text-xs text-wf-muted">{t.artist.name}</p>
                    </div>
                    <button
                      type="button"
                      className="text-wf-muted hover:text-rose-400"
                      onClick={(e) => {
                        e.stopPropagation()
                        void (async () => {
                          const liked = !!likedMap[t.id]
                          await toggleLike(t.id, !liked)
                          await refreshLike(t.id)
                        })()
                      }}
                    >
                      ♥
                    </button>
                  </button>
                ))}
              </div>
            </section>
          )}
          {grouped.artists.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-white">Artists</h2>
              <div className="flex flex-wrap gap-4">
                {grouped.artists.map((a) => (
                  <Link
                    key={a.id}
                    to={`/artist/${a.id}`}
                    className="flex w-36 flex-col items-center gap-2 rounded-xl bg-white/5 p-3 text-center ring-1 ring-white/10 hover:bg-white/10"
                  >
                    <img src={a.image} alt="" className="h-20 w-20 rounded-full object-cover" />
                    <span className="text-sm font-medium text-white">{a.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {grouped.albums.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-white">Albums</h2>
              <div className="flex flex-wrap gap-4">
                {grouped.albums.map((al) => (
                  <Link
                    key={al.id}
                    to={`/album/${al.id}`}
                    className="w-40 rounded-xl bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/10"
                  >
                    <img src={al.cover} alt="" className="mb-2 aspect-square w-full rounded-lg object-cover" />
                    <p className="line-clamp-2 text-sm font-medium text-white">{al.title}</p>
                    <p className="text-xs text-wf-muted">{al.artist.name}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {grouped.playlists.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-white">Playlists</h2>
              <ul className="space-y-2">
                {grouped.playlists.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/playlist/${p.id}`}
                      className="block rounded-lg bg-white/5 px-4 py-3 text-white ring-1 ring-white/10 hover:bg-white/10"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {debounced && grouped.tracks.length === 0 && grouped.artists.length === 0 && grouped.albums.length === 0 && grouped.playlists.length === 0 && (
            <p className="text-wf-muted">No results for “{debounced}”.</p>
          )}
        </div>
      )}
    </motion.div>
  )
}
