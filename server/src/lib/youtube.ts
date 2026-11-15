// Videos live on the TeachingCareer YouTube channel — the site only ever
// stores a link and the 11-character video id parsed from it, never a video
// file. Mirrored client-side in site/src/lib/youtube.ts (for the admin
// form's live thumbnail preview); this server copy is the one that decides
// what gets saved.

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'])

/**
 * Returns the video id for a standard YouTube link, or null if the input
 * isn't one. Accepts:
 *   https://www.youtube.com/watch?v=ID   (plus extra params like &t=30s)
 *   https://youtu.be/ID
 *   https://www.youtube.com/shorts/ID, /embed/ID, /live/ID
 */
export function parseYouTubeId(input: string): string | null {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.toLowerCase()
  let id: string | null = null

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    id = url.pathname.split('/')[1] ?? null
  } else if (YOUTUBE_HOSTS.has(host)) {
    if (url.pathname === '/watch') {
      id = url.searchParams.get('v')
    } else {
      const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/)
      id = match?.[1] ?? null
    }
  }

  return id && VIDEO_ID.test(id) ? id : null
}

export function youTubeThumbnailUrl(videoId: string) {
  // hqdefault exists for every public video (maxresdefault does not).
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}
