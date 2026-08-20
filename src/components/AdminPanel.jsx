import { useEffect, useState } from 'react'
import { getRsvps, clearRsvps, downloadCsv, BACKEND } from '../lib/dataSource.js'
import { ADMIN_PASSCODE } from '../config.js'
import { getSession, onAuthChange, signIn, signOut } from '../lib/supabaseClient.js'

const UNLOCK_KEY = 'gtx_admin_unlocked'

// Collector view. Open with ?admin=1 (or press "a" on the page).
// - Supabase mode: gated behind a real Supabase Auth login (organizer account).
// - Local mode:    gated behind the client-side passcode.
export default function AdminPanel({ onClose }) {
  if (BACKEND === 'supabase') return <SupabaseAdmin onClose={onClose} />
  return <LocalAdmin onClose={onClose} />
}

// --- Local (browser) mode: passcode gate --------------------------------------
function LocalAdmin({ onClose }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return window.sessionStorage.getItem(UNLOCK_KEY) === '1'
    } catch {
      return false
    }
  })

  if (!unlocked) {
    return <PasscodeGate onClose={onClose} onUnlock={() => setUnlocked(true)} />
  }
  return <Collector onClose={onClose} />
}

// --- Supabase mode: real auth gate --------------------------------------------
function SupabaseAdmin({ onClose }) {
  const [session, setSession] = useState(undefined) // undefined = still checking

  useEffect(() => {
    let active = true
    getSession().then((s) => active && setSession(s))
    const unsub = onAuthChange((s) => setSession(s))
    return () => {
      active = false
      unsub()
    }
  }, [])

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <p className="font-sans text-sm text-white/70">Loading…</p>
      </div>
    )
  }

  if (!session) return <LoginGate onClose={onClose} />
  return <Collector onClose={onClose} onSignOut={signOut} userEmail={session.user?.email} />
}

