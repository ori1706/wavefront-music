import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { PlayerBar } from './PlayerBar'
import { QueuePanel } from './QueuePanel'
import { HelpOverlay } from './HelpOverlay'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

export function AppShell() {
  const [helpOpen, setHelpOpen] = useState(false)
  useKeyboardShortcuts(helpOpen, setHelpOpen)
  const location = useLocation()

  return (
    <div className="flex h-full min-h-0 flex-col bg-wf-bg text-wf-foreground">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="z-10 flex shrink-0 items-center justify-end border-b border-white/5 bg-wf-bg/80 px-4 py-2 backdrop-blur-md">
            <button
              type="button"
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-wf-muted hover:border-white/20 hover:text-white"
              aria-label="Keyboard shortcuts"
              onClick={() => setHelpOpen(true)}
            >
              ?
            </button>
          </header>
          <div className="relative min-h-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.main
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="h-full overflow-y-auto overflow-x-hidden"
              >
                <Outlet />
              </motion.main>
            </AnimatePresence>
            <QueuePanel />
            <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
          </div>
        </div>
      </div>
      <PlayerBar />
    </div>
  )
}
