import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchLibraryAlbums, fetchLibraryArtists } from '../api'
import { useAuth } from '../lib/auth'

export function LibraryPage() {
  const { ready } = useAuth()
  const [albums, setAlbums] = useState<Awaited<ReturnType<typeof fetchLibraryAlbums>>>([])
  const [artists, setArtists] = useState<Awaited<ReturnType<typeof fetchLibraryArtists>>>([])

  useEffect(() => {
    if (!ready) return
    void Promise.all([fetchLibraryAlbums(), fetchLibraryArtists()]).then(([a, ar]) => {
      setAlbums(a)
      setArtists(ar)
    })
  }, [ready])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 pb-28">
      <h1 className="mb-6 text-3xl font-bold text-white">Your library</h1>
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-white">Albums</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {albums.map((a) => (
            <Link
              key={a.id}
              to={`/album/${a.id}`}
              className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <img src={a.cover} alt="" className="mb-3 aspect-square w-full rounded-lg object-cover" />
              <p className="line-clamp-2 font-medium text-white">{a.title}</p>
              <p className="text-xs text-wf-muted">{a.year} · {a.artist.name}</p>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Artists</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {artists.map((a) => (
            <Link
              key={a.id}
              to={`/artist/${a.id}`}
              className="flex flex-col items-center rounded-xl bg-white/5 p-4 text-center ring-1 ring-white/10 hover:bg-white/10"
            >
              <img src={a.image} alt="" className="mb-3 h-28 w-28 rounded-full object-cover" />
              <span className="font-medium text-white">{a.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </motion.div>
  )
}
