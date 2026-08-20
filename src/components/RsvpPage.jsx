import { useState } from 'react'
import Hero from './Hero.jsx'
import Divider from './Divider.jsx'
import RsvpButtons from './RsvpButtons.jsx'
import NameDialog from './NameDialog.jsx'
import EventDetails from './EventDetails.jsx'
import Footer from './Footer.jsx'
import { submitRsvp } from '../lib/dataSource.js'

export default function RsvpPage({ edition, guestName }) {
  const [pending, setPending] = useState(null) // 'yes' | 'no' while dialog is open
  const [confirmed, setConfirmed] = useState(null) // stored record after submit
  const [saving, setSaving] = useState(false)

  const greeting = guestName || 'Guest'

  async function handleSubmitName(name) {
    setSaving(true)
    const record = await submitRsvp({ name, response: pending, edition: edition.slug })
    setSaving(false)
    setConfirmed(record)
    setPending(null)
  }

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

          {confirmed ? (
            <Confirmation record={confirmed} onChange={() => setConfirmed(null)} />
          ) : (
            <RsvpButtons onRespond={(r) => setPending(r)} />
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
          defaultName={guestName && guestName !== 'Guest' ? guestName : ''}
          onCancel={() => (saving ? null : setPending(null))}
          onSubmit={handleSubmitName}
        />
      )}
    </div>
  )
}

// Replaces the buttons once a response is recorded.
function Confirmation({ record, onChange }) {
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
        onClick={onChange}
        className="font-sans text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-white"
      >
        Change my response
      </button>
    </div>
  )
}
