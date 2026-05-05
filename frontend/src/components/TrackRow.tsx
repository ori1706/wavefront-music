import type { Track } from '../types'
import { formatTime } from '../lib/format'

interface Props {
  track: Track
  index?: number
  showAlbum?: boolean
  isActive: boolean
  isPlaying: boolean
  onPlay: () => void
  onLikeToggle?: () => void
  liked?: boolean
}

export function TrackRow({
  track,
  index,
  showAlbum,
  isActive,
  isPlaying,
  onPlay,
  onLikeToggle,
  liked,
}: Props) {
  return (
    <div
      className={[
        'group grid cursor-pointer grid-cols-[32px_1fr_80px_40px] items-center gap-3 rounded-lg px-2 py-2 text-sm',
        isActive ? 'bg-white/10 ring-1 ring-wf-accent/40' : 'hover:bg-white/5',
      ].join(' ')}
      onDoubleClick={onPlay}
      role="row"
    >
      <div className="text-center text-xs text-wf-muted tabular-nums">
        {isActive && isPlaying ? (
          <PlayingBars />
        ) : (
          <span className="group-hover:hidden">{index !== undefined ? index + 1 : '·'}</span>
        )}
        <button
          type="button"
          aria-label={`Play ${track.title}`}
          className="hidden text-white group-hover:inline"
          onClick={(e) => {
            e.stopPropagation()
            onPlay()
          }}
        >
          ▶
        </button>
      </div>
      <div className="min-w-0">
        <p className={`truncate ${isActive ? 'text-wf-accent' : 'text-white'}`}>{track.title}</p>
        {showAlbum && <p className="truncate text-xs text-wf-muted">{track.album.title}</p>}
      </div>
      <span className="text-right text-xs text-wf-muted tabular-nums">
        {formatTime(track.durationSeconds)}
      </span>
      {onLikeToggle && (
        <button
          type="button"
          aria-label={liked ? 'Unlike' : 'Like'}
          className="justify-self-end text-wf-muted hover:text-rose-400"
          onClick={(e) => {
            e.stopPropagation()
            onLikeToggle()
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
          >
            <path
              strokeWidth="1.4"
              d="M12 20s-7-4.64-7-10.5a5.5 5.5 0 0 1 9.9-3.3A5.5 5.5 0 0 1 19 9.5C19 15.36 12 20 12 20Z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

function PlayingBars() {
  return (
    <span className="inline-flex h-4 items-end justify-center gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-3 w-0.5 origin-bottom rounded-full bg-wf-accent animate-wf-bar"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </span>
  )
}
