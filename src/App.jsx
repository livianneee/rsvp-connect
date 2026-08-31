import { useEffect, useState } from 'react'
import RsvpPage from './components/RsvpPage.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import { getEdition } from './data/editions.js'
import { getGuestName, getGuestSlug } from './lib/guest.js'

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const edition = getEdition(params.get('edition'))
  // Personalise the "Dear …" greeting from the URL path:
  //   /liviane -> "Liviane"   |   / -> "Guest"
  const guestName = getGuestName(window.location.pathname)
  // Stable per-link key used to enforce one RSVP per invite link.
  const guestSlug = getGuestSlug(window.location.pathname, guestName)

  const [admin, setAdmin] = useState(params.get('admin') === '1')

  // Press "a" (outside inputs) to open the collector view.
  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(e.target.tagName)
      if (!typing && (e.key === 'a' || e.key === 'A')) setAdmin(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (admin) return <AdminPanel onClose={() => setAdmin(false)} />
  return <RsvpPage edition={edition} guestName={guestName} guestSlug={guestSlug} />
}
