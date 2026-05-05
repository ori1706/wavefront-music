import { useRef } from 'react'
import { usePlayer } from '../lib/player'
import { formatTime } from '../lib/format'

export function PlayerBar() {
  const {
    current,
    isPlaying,
    toggle,
    next,
    prev,
    progress,
    duration,
    seekRatio,
    volume,
    setVolume,
    setQueueOpen,
    queueOpen,
    toggleLikeCurrent,
    likedMap,
  } = usePlayer()

  const barRef = useRef<HTMLDivElement>(null)
  const ratio = duration > 0 ? progress / duration : 0

  const onBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = barRef.current
    if (!el || !duration) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    seekRatio(Math.min(1, Math.max(0, x / rect.width)))
  }

  return (
    <footer className="relative z-20 border-t border-white/10 bg-gradient-to-t from-black/70 to-wf-elevated/95 backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-[0_0_30%] items-center gap-3">
          {current ? (
            <>
              <img
                src={current.album.cover}
                alt=""
                className="h-14 w-14 shrink-0 rounded-md object-cover shadow-lg ring-1 ring-white/10"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{current.title}</p>
                <p className="truncate text-xs text-wf-muted">{current.artist.name}</p>
              </div>
              <button
                type="button"
                aria-label={likedMap[current.id] ? 'Unlike track' : 'Like track'}
                aria-pressed={likedMap[current.id] ? true : false}
                onClick={() => void toggleLikeCurrent()}
                className="ml-1 rounded-full p-1.5 text-wf-muted hover:bg-white/10 hover:text-rose-400"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill={likedMap[current.id] ? 'currentColor' : 'none'}
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="1.5"
                    d="M12 20s-7-4.64-7-10.5a5.5 5.5 0 0 1 9.9-3.3A5.5 5.5 0 0 1 19 9.5C19 15.36 12 20 12 20Z"
                  />
                </svg>
              </button>
            </>
          ) : (
            <p className="text-sm text-wf-muted">Pick a track to start listening</p>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Previous track"
              onClick={prev}
              className="rounded-full p-2 text-wf-muted hover:bg-white/10 hover:text-white disabled:opacity-40"
              disabled={!current}
            >
              <PrevIcon />
            </button>
            <button
              type="button"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:scale-[1.03] active:scale-95 disabled:opacity-40"
              disabled={!current}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              type="button"
              aria-label="Next track"
              onClick={next}
              className="rounded-full p-2 text-wf-muted hover:bg-white/10 hover:text-white disabled:opacity-40"
              disabled={!current}
            >
              <NextIcon />
            </button>
          </div>
          <div className="flex w-full max-w-xl items-center gap-2 text-[11px] text-wf-muted">
            <span className="w-10 tabular-nums">{formatTime(progress)}</span>
            <div
              ref={barRef}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(ratio * 100)}
              tabIndex={0}
              className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/10"
              onClick={onBarClick}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') seekRatio(Math.max(0, ratio - 0.05))
                if (e.key === 'ArrowRight') seekRatio(Math.min(1, ratio + 0.05))
              }}
            >
              <div
                className="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-wf-accent transition-[width]"
                style={{ width: `${ratio * 100}%` }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 shadow group-hover:opacity-100"
                style={{ left: `calc(${ratio * 100}% - 6px)` }}
              />
            </div>
            <span className="w-10 text-right tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex flex-[0_0_30%] items-center justify-end gap-3">
          <button
            type="button"
            aria-label={queueOpen ? 'Close queue' : 'Open queue'}
            aria-expanded={queueOpen}
            onClick={() => setQueueOpen(!queueOpen)}
            className="rounded-lg p-2 text-wf-muted hover:bg-white/10 hover:text-white"
          >
            <QueueIcon />
          </button>
          <div className="flex items-center gap-2">
            <VolumeIcon />
            <input
              aria-label="Volume"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-24 cursor-pointer accent-wf-accent"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7-11-7Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z" />
    </svg>
  )
}

function PrevIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 6H5v12h2V6Zm12 12-9-6 9-6v12Z" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 6h2v12h-2V6ZM5 18l9-6-9-6v12Z" />
    </svg>
  )
}

function QueueIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M8 7h11M8 12h11M8 17h11M5 7h.01M5 12h.01M5 17h.01" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function VolumeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M4 10v4h3l4 3V7L7 10H4Z" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 9a4 4 0 0 1 0 6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
