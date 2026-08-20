// -----------------------------------------------------------------------------
// Data source seam
// -----------------------------------------------------------------------------
// Single place where RSVP data is read/written. Today it persists in-browser
// (localStorage) and exports to CSV — no backend, no accounts, fully
// self-contained. When you're ready to send responses to a real backend / CMS
// (e.g. the "RSVPs" collection in the RSVP project docs), flip USE_LOCAL to
// false and fill in the three marked calls. Nothing else in the app changes.
// -----------------------------------------------------------------------------

const USE_LOCAL = true
const STORAGE_KEY = 'gtx_rsvp_responses'

// ---- Local (in-browser) implementation ----------------------------------

function storageAvailable() {
  try {
    const k = '__gtx_test__'
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

function localReadAll() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function localWriteAll(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable (e.g. private mode) — keep in-memory only */
  }
}

// In-memory mirror so the app still works if storage throws.
let memory = typeof window !== 'undefined' ? localReadAll() : []

// ---- Public API ----------------------------------------------------------

/**
 * Persist one RSVP.
 * @param {{name: string, response: 'yes'|'no', edition: string, pax?: number, note?: string}} entry
 * @returns {Promise<object>} the stored record (with id + timestamp)
 */
export async function submitRsvp(entry) {
  const record = {
    id:
      (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
      `r_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    name: entry.name.trim(),
    response: entry.response, // 'yes' | 'no'
    edition: entry.edition || 'singapore',
    pax: entry.pax ?? (entry.response === 'yes' ? 1 : 0),
    note: entry.note || '',
    timestamp: new Date().toISOString(),
  }

  if (USE_LOCAL) {
    memory = [...memory, record]
    localWriteAll(memory)
  } else {
    // TODO(backend): POST `record` to your API / CMS "RSVPs" collection.
    // await fetch('/api/rsvps', { method: 'POST', body: JSON.stringify(record) })
  }
  return record
}

/** Return all stored RSVPs, newest first. */
export async function getRsvps() {
  if (USE_LOCAL) {
    // Prefer persisted storage; fall back to the in-memory mirror when storage
    // is unavailable (e.g. a sandboxed preview) so responses still show.
    if (storageAvailable()) memory = localReadAll()
    return [...memory].reverse()
  }
  // TODO(backend): GET the list from your API / CMS.
  return []
}

/** Remove every stored RSVP (local only). */
export async function clearRsvps() {
  if (USE_LOCAL) {
    memory = []
    localWriteAll(memory)
  }
}

// ---- CSV export -----------------------------------------------------------

function csvEscape(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Build a CSV string from the stored RSVPs. */
export function toCsv(rows) {
  const header = ['Name', 'RSVP', 'Pax', 'Note', 'Edition', 'Timestamp']
  const body = rows.map((r) =>
    [
      csvEscape(r.name),
      csvEscape(r.response === 'yes' ? 'Yes, coming' : 'No, not coming'),
      csvEscape(r.pax),
      csvEscape(r.note),
      csvEscape(r.edition),
      csvEscape(r.timestamp),
    ].join(','),
  )
  return [header.join(','), ...body].join('\n')
}

/** Trigger a browser download of the RSVPs as a .csv file. */
export function downloadCsv(rows, filename = 'gt-connect-rsvps.csv') {
  const csv = toCsv(rows)
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
