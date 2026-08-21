import { useEffect, useState } from 'react'
import Hero from './Hero.jsx'
import Divider from './Divider.jsx'
import RsvpButtons from './RsvpButtons.jsx'
import NameDialog from './NameDialog.jsx'
import EventDetails from './EventDetails.jsx'
import Footer from './Footer.jsx'
import { submitRsvp, updateRsvp, getRsvpStatus } from '../lib/dataSource.js'

export default function RsvpPage({ edition, guestName, guestSlug }) {
  // 'loading' while we check the DB, then 'new' (no response yet) or 'responded'.
  const [status, setStatus] = useState('loading')
  const [record, setRecord] = useState(null) // current response { name, response }
  const [changing, setChanging] = useState(false) // picking a new answer to replace the old
  const [pending, setPending] = useState(null) // 'yes' | 'no' while dialog is open
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const greeting = guestName || 'Guest'
  // The name is locked to the invite link (path). Only the generic link with no
  // name falls back to an editable field.
  const nameLocked = Boolean(guestName && guestName !== 'Guest')

  // On load, ask the database whether this link already responded.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const found = await getRsvpStatus(guestSlug)
        if (!active) return
        if (found) {
          setRecord(found)
          setStatus('responded')
        } else {
          setStatus('new')
        }
      } catch (err) {
        // If the check fails, fall back to letting them respond.
        if (active) setStatus('new')
        console.error('RSVP status check failed:', err)
      }
    })()
    return () => {
      active = false
    }
  }, [guestSlug])

  function openDialog(response) {
    setSubmitError('')
    setPending(response)
  }

  async function handleSubmitName(name) {
    setSaving(true)
    setSubmitError('')
    const entry = { name, response: pending, edition: edition.slug, slug: guestSlug }
    const isUpdate = status === 'responded' || changing
    try {
      let rec
      if (isUpdate) {
        rec = await updateRsvp(entry)
      } else {
        try {
          rec = await submitRsvp(entry)
        } catch (err) {
          // Row already exists for this link -> switch to updating it.
          if (err?.code === 'DUPLICATE') rec = await updateRsvp(entry)
          else throw err
        }
      }
      setRecord(rec)
      setStatus('responded')
      setChanging(false)
      setPending(null)
    } catch (err) {
      setSubmitError('Sorry, we couldn’t save your RSVP. Please check your connection and try again.')
      console.error('RSVP save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const showButtons = status === 'new' || changing

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-navy pb-20">
      <Hero edition={edition} />

      <main className="flex w-full flex-col items-center gap-12 px-6 pb-12">
        {/* Dear #NAME */}
        <p className="inline-flex items-center gap-2 border-b border-white/90 px-2 py-1.5 text-2xl text-white">
          <span className="font-sans">Dear</span>
          <span className="font-sans italic">{greeting}</span>
        </p>

        {/* Invitation copy + RSVP */}
        <section className="flex w-full max-w-content flex-col items-center gap-6">
          <div className="space-y-3 text-center">
            {edition.intro.map((para, i) => (
              <p key={i} className="font-script text-[22px] leading-snug text-white sm:text-2xl">
                {para}
              </p>
            ))}
          </div>

          {status === 'loading' ? (
            <p className="pt-2 font-sans text-sm text-white/70">Checking your invitation…</p>
          ) : showButtons ? (
            <>
              {changing && (
                <p className="text-center font-sans text-sm text-gold-soft">
                  Updating your response — pick your new answer below.
                </p>
              )}
              <RsvpButtons onRespond={openDialog} />
              {changing && (
                <button
                  type="button"
                  onClick={() => setChanging(false)}
                  className="font-sans text-sm text-white/60 underline underline-offset-4 hover:text-white"
                >
                  Never mind, keep my answer
                </button>
              )}
            </>
          ) : (
            <Confirmation record={record} onUpdate={() => setChanging(true)} />
          )}

          <p className="max-w-content text-center font-sans text-xs font-medium tracking-wide text-white">
            {edition.transferNote}
          </p>
        </section>

        <Divider />

        <EventDetails details={edition.details} />

        <Divider />
      </main>

      <Footer footer={edition.footer} />

      {pending && (
        <NameDialog
          response={pending}
          lockedName={nameLocked ? greeting : ''}
          defaultName={record?.name || ''}
          saving={saving}
          errorMessage={submitError}
          onCancel={() => (saving ? null : setPending(null))}
          onSubmit={handleSubmitName}
        />
      )}
    </div>
  )
}

// Shown when this link has already responded. Update is always available.
function Confirmation({ record, onUpdate }) {
  const isYes = record.response === 'yes'
  return (
    <div className="flex w-full flex-col items-center gap-3 pt-2 text-center animate-fade-up">
      <div
        className="flex flex-col items-center gap-2 rounded-2xl px-6 py-5"
        style={{
          backgroundColor: isYes ? 'rgba(217,182,130,0.15)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${isYes ? 'rgba(217,182,130,0.5)' : 'rgba(255,255,255,0.2)'}`,
        }}
      >
        <p className="font-sans text-lg font-semibold text-gold-soft">
          {isYes ? '🎉 You’re confirmed!' : 'Response received'}
        </p>
        <p className="font-sans text-base text-white">
          {isYes ? (
            <>Thank you, <span className="font-semibold">{record.name}</span> — we can’t wait to see you there.</>
          ) : (
            <>Thanks, <span className="font-semibold">{record.name}</span> — we’ll miss you, and hope to connect next time.</>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={onUpdate}
        className="font-sans text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white"
      >
        Update my response
      </button>
    </div>
  )
}
