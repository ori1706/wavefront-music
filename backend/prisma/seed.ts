import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const artistsData = [
  {
    name: 'Nox Horizon',
    image: 'https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?w=800&h=800&fit=crop',
    bio: 'Berlin-born producer crafting midnight electronics and analog warmth.',
  },
  {
    name: 'Mara Bloom',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop',
    bio: 'Indie songwriter with confessional lyrics and sparkling guitar lines.',
  },
  {
    name: 'The Velvet Circuit',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop',
    bio: 'Four-piece band merging stadium hooks with lo-fi textures.',
  },
  {
    name: 'Kai Rivers',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
    bio: 'Sharp verses and laid-back beats from the Pacific Northwest.',
  },
  {
    name: 'Solstice Trio',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&h=800&fit=crop',
    bio: 'Acoustic jazz collective playing late sets in candlelit rooms.',
  },
  {
    name: 'Echo District',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=800&fit=crop',
    bio: 'Ambient soundscapes built for deep focus and slow motion commutes.',
  },
  {
    name: 'Luna Fallows',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=800&fit=crop',
    bio: 'Alt-pop vocalist layering airy stacks over punchy synth bass.',
  },
  {
    name: 'Carter West',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop',
    bio: 'Fingerpicked folk stories with roomy harmonica and tape saturation.',
  },
];

