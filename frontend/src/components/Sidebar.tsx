import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchPlaylists, createPlaylist } from '../api'
import type { PlaylistSummary } from '../types'
import { useAuth } from '../lib/auth'

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/search', label: 'Search', icon: SearchIcon },
  { to: '/library', label: 'Your Library', icon: LibraryIcon },
]

export function Sidebar() {
  const { ready } = useAuth()
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([])
  const navigate = useNavigate()

  const load = () => {
    void fetchPlaylists().then(setPlaylists).catch(() => {})
  }

  useEffect(() => {
    if (!ready) return
    load()
  }, [ready])

  const onNew = async () => {
    const { id } = await createPlaylist(`My playlist ${Math.floor(Math.random() * 999)}`)
    load()
    navigate(`/playlist/${id}`)
  }

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-white/10 bg-wf-surface/90 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wf-elevated ring-1 ring-white/10">
          <LogoMark />
        </div>
        <div className="text-left">
          <p className="text-[15px] font-semibold tracking-tight text-white">Wavefront</p>
          <p className="text-xs text-wf-muted">Stream</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-2" aria-label="Primary">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-wf-muted hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            <Icon className="h-5 w-5 opacity-90" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mx-4 my-4 h-px bg-white/10" />

      <div className="px-4">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-wf-muted">
          <span>Playlists</span>
          <button
            type="button"
            onClick={() => void onNew()}
            className="rounded-md px-2 py-1 text-[11px] font-semibold text-wf-accent hover:bg-wf-accent-dim"
          >
            + New
          </button>
        </div>
        <div
          className="flex max-h-[40vh] flex-col gap-0.5 overflow-y-auto pr-1"
          role="list"
          aria-label="Your playlists"
        >
          <NavLink
            to="/liked"
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-wf-muted hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            <HeartIcon className="h-4 w-4 text-rose-400" />
            Liked Songs
          </NavLink>
          {playlists.map((p) => (
            <NavLink
              key={p.id}
              to={`/playlist/${p.id}`}
              role="listitem"
              className={({ isActive }) =>
                [
                  'line-clamp-1 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-wf-muted hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              {p.name}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-auto px-5 py-4 text-[11px] text-wf-muted">
        Demo session · royalty-free audio (SoundHelix samples)
      </div>
    </aside>
  )
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M8 22V10l16 4v12"
        stroke="#4cf0c4"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14l16 4"
        stroke="#4cf0c4"
        strokeOpacity=".45"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function HomeIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeWidth="1.6" />
    </svg>
  )
}

function SearchIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className}>
      <circle cx="11" cy="11" r="6.5" strokeWidth="1.6" />
      <path d="m16 16 4 4" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function LibraryIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={props.className}>
      <path d="M5 6.5h14v13H5v-13Z" strokeWidth="1.6" />
      <path d="M9 6.5V19" strokeWidth="1.6" />
    </svg>
  )
}

function HeartIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden>
      <path d="M12 20.5s-6.09-3.96-9-8.25C.32 9.35 1.56 5.5 5.25 5.5 7.56 5.5 9.5 7 12 9.5 14.5 7 16.44 5.5 18.75 5.5 22.44 5.5 23.68 9.35 21 12.25c-2.91 4.29-9 8.25-9 8.25Z" />
    </svg>
  )
}
