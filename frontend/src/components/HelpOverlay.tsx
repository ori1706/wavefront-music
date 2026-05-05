import { motion, AnimatePresence } from 'framer-motion'

export function HelpOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex items-start justify-center bg-black/70 p-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className="max-w-md rounded-2xl border border-white/10 bg-wf-elevated p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="help-title" className="text-lg font-semibold text-white">
              Keyboard shortcuts
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-wf-muted">
              <li>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">Space</kbd> Play / pause
              </li>
              <li>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">←</kbd>{' '}
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">→</kbd> Seek ±5s
              </li>
              <li>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">↑</kbd>{' '}
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">↓</kbd> Volume
              </li>
              <li>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">M</kbd> Mute / unmute
              </li>
              <li>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">?</kbd> Toggle this help
              </li>
              <li>
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">Esc</kbd> Close
              </li>
            </ul>
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-white/10 py-2 text-sm font-medium text-white hover:bg-white/15"
              onClick={onClose}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