const albumsData: { title: string; year: number; artistIndex: number; cover: string }[] = [
  { title: 'Neon Drift', year: 2024, artistIndex: 0, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop' },
  { title: 'Afterglow Devices', year: 2022, artistIndex: 0, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop' },
  { title: 'Paper Moons', year: 2025, artistIndex: 1, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop' },
  { title: 'Sideways Light', year: 2021, artistIndex: 1, cover: 'https://images.unsplash.com/photo-1455587731205-0ace40a48289?w=600&h=600&fit=crop' },
  { title: 'Static Bloom', year: 2023, artistIndex: 2, cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop' },
  { title: 'Midnight Voltage', year: 2020, artistIndex: 2, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop&q=80' },
  { title: 'River Roads', year: 2024, artistIndex: 3, cover: 'https://images.unsplash.com/photo-1571266028243-e4733f23bcfb?w=600&h=600&fit=crop' },
  { title: 'Low Tide Suite', year: 2019, artistIndex: 3, cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=600&fit=crop' },
  { title: 'Blue Note Basement', year: 2022, artistIndex: 4, cover: 'https://images.unsplash.com/photo-1415201364774-f6f0ee35e39a?w=600&h=600&fit=crop' },
  { title: 'Sunday Standard', year: 2025, artistIndex: 4, cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=600&fit=crop' },
  { title: 'Glass Houses', year: 2021, artistIndex: 5, cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=600&fit=crop' },
  { title: 'Still Frames', year: 2023, artistIndex: 5, cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&h=600&fit=crop' },
  { title: 'Satellite Heart', year: 2024, artistIndex: 6, cover: 'https://images.unsplash.com/photo-1494232410401-25d53b2ea0c0?w=600&h=600&fit=crop' },
  { title: 'Wilder Days', year: 2020, artistIndex: 7, cover: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=600&fit=crop' },
];

const trackTitles = [
  'Lost Frequencies',
  'Slow Bloom',
  'Circuit Dreams',
  'Low Orbit',
  'Paper Lanterns',
  'Ghost Choir',
  'Coastal Static',
  'Neon Tears',
  'Sideways Rain',
  'Magnetic North',
  'Velvet Fix',
  'Midnight Switch',
  'Echo Chamber',
  'Silver Tongue',
  'River Glass',
  'Lowkey Anthem',
  'Afterhours',
  'Quiet Storm',
  'Basement Sky',
  'Half Light',
  'Still Water',
  'Deep Cut',
  'Satellite Call',
  'Warm Signal',
  'Harbor Lights',
  'Wild Honey',
  'Tape Hiss Lullaby',
  'Open Window',
  'Night Bus',
  'Signal Fire',
  'Gravity Well',
  'Northern Glow',
  'Last Call Waltz',
];

function samplePath(i: number): string {
  const n = (i % 8) + 1;
  return `/audio/sample-${n}.mp3`;
}

async function main() {
  await prisma.$transaction([
    prisma.playlistTrack.deleteMany(),
    prisma.playlist.deleteMany(),
    prisma.listen.deleteMany(),
    prisma.like.deleteMany(),
    prisma.track.deleteMany(),
    prisma.album.deleteMany(),
    prisma.artist.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const user = await prisma.user.create({
    data: { email: 'demo@wavefront.audio', name: 'Demo User' },
  });

  const artistRecords = [];
  for (const a of artistsData) {
    artistRecords.push(
      await prisma.artist.create({
        data: { name: a.name, image: a.image, bio: a.bio },
      })
    );
  }

  const albumRecords = [];
  for (const al of albumsData) {
    const artist = artistRecords[al.artistIndex];
    if (!artist) throw new Error('Artist index');
    albumRecords.push(
      await prisma.album.create({
        data: {
          title: al.title,
          year: al.year,
          cover: al.cover,
          artistId: artist.id,
        },
      })
    );
  }

  const perAlbumIndex = new Map<string, number>();
  const trackIds: string[] = [];
  for (let i = 0; i < trackTitles.length; i++) {
    const album = albumRecords[i % albumRecords.length];
    const artistIdx = albumsData[i % albumsData.length].artistIndex;
    const artist = artistRecords[artistIdx];
    if (!album || !artist) throw new Error('Album/artist');
    const prev = perAlbumIndex.get(album.id) ?? 0;
    const trackNumber = prev + 1;
    perAlbumIndex.set(album.id, trackNumber);
    const t = await prisma.track.create({
      data: {
        title: trackTitles[i]!,
        durationSeconds: 210 + ((i * 7) % 120),
        audioUrl: samplePath(i),
        trackNumber,
        albumId: album.id,
        artistId: artist.id,
      },
    });
    trackIds.push(t.id);
  }

  const chill = await prisma.playlist.create({
    data: {
      ownerId: user.id,
      name: 'Chill Vibes',
      description: 'Soft lights, slower tempos, room to breathe.',
      cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
    },
  });
  const focus = await prisma.playlist.create({
    data: {
      ownerId: user.id,
      name: 'Focus Flow',
      description: 'Steady grooves for heads-down work sessions.',
      cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=600&fit=crop',
    },
  });
  const late = await prisma.playlist.create({
    data: {
      ownerId: user.id,
      name: 'Late Night',
      description: 'After midnight palettes and hushed vocals.',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop',
    },
  });

  const chillTracks = trackIds.slice(0, 11);
  const focusTracks = trackIds.slice(10, 21);
  const lateTracks = trackIds.slice(20, 32);

  await prisma.playlistTrack.createMany({
    data: chillTracks.map((trackId, position) => ({
      playlistId: chill.id,
      trackId,
      position,
    })),
  });
  await prisma.playlistTrack.createMany({
    data: focusTracks.map((trackId, position) => ({
      playlistId: focus.id,
      trackId,
      position,
    })),
  });
  await prisma.playlistTrack.createMany({
    data: lateTracks.map((trackId, position) => ({
      playlistId: late.id,
      trackId,
      position,
    })),
  });

  const liked =
    [trackIds[2], trackIds[5], trackIds[8], trackIds[12], trackIds[19], trackIds[24]].filter(
      Boolean
    ) as string[];
  for (const trackId of liked) {
    await prisma.like.create({ data: { userId: user.id, trackId } });
  }

  const recent = [trackIds[1], trackIds[4], trackIds[9], trackIds[15], trackIds[22]];
  for (const trackId of recent) {
    await prisma.listen.create({
      data: {
        userId: user.id,
        trackId,
        listenedAt: new Date(Date.now() - recent.indexOf(trackId) * 3600_000),
      },
    });
  }

  console.log('Seed complete: Wavefront demo library ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
