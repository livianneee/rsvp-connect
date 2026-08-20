// -----------------------------------------------------------------------------
// App config
// -----------------------------------------------------------------------------

// Passcode for the admin / collector view (?admin=1 or pressing "a").
//
// It reads from the VITE_ADMIN_PASSCODE environment variable if set (recommended
// on Vercel, so the value stays out of the git repo), otherwise falls back to
// the default below.
//
// NOTE: this is a static site with no backend, so whatever passcode is used ends
// up inside the page's JavaScript bundle at build time — it's a deterrent that
// stops casual guests from opening the response list, not hard security. For
// truly private data, move storage to a backend (see src/lib/dataSource.js).
export const ADMIN_PASSCODE =
  import.meta.env.VITE_ADMIN_PASSCODE || 'GTConnect2026'
