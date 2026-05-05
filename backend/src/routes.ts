import type { Express, Request, Response } from 'express';
import { prisma } from './db.js';
import { authMiddleware, signUserToken, type AuthedRequest } from './auth.js';

const trackInclude = {
  artist: true,
  album: true,
} as const;

function serializeTrack(
  _req: Request,
  t: {
    id: string
    title: string
    durationSeconds: number
    audioUrl: string
    trackNumber: number
    artist: { id: string; name: string; image: string }
    album: { id: string; title: string; year: number; cover: string }
  }
) {
  const path = t.audioUrl.startsWith('http')
    ? t.audioUrl
    : t.audioUrl.startsWith('/')
      ? t.audioUrl
      : `/${t.audioUrl}`;
  return {
    id: t.id,
    title: t.title,
    durationSeconds: t.durationSeconds,
    audioUrl: path,
    trackNumber: t.trackNumber,
    artist: { id: t.artist.id, name: t.artist.name, image: t.artist.image },
    album: { id: t.album.id, title: t.album.title, year: t.album.year, cover: t.album.cover },
  };
}

export function registerRoutes(app: Express): void {
  app.post('/api/auth/demo', async (_req: Request, res: Response) => {
    const email = 'demo@wavefront.audio';
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: 'Demo User' },
      });
    }
    const token = await signUserToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });

  app.get('/api/me', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const u = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!u) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ id: u.id, name: u.name, email: u.email });
  });

  app.get('/api/home', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const userId = req.userId!;

    const recentListens = await prisma.listen.findMany({
      where: { userId },
      orderBy: { listenedAt: 'desc' },
      take: 12,
      include: { track: { include: trackInclude } },
    });
    const seen = new Set<string>();
    const recentlyPlayed = [];
    for (const l of recentListens) {
      if (seen.has(l.trackId)) continue;
      seen.add(l.trackId);
      recentlyPlayed.push(serializeTrack(req, l.track));
    }

    const playlists = await prisma.playlist.findMany({
      where: { ownerId: userId, name: { in: ['Chill Vibes', 'Focus Flow', 'Late Night'] } },
      include: { tracks: { take: 1, include: { track: { include: { album: true } } } } },
    });

    const madeForYou = playlists.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      cover:
        p.tracks[0]?.track.album.cover ??
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    }));

    const topThisWeek = await prisma.track.findMany({
      take: 10,
      orderBy: { id: 'asc' },
      include: trackInclude,
    });

    const genres = [
      { id: 'g1', name: 'Electronic', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=200&fit=crop' },
      { id: 'g2', name: 'Indie', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop' },
      { id: 'g3', name: 'Jazz', cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=200&fit=crop' },
      { id: 'g4', name: 'Ambient', cover: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=200&fit=crop' },
      { id: 'g5', name: 'Hip-hop', cover: 'https://images.unsplash.com/photo-1571266028243-e4733f23bcfb?w=400&h=200&fit=crop' },
      { id: 'g6', name: 'Classical', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=200&fit=crop' },
    ];

    res.json({
      greeting: 'Good evening',
      userName: 'Demo',
      recentlyPlayed,
      madeForYou,
      topThisWeek: topThisWeek.map((t) => serializeTrack(req, t)),
      genres,
    });
  });

  app.get('/api/search', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const q = String(req.query.q ?? '').trim();
    if (q.length < 1) {
      res.json({ tracks: [], artists: [], albums: [], playlists: [] });
      return;
    }
    const userId = req.userId!;

    const [tracks, artists, albums, playlists] = await Promise.all([
      prisma.track.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        take: 12,
        include: trackInclude,
      }),
      prisma.artist.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        take: 8,
      }),
      prisma.album.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        take: 8,
        include: { artist: true },
      }),
      prisma.playlist.findMany({
        where: {
          ownerId: userId,
          name: { contains: q, mode: 'insensitive' },
        },
        take: 8,
      }),
    ]);

    res.json({
      tracks: tracks.map((t) => serializeTrack(req, t)),
      artists: artists.map((a) => ({ id: a.id, name: a.name, image: a.image })),
      albums: albums.map((a) => ({
        id: a.id,
        title: a.title,
        year: a.year,
        cover: a.cover,
        artist: { id: a.artist.id, name: a.artist.name },
      })),
      playlists: playlists.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        cover: p.cover,
      })),
    });
  });

  app.get('/api/tracks/:id', async (req: Request, res: Response) => {
    const t = await prisma.track.findUnique({
      where: { id: req.params.id },
      include: trackInclude,
    });
    if (!t) {
      res.status(404).json({ error: 'Track not found' });
      return;
    }
    res.json(serializeTrack(req, t));
  });

  app.get('/api/albums/:id', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const album = await prisma.album.findUnique({
      where: { id: req.params.id },
      include: {
        artist: true,
        tracks: { orderBy: { trackNumber: 'asc' }, include: { artist: true, album: true } },
      },
    });
    if (!album) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }
    res.json({
      id: album.id,
      title: album.title,
      year: album.year,
      cover: album.cover,
      artist: { id: album.artist.id, name: album.artist.name, image: album.artist.image },
      tracks: album.tracks.map((t) => serializeTrack(req, t)),
    });
  });

  app.get('/api/artists/:id', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const artist = await prisma.artist.findUnique({
      where: { id: req.params.id },
      include: {
        albums: { orderBy: { year: 'desc' } },
        tracks: { take: 8, orderBy: { id: 'asc' }, include: trackInclude },
      },
    });
    if (!artist) {
      res.status(404).json({ error: 'Artist not found' });
      return;
    }

    const related = await prisma.artist.findMany({
      where: { id: { not: artist.id } },
      take: 6,
      orderBy: { name: 'asc' },
    });

    res.json({
      id: artist.id,
      name: artist.name,
      image: artist.image,
      bio: artist.bio,
      popular: artist.tracks.map((t) => serializeTrack(req, t)),
      discography: artist.albums.map((a) => ({
        id: a.id,
        title: a.title,
        year: a.year,
        cover: a.cover,
      })),
      related: related.map((a) => ({ id: a.id, name: a.name, image: a.image })),
    });
  });

  app.get('/api/playlists', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const lists = await prisma.playlist.findMany({
      where: { ownerId: req.userId! },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { tracks: true } },
        tracks: {
          orderBy: { position: 'asc' },
          take: 1,
          include: { track: { include: { album: true } } },
        },
      },
    });
    res.json(
      lists.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        cover:
          p.cover ??
          p.tracks[0]?.track.album.cover ??
          'https://images.unsplash.com/photo-1459749411175-04bf6592f717?w=400&h=400&fit=crop',
        trackCount: p._count.tracks,
      }))
    );
  });

  app.get('/api/playlists/:id', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const p = await prisma.playlist.findFirst({
      where: { id: req.params.id, ownerId: req.userId! },
      include: {
        tracks: {
          orderBy: { position: 'asc' },
          include: { track: { include: trackInclude } },
        },
      },
    });
    if (!p) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }
    const count = await prisma.playlistTrack.count({ where: { playlistId: p.id } });
    res.json({
      id: p.id,
      name: p.name,
      description: p.description,
      cover: p.cover,
      trackCount: count,
      tracks: p.tracks.map((pt) => ({
        position: pt.position,
        ...serializeTrack(req, pt.track),
      })),
    });
  });

  app.post('/api/playlists', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const name = String((req.body as { name?: string }).name ?? 'New Playlist');
    const description = (req.body as { description?: string }).description ?? null;
    const p = await prisma.playlist.create({
      data: { ownerId: req.userId!, name, description },
    });
    res.status(201).json(p);
  });

  app.patch('/api/playlists/:id', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const body = req.body as { name?: string; description?: string };
    const p = await prisma.playlist.updateMany({
      where: { id: req.params.id, ownerId: req.userId! },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
      },
    });
    if (p.count === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const updated = await prisma.playlist.findUnique({ where: { id: req.params.id } });
    res.json(updated);
  });

  app.post('/api/playlists/:id/tracks', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const trackId = (req.body as { trackId?: string }).trackId;
    if (!trackId) {
      res.status(400).json({ error: 'trackId required' });
      return;
    }
    const list = await prisma.playlist.findFirst({
      where: { id: req.params.id, ownerId: req.userId! },
    });
    if (!list) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }
    const maxPos = await prisma.playlistTrack.aggregate({
      where: { playlistId: list.id },
      _max: { position: true },
    });
    const position = (maxPos._max.position ?? -1) + 1;
    await prisma.playlistTrack.create({
      data: { playlistId: list.id, trackId, position },
    });
    res.status(201).json({ ok: true });
  });

  app.delete('/api/playlists/:id/tracks/:trackId', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const list = await prisma.playlist.findFirst({
      where: { id: req.params.id, ownerId: req.userId! },
    });
    if (!list) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }
    await prisma.playlistTrack.deleteMany({
      where: { playlistId: list.id, trackId: req.params.trackId },
    });
    const remaining = await prisma.playlistTrack.findMany({
      where: { playlistId: list.id },
      orderBy: { position: 'asc' },
    });
    await prisma.$transaction(
      remaining.map((pt, index) =>
        prisma.playlistTrack.update({
          where: { id: pt.id },
          data: { position: index },
        })
      )
    );
    res.json({ ok: true });
  });

  app.put('/api/playlists/:id/reorder', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const order = (req.body as { orderedTrackIds?: string[] }).orderedTrackIds;
    if (!order || !Array.isArray(order)) {
      res.status(400).json({ error: 'orderedTrackIds array required' });
      return;
    }
    const list = await prisma.playlist.findFirst({
      where: { id: req.params.id, ownerId: req.userId! },
    });
    if (!list) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }
    const pts = await prisma.playlistTrack.findMany({
      where: { playlistId: list.id },
    });
    const idSet = new Set(pts.map((p) => p.trackId));
    if (order.length !== idSet.size || !order.every((id) => idSet.has(id))) {
      res.status(400).json({ error: 'Invalid order' });
      return;
    }
    await prisma.$transaction([
      ...order.map((trackId, i) =>
        prisma.playlistTrack.updateMany({
          where: { playlistId: list.id, trackId },
          data: { position: i + 10_000 },
        })
      ),
      ...order.map((trackId, i) =>
        prisma.playlistTrack.updateMany({
          where: { playlistId: list.id, trackId },
          data: { position: i },
        })
      ),
    ]);
    res.json({ ok: true });
  });

  app.get('/api/liked', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const likes = await prisma.like.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      include: { track: { include: trackInclude } },
    });
    res.json({
      id: 'liked-special',
      name: 'Liked Songs',
      description: 'Tracks you have liked',
      tracks: likes.map((l, i) => ({
        position: i,
        ...serializeTrack(req, l.track),
      })),
    });
  });

  app.get('/api/likes/:trackId', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const like = await prisma.like.findUnique({
      where: {
        userId_trackId: { userId: req.userId!, trackId: req.params.trackId },
      },
    });
    res.json({ liked: !!like });
  });

  app.post('/api/likes/:trackId', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    await prisma.like.upsert({
      where: {
        userId_trackId: { userId: req.userId!, trackId: req.params.trackId },
      },
      create: { userId: req.userId!, trackId: req.params.trackId },
      update: {},
    });
    res.json({ liked: true });
  });

  app.delete('/api/likes/:trackId', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    await prisma.like.deleteMany({
      where: { userId: req.userId!, trackId: req.params.trackId },
    });
    res.json({ liked: false });
  });

  app.post('/api/listen', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const trackId = (req.body as { trackId?: string }).trackId;
    if (!trackId) {
      res.status(400).json({ error: 'trackId required' });
      return;
    }
    await prisma.listen.create({
      data: { userId: req.userId!, trackId },
    });
    res.status(201).json({ ok: true });
  });

  app.get('/api/library/albums', authMiddleware(), async (_req: AuthedRequest, res: Response) => {
    const albums = await prisma.album.findMany({
      take: 40,
      orderBy: { title: 'asc' },
      include: { artist: true },
    });
    res.json(
      albums.map((a) => ({
        id: a.id,
        title: a.title,
        year: a.year,
        cover: a.cover,
        artist: { id: a.artist.id, name: a.artist.name },
      }))
    );
  });

  app.get('/api/library/artists', authMiddleware(), async (_req: AuthedRequest, res: Response) => {
    const artists = await prisma.artist.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(artists.map((a) => ({ id: a.id, name: a.name, image: a.image })));
  });

  app.delete('/api/playlists/:id', authMiddleware(), async (req: AuthedRequest, res: Response) => {
    const r = await prisma.playlist.deleteMany({
      where: { id: req.params.id, ownerId: req.userId! },
    });
    if (r.count === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });
}
