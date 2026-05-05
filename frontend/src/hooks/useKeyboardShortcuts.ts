import { useEffect } from 'react'
import { usePlayer } from '../lib/player'

export function useKeyboardShortcuts(helpOpen: boolean, setHelpOpen: (v: boolean) => void) {
  const {
    toggle,
    seek,
    setVolume,
    toggleMute,
    current,
    progress,
    duration,
    volume,
  } = usePlayer()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const t = e.target as HTMLElement
        if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return
        e.preventDefault()
        setHelpOpen(!helpOpen)
        return
      }

      if (helpOpen) {
        if (e.key === 'Escape') setHelpOpen(false)
        return
      }

      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return

      if (e.code === 'Space') {
        e.preventDefault()
        if (current) toggle()
        return
      }
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        toggleMute()
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (current) seek(Math.max(0, progress - 5))
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (current && duration) seek(Math.min(duration, progress + 5))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setVolume(volume + 0.05)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setVolume(volume - 0.05)
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    toggle,
    seek,
    setVolume,
    toggleMute,
    current,
    progress,
    duration,
    volume,
    helpOpen,
    setHelpOpen,
  ])
}
