import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  fetchPlaylist,
  updatePlaylist,
  reorderPlaylist,
  removeTrackFromPlaylist,
  addTrackToPlaylist,
  search as searchApi,
} from '../api'
import type { Track } from '../types'
import { usePlayer } from '../lib/player'
import { formatTime } from '../lib/format'
import { toggleLike } from '../api'
import { useAuth } from '../lib/auth'

export function PlaylistPage() {
  const { id } = useParams()
  const { ready } = useAuth()
  const [pl, setPl] = useState<Awaited<ReturnType<typeof fetchPlaylist>> | null>(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const { playQueue, playTrack, current, isPlaying, likedMap, refreshLike } = usePlayer()

  const load = () => {
    if (!id) return
    void fetchPlaylist(id).then((p) => {
      setPl(p)
      setName(p.name)
      setDesc(p.description ?? '')
    })
  }

  useEffect(() => {
    if (!ready || !id) return
    load()
  }, [id, ready])

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!query.trim()) {
        setResults([])
        return
      }
      void searchApi(query).then((r) => setResults(r.tracks.slice(0, 8)))
    }, 200)
    return () => window.clearTimeout(t)
  }, [query])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const onDragEnd = async (e: DragEndEvent) => {
    if (!pl || !id) return
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = pl.tracks.map((t) => t.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    const nextOrder = arrayMove(ids, oldIndex, newIndex)
    await reorderPlaylist(id, nextOrder)
    load()
  }

  const playAll = () => {
    if (!pl?.tracks.length) return
    const tracks = pl.tracks.map(({ position: _, ...rest }) => rest as Track)
    playQueue(tracks, 0)
  }

  const onSaveMeta = async () => {
    if (!id) return
    await updatePlaylist(id, { name, description: desc })
    load()
  }

  const share = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
  }

  const remove = async (trackId: string) => {
    if (!id) return
    await removeTrackFromPlaylist(id, trackId)
    load()
  }

  const add = async (trackId: string) => {
    if (!id) return
    await addTrackToPlaylist(id, trackId)
    setAddOpen(false)
    setQuery('')
    load()
  }

  const onLike = async (trackId: string) => {
    const next = !likedMap[trackId]
    await toggleLike(trackId, next)
    await refreshLike(trackId)
  }

  if (!pl) {
    return (
      <div className="animate-pulse p-8">
        <div className="h-40 w-full rounded-2xl bg-white/10" />
      </div>
    )
  }

  const tracks = pl.tracks

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-28">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
        <img
          src={
            pl.cover ??
            tracks[0]?.album.cover ??
            'https://images.unsplash.com/photo-1459749411175-04bf6592f717?w=600&h=600&fit=crop'
          }
          alt=""
          className="h-56 w-56 shrink-0 rounded-2xl object-cover shadow-2xl ring-1 ring-white/15"
        />
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-wf-muted">Playlist</p>
          <input
            aria-label="Playlist title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => void onSaveMeta()}
            className="mt-2 w-full max-w-xl bg-transparent text-4xl font-black tracking-tight text-white outline-none placeholder:text-white/30"
          />
          <textarea
            aria-label="Playlist description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onBlur={() => void onSaveMeta()}
            rows={2}
            className="mt-3 w-full max-w-xl resize-none bg-white/5 px-3 py-2 text-sm text-wf-muted outline-none ring-1 ring-white/10 rounded-lg"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={playAll}
              className="rounded-full bg-wf-accent px-8 py-3 text-sm font-bold text-black hover:brightness-110"
            >
              Play all
            </button>
            <button
              type="button"
              onClick={() => void share()}
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Share
            </button>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Add tracks
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/10">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void onDragEnd(e)}>
          <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tracks.map((t, i) => (
              <SortRow
                key={t.id}
                id={t.id}
                index={i}
                track={t}
                activeId={current?.id}
                playing={isPlaying}
                liked={likedMap[t.id]}
                onPlay={() =>
                  playTrack(t, {
                    queue: tracks.map(({ position: _, ...rest }) => rest as Track),
                    startIndex: i,
                  })
                }
                onRemove={() => void remove(t.id)}
                onLike={() => void onLike(t.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-10 backdrop-blur-sm" role="dialog">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-wf-elevated p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Add tracks</h3>
            <input
              className="mt-4 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="Search library..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
              {results.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/10"
                    onClick={() => void add(t.id)}
                  >
                    <img src={t.album.cover} alt="" className="h-10 w-10 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{t.title}</p>
                      <p className="truncate text-xs text-wf-muted">
                        {t.artist.name} · {formatTime(t.durationSeconds)}
                      </p>
                    </div>
                    <span className="text-xs text-wf-accent">Add</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-white/10 py-2 text-sm font-medium text-white hover:bg-white/15"
              onClick={() => setAddOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function SortRow({
  id,
  index,
  track,
  activeId,
  playing,
  liked,
  onPlay,
  onRemove,
  onLike,
}: {
  id: string
  index: number
  track: Track & { position: number }
  activeId?: string
  playing: boolean
  liked?: boolean
  onPlay: () => void
  onRemove: () => void
  onLike: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }
  const isActive = activeId === id
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[32px_32px_1fr_80px_80px] items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/5"
    >
      <button type="button" className="cursor-grab text-wf-muted" aria-label="Reorder" {...attributes} {...listeners}>
        ⋮⋮
      </button>
      <span className="text-center text-xs text-wf-muted">{index + 1}</span>
      <button type="button" className="min-w-0 text-left" onDoubleClick={onPlay} onClick={onPlay}>
        <p className={`truncate text-sm ${isActive ? 'text-wf-accent' : 'text-white'}`}>{track.title}</p>
        <p className="truncate text-xs text-wf-muted">{track.artist.name}</p>
      </button>
      <span className="text-right text-xs text-wf-muted tabular-nums">{formatTime(track.durationSeconds)}</span>
      <div className="flex justify-end gap-2">
        <button type="button" className="text-wf-muted hover:text-rose-400" onClick={onLike}>
          {liked ? '♥' : '♡'}
        </button>
        <button type="button" className="text-wf-muted hover:text-white" onClick={onRemove}>
          Remove
        </button>
      </div>
      {isActive && playing && <span className="sr-only">Now playing</span>}
    </div>
  )
}
