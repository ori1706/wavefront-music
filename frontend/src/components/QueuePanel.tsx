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
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '../lib/player'
import { formatTime } from '../lib/format'
import type { Track } from '../types'

export function QueuePanel() {
  const {
    queueOpen,
    setQueueOpen,
    queue,
    current,
    reorderQueue,
    removeFromQueue,
    progress,
    duration,
    isPlaying,
  } = usePlayer()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = queue.findIndex((q) => q.queueId === active.id)
    const newIndex = queue.findIndex((q) => q.queueId === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(queue, oldIndex, newIndex).map((x) => x.queueId)
    reorderQueue(next)
  }

  return (
    <AnimatePresence>
      {queueOpen && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          className="absolute right-0 top-0 z-30 flex h-full w-[300px] flex-col border-l border-white/10 bg-wf-bg/95 shadow-2xl backdrop-blur-xl"
          role="complementary"
          aria-label="Playback queue"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Queue</p>
            <button
              type="button"
              aria-label="Close queue"
              className="rounded-md p-1 text-wf-muted hover:bg-white/10 hover:text-white"
              onClick={() => setQueueOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-wf-muted">
              Now playing
            </p>
            {current ? (
              <div className="mb-4 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <p className="line-clamp-2 text-sm font-medium text-white">{current.title}</p>
                <p className="text-xs text-wf-muted">{current.artist.name}</p>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-wf-accent"
                    style={{
                      width: duration ? `${(progress / duration) * 100}%` : '0%',
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-wf-muted">
                  {isPlaying ? 'Playing' : 'Paused'} · {formatTime(progress)} / {formatTime(duration)}
                </p>
              </div>
            ) : (
              <p className="mb-4 text-sm text-wf-muted">Nothing playing</p>
            )}

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-wf-muted">
              Up next
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={queue.map((q) => q.queueId)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-1">
                  {queue.map((q) => (
                    <QueueRow key={q.queueId} item={q} onRemove={() => removeFromQueue(q.queueId)} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function QueueRow({
  item,
  onRemove,
}: {
  item: Track & { queueId: string }
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.queueId,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  }
  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2 py-2 ring-1 ring-white/5"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-wf-muted"
        aria-label="Reorder"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <img src={item.album.cover} alt="" className="h-10 w-10 rounded object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white">{item.title}</p>
        <p className="truncate text-xs text-wf-muted">{item.artist.name}</p>
      </div>
      <button type="button" aria-label="Remove from queue" className="text-wf-muted hover:text-white" onClick={onRemove}>
        ✕
      </button>
    </li>
  )
}
