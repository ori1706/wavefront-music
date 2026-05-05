import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { fetchLikeState, postListen, toggleLike } from '../api'
import { resolveMediaUrl } from './url'
import type { Track } from '../types'

interface QueueItem extends Track {
  queueId: string
}

interface PlayerContextType {
  current: Track | null
  queue: QueueItem[]
  isPlaying: boolean
  volume: number
  muted: boolean
  progress: number
  duration: number
  queueOpen: boolean
  likedMap: Record<string, boolean>
  playTrack: (track: Track, opts?: { queue?: Track[]; startIndex?: number }) => void
  playQueue: (tracks: Track[], startIndex?: number) => void
  toggle: () => void
  pause: () => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  seekRatio: (ratio: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  setQueueOpen: (v: boolean) => void
  reorderQueue: (orderedQueueIds: string[]) => void
  removeFromQueue: (queueId: string) => void
  refreshLike: (trackId: string) => Promise<void>
  toggleLikeCurrent: () => Promise<void>
}

const PlayerContext = createContext<PlayerContextType | null>(null)

let qid = 0
function qidgen() {
  qid += 1
  return `q-${qid}`
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [current, setCurrent] = useState<Track | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const queueRef = useRef<QueueItem[]>([])
  const currentIdxRef = useRef(0)
  const [isPlaying, setPlaying] = useState(false)
  const [volume, setVol] = useState(0.85)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [queueOpen, setQueueOpen] = useState(false)
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    queueRef.current = queue
  }, [queue])

  const effectiveVolume = muted ? 0 : volume

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = effectiveVolume
  }, [effectiveVolume])

  const syncLike = useCallback(async (trackId: string) => {
    try {
      const liked = await fetchLikeState(trackId)
      setLikedMap((m) => ({ ...m, [trackId]: liked }))
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (current?.id) void syncLike(current.id)
  }, [current?.id, syncLike])

  const playTrack = useCallback((track: Track, opts?: { queue?: Track[]; startIndex?: number }) => {
    const raw = opts?.queue ?? [track]
    const qi = raw.map((t) => ({ ...t, queueId: qidgen() }))
    const start = opts?.queue
      ? (opts.startIndex ?? Math.max(0, raw.findIndex((t) => t.id === track.id)))
      : 0
    const idx = Math.max(0, start >= 0 ? start : 0)
    setQueue(qi)
    queueRef.current = qi
    currentIdxRef.current = idx
    const play = qi[idx]
    if (play) {
      setCurrent(play)
      queueMicrotask(() => {
        const a = audioRef.current
        if (!a) return
        a.src = resolveMediaUrl(play.audioUrl)
        a.load()
        void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
      })
    }
  }, [])

  const playQueue = useCallback((tracks: Track[], startIndex = 0) => {
    if (!tracks.length) return
    const qi = tracks.map((t) => ({ ...t, queueId: qidgen() }))
    setQueue(qi)
    queueRef.current = qi
    currentIdxRef.current = startIndex
    const play = qi[startIndex]
    if (!play) return
    setCurrent(play)
    queueMicrotask(() => {
      const a = audioRef.current
      if (!a) return
      a.src = resolveMediaUrl(play.audioUrl)
      a.load()
      void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    })
  }, [])

  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a || !current) return
    if (isPlaying) {
      a.pause()
      setPlaying(false)
    } else {
      void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }, [isPlaying, current])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setPlaying(false)
  }, [])

  const next = useCallback(() => {
    const qi = queueRef.current
    const i = currentIdxRef.current + 1
    if (i < qi.length) {
      currentIdxRef.current = i
      const t = qi[i]!
      setCurrent(t)
      const a = audioRef.current
      if (a) {
        a.src = resolveMediaUrl(t.audioUrl)
        a.load()
        void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
      }
    } else {
      setPlaying(false)
    }
  }, [])

  const prev = useCallback(() => {
    const qi = queueRef.current
    const a = audioRef.current
    if (a && a.currentTime > 3) {
      a.currentTime = 0
      return
    }
    const i = currentIdxRef.current - 1
    if (i >= 0 && qi[i]) {
      currentIdxRef.current = i
      const t = qi[i]!
      setCurrent(t)
      if (a) {
        a.src = resolveMediaUrl(t.audioUrl)
        a.load()
        void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
      }
    }
  }, [])

  const seek = useCallback((seconds: number) => {
    const a = audioRef.current
    if (!a) return
    const max = a.duration || duration || seconds
    a.currentTime = Math.max(0, Math.min(seconds, max))
    setProgress(a.currentTime)
  }, [duration])

  const seekRatio = useCallback(
    (ratio: number) => {
      const a = audioRef.current
      const d = a?.duration || duration
      if (!d) return
      seek(ratio * d)
    },
    [duration, seek]
  )

  const setVolume = useCallback((v: number) => {
    const nv = Math.max(0, Math.min(1, v))
    setVol(nv)
    if (nv > 0) setMuted(false)
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((m) => !m)
  }, [])

  const reorderQueue = useCallback(
    (orderedQueueIds: string[]) => {
      const map = new Map(queue.map((x) => [x.queueId, x]))
      const nextQ: QueueItem[] = []
      for (const id of orderedQueueIds) {
        const item = map.get(id)
        if (item) nextQ.push(item)
      }
      setQueue(nextQ)
      queueRef.current = nextQ
      if (current) {
        const idx = nextQ.findIndex((x) => x.id === current.id)
        if (idx >= 0) currentIdxRef.current = idx
      }
    },
    [current, queue]
  )

  const removeFromQueue = useCallback((queueId: string) => {
    const cur = queueRef.current[currentIdxRef.current]
    setQueue((prev) => {
      const idxRemoved = prev.findIndex((x) => x.queueId === queueId)
      const filtered = prev.filter((x) => x.queueId !== queueId)
      queueRef.current = filtered

      if (idxRemoved < 0) return filtered

      const wasCurrent = cur && prev[idxRemoved]?.queueId === cur.queueId

      if (wasCurrent) {
        const ni = Math.min(idxRemoved, filtered.length - 1)
        if (ni >= 0 && filtered[ni]) {
          currentIdxRef.current = ni
          const t = filtered[ni]!
          setCurrent(t)
          queueMicrotask(() => {
            const a = audioRef.current
            if (!a) return
            a.src = resolveMediaUrl(t.audioUrl)
            a.load()
            void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
          })
        } else {
          setCurrent(null)
          setPlaying(false)
        }
      } else if (cur) {
        const idx = filtered.findIndex((x) => x.id === cur.id)
        if (idx >= 0) currentIdxRef.current = idx
      }

      return filtered
    })
  }, [])

  const refreshLike = useCallback(
    async (trackId: string) => {
      await syncLike(trackId)
    },
    [syncLike]
  )

  const toggleLikeCurrent = useCallback(async () => {
    if (!current) return
    const id = current.id
    const next = !likedMap[id]
    setLikedMap((m) => ({ ...m, [id]: next }))
    try {
      await toggleLike(id, next)
    } catch {
      setLikedMap((m) => ({ ...m, [id]: !next }))
    }
  }, [current, likedMap])

  const onTimeUpdate = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    setProgress(a.currentTime)
    if (a.duration && !Number.isNaN(a.duration)) setDuration(a.duration)
  }, [])

  const onEnded = useCallback(() => {
    const cur = queueRef.current[currentIdxRef.current]
    if (cur) void postListen(cur.id)
    next()
  }, [next])

  const value = useMemo(
    () => ({
      current,
      queue,
      isPlaying,
      volume,
      muted,
      progress,
      duration,
      queueOpen,
      likedMap,
      playTrack,
      playQueue,
      toggle,
      pause,
      next,
      prev,
      seek,
      seekRatio,
      setVolume,
      toggleMute,
      setQueueOpen,
      reorderQueue,
      removeFromQueue,
      refreshLike,
      toggleLikeCurrent,
    }),
    [
      current,
      queue,
      isPlaying,
      volume,
      muted,
      progress,
      duration,
      queueOpen,
      likedMap,
      playTrack,
      playQueue,
      toggle,
      pause,
      next,
      prev,
      seek,
      seekRatio,
      setVolume,
      toggleMute,
      reorderQueue,
      removeFromQueue,
      refreshLike,
      toggleLikeCurrent,
    ]
  )

  return (
    <PlayerContext.Provider value={value}>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
        className="hidden"
        aria-hidden
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={onTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer outside PlayerProvider')
  return ctx
}
