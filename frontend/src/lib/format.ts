export function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds)) return '0:00'
  const s = Math.floor(totalSeconds % 60)
  const m = Math.floor(totalSeconds / 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
