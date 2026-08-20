import { useEffect, useRef, useState } from 'react'

// Modal that collects the guest's name after they pick Yes / No.
// This is where the RSVP data (name + response) is captured before it is stored.
export default function NameDialog({ response, defaultName = '', onCancel, onSubmit }) {
  const [name, setName] = useState(defaultName)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const isYes = response === 'yes'

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('Please enter your name so we can register your RSVP.')
      return
    }
    onSubmit(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsvp-dialog-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        className="w-full max-w-md animate-fade-up rounded-2xl bg-white p-6 text-ink shadow-2xl sm:p-8"
        style={{ colorScheme: 'light' }}
      >
        {/* Accent chip so the two paths read differently at a glance */}
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-poppins text-xs font-semibold"
          style={
            isYes
              ? { backgroundColor: 'rgba(217,182,130,0.22)', color: '#8a6321' }
              : { backgroundColor: 'rgba(37,64,109,0.10)', color: '#25406d' }
          }
        >
          {isYes ? 'Yes, I’m coming' : 'No, can’t make it'}
        </span>

        <h2 id="rsvp-dialog-title" className="mt-3 font-sans text-2xl font-bold text-ink">
          {isYes ? 'Confirm your RSVP' : 'Let us know it’s you'}
        </h2>
        <p className="mt-2 font-sans text-sm text-ink/60">
          {isYes
            ? 'Enter your name to confirm your spot at GT Connect Singapore.'
            : 'Enter your name so we can note that you can’t make it.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="rsvp-name" className="font-sans text-sm font-medium text-ink/80">
            Your name
          </label>
          <input
            id="rsvp-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            placeholder="e.g. Olivia Yulianne"
            autoComplete="name"
            style={{ colorScheme: 'light', backgroundColor: '#ffffff', color: '#242424' }}
            className="mt-1.5 w-full rounded-lg border border-ink/20 bg-white px-4 py-3 font-sans text-base text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/40"
          />
          {error && <p className="mt-2 font-sans text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-ink/15 px-5 py-2.5 font-poppins text-sm text-ink/70 transition-colors hover:bg-ink/5"
            >
              Back
            </button>
            <button
              type="submit"
              className="rounded-full px-6 py-2.5 font-poppins text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
              style={
                isYes
                  ? { backgroundColor: '#d9b682', color: '#242424' }
                  : { backgroundColor: '#25406d', color: '#ffffff' }
              }
            >
              {isYes ? 'Confirm attendance' : 'Send response'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
