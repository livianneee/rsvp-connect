// -----------------------------------------------------------------------------
// Guest name resolution
// -----------------------------------------------------------------------------
// Personalises the "Dear …" greeting from the URL path:
//   https://.../liviane   => "Liviane"
//   https://.../jane-doe  => "Jane Doe"   (hyphens/underscores become spaces)
//   https://.../          => "Guest"      (default)
//
// The path route relies on the SPA rewrite in vercel.json so /liviane serves the app.
// -----------------------------------------------------------------------------
 
// Path segments that are NOT guest names (app routes, asset folders, files).
const RESERVED = new Set(['', 'index.html', 'admin', 'assets', 'favicon'])
 
export function titleCase(raw) {
  return raw
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .trim()
}
 
// Raw first path segment (decoded), or '' if none/reserved.
function firstSegment(pathname = '/') {
  let seg = ''
  try {
    seg = decodeURIComponent((pathname || '/').split('/').filter(Boolean)[0] || '')
  } catch {
    seg = ''
  }
  if (seg && !seg.includes('.') && !RESERVED.has(seg.toLowerCase())) return seg
  return ''
}
 
export function getGuestName(pathname = '/') {
  const seg = firstSegment(pathname)
  if (seg) {
    const name = titleCase(seg)
    if (name) return name
  }
  return 'Guest'
}
 
// Turn any text into a stable url-safe slug: "Jane Doe" -> "jane-doe".
export function slugify(text = '') {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
 
// Stable per-guest key used to enforce one RSVP per invite link.
// Uses the link's path slug when present; otherwise derives one from the name.
export function getGuestSlug(pathname = '/', fallbackName = '') {
  return slugify(firstSegment(pathname)) || slugify(fallbackName)
}