// Supabase email/password login for organizers.
function LoginGate({ onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email.trim(), password)
      // onAuthChange in SupabaseAdmin will pick up the new session.
    } catch (err) {
      setError(err?.message || 'Sign in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-navy p-4"
      style={{ colorScheme: 'light' }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-ink shadow-2xl sm:p-8"
      >
        <h1 className="font-sans text-xl font-bold">Organizer sign in</h1>
        <p className="mt-1 font-sans text-sm text-ink/60">
          Sign in to view RSVP responses.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="username"
          autoFocus
          style={{ colorScheme: 'light', backgroundColor: '#ffffff', color: '#242424' }}
          className="mt-4 w-full rounded-lg border border-ink/20 bg-white px-4 py-3 font-sans text-base text-ink placeholder:text-ink/35 outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          style={{ colorScheme: 'light', backgroundColor: '#ffffff', color: '#242424' }}
          className="mt-3 w-full rounded-lg border border-ink/20 bg-white px-4 py-3 font-sans text-base text-ink placeholder:text-ink/35 outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
        {error && <p className="mt-2 font-sans text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/15 px-5 py-2.5 font-sans text-sm text-ink/70 hover:bg-ink/5"
          >
            ← Invitation
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full px-6 py-2.5 font-sans text-sm font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: '#25406d' }}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Passcode screen shown before the collector view.
function PasscodeGate({ onClose, onUnlock }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (code === ADMIN_PASSCODE) {
      try {
        window.sessionStorage.setItem(UNLOCK_KEY, '1')
      } catch {
        /* ignore */
      }
      onUnlock()
    } else {
      setError('Incorrect passcode.')
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-navy p-4"
      style={{ colorScheme: 'light' }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-ink shadow-2xl sm:p-8"
      >
        <h1 className="font-sans text-xl font-bold">Collector access</h1>
        <p className="mt-1 font-sans text-sm text-ink/60">
          Enter the passcode to view RSVP responses.
        </p>
        <input
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            if (error) setError('')
          }}
          placeholder="Passcode"
          autoFocus
          style={{ colorScheme: 'light', backgroundColor: '#ffffff', color: '#242424' }}
          className="mt-4 w-full rounded-lg border border-ink/20 bg-white px-4 py-3 font-sans text-base text-ink placeholder:text-ink/35 outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
        />
        {error && <p className="mt-2 font-sans text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/15 px-5 py-2.5 font-sans text-sm text-ink/70 hover:bg-ink/5"
          >
            ← Invitation
          </button>
          <button
            type="submit"
            className="rounded-full px-6 py-2.5 font-sans text-sm font-medium text-white"
            style={{ backgroundColor: '#25406d' }}
          >
            Unlock
          </button>
        </div>
      </form>
    </div>
  )
}

function Collector({ onClose, onSignOut, userEmail }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const isSupabase = BACKEND === 'supabase'

  async function refresh() {
    setLoading(true)
    setLoadError('')
    try {
      setRows(await getRsvps())
    } catch (err) {
      setRows([])
      setLoadError(err?.message || 'Could not load responses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const yes = rows.filter((r) => r.response === 'yes')
  const no = rows.filter((r) => r.response === 'no')
  const pax = yes.reduce((sum, r) => sum + (Number(r.pax) || 0), 0)

  async function handleClear() {
    if (window.confirm('Delete all stored RSVPs on this browser? This cannot be undone.')) {
      await clearRsvps()
      refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-ink sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-sans text-2xl font-bold">RSVP responses</h1>
            <p className="mt-0.5 font-sans text-xs text-ink/50">
              Storage:{' '}
              {isSupabase ? 'Supabase (shared across all devices)' : 'this browser only'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onSignOut && (
              <button
                type="button"
                onClick={() => onSignOut()}
                className="rounded-full border border-ink/20 px-4 py-2 font-sans text-sm hover:bg-ink/5"
                title={userEmail ? `Signed in as ${userEmail}` : undefined}
              >
                Sign out
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-ink/20 px-4 py-2 font-sans text-sm hover:bg-ink/5"
            >
              ← Back to invitation
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total" value={rows.length} />
          <Stat label="Coming" value={yes.length} accent="#16794a" />
          <Stat label="Not coming" value={no.length} accent="#b4432b" />
          <Stat label="Total pax" value={pax} accent="#a97f3c" />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadCsv(rows)}
            disabled={rows.length === 0}
            className="rounded-full bg-ink px-5 py-2.5 font-sans text-sm text-white disabled:opacity-40"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={refresh}
            className="rounded-full border border-ink/20 px-5 py-2.5 font-sans text-sm hover:bg-ink/5"
          >
            Refresh
          </button>
          {!isSupabase && (
            <button
              type="button"
              onClick={handleClear}
              disabled={rows.length === 0}
              className="rounded-full border border-red-300 px-5 py-2.5 font-sans text-sm text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-ink/10 bg-white">
          {loading ? (
            <p className="p-6 text-center font-sans text-sm text-ink/50">Loading…</p>
          ) : loadError ? (
            <div className="p-6 text-center font-sans text-sm">
              <p className="text-red-600">Couldn’t load responses: {loadError}</p>
              {isSupabase && (
                <p className="mt-2 text-ink/50">
                  If you’re using Supabase, make sure you’re signed in as an organizer and
                  the SELECT policy for authenticated users exists — or view responses
                  directly in the Supabase dashboard.
                </p>
              )}
            </div>
          ) : rows.length === 0 ? (
            <p className="p-6 text-center font-sans text-sm text-ink/50">
              No responses yet. RSVPs submitted on the invitation will appear here.
            </p>
          ) : (
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-ink/10 bg-slate-50 text-ink/60">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">RSVP</th>
                  <th className="px-4 py-3 font-medium">Pax</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                        style={
                          r.response === 'yes'
                            ? { background: '#dff3e8', color: '#16794a' }
                            : { background: '#fbe4de', color: '#b4432b' }
                        }
                      >
                        {r.response === 'yes' ? 'Coming' : 'Not coming'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.pax}</td>
                    <td className="px-4 py-3 text-ink/60">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-4 font-sans text-xs text-ink/50">
          {isSupabase ? (
            <>
              Responses are stored in Supabase and shared across all devices. Reads are
              protected by Supabase Auth + RLS — only signed-in organizers can view this
              list.
            </>
          ) : (
            <>
              Responses are stored in this browser only. Set the Supabase env vars to
              collect them in one shared place — see the README.
            </>
          )}
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <p className="font-sans text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 font-sans text-3xl font-bold" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </div>
  )
}
