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

export function getGuestName(pathname = '/') {
  let seg = ''
  try {
    seg = decodeURIComponent((pathname || '/').split('/').filter(Boolean)[0] || '')
  } catch {
    seg = ''
  }
  if (seg && !seg.includes('.') && !RESERVED.has(seg.toLowerCase())) {
    const name = titleCase(seg)
    if (name) return name
  }
  return 'Guest'
}
