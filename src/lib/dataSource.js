// -----------------------------------------------------------------------------
// Data source seam
// -----------------------------------------------------------------------------
// One place where RSVP data is read/written. Two backends:
//
//   • supabase  — used automatically when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
//                 are set. Responses go to a shared Supabase table (see README).
//   • local     — fallback when those env vars are absent. Stores in this browser
//                 (localStorage). Good for quick local testing.
//
// The rest of the app doesn't care which backend is active.
// -----------------------------------------------------------------------------
 
import { supabase, hasSupabase } from './supabaseClient.js'
 
export const BACKEND = hasSupabase ? 'supabase' : 'local'
const TABLE = 'rsvps'
const STORAGE_KEY = 'gtx_rsvp_responses'
 
// ---- Local (in-browser) helpers ------------------------------------------
 
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
    /* storage unavailable — keep in-memory only */
  }
}
 
let memory = typeof window !== 'undefined' ? localReadAll() : []
 
// Normalise a Supabase row to the shape the UI expects.
function normalize(row) {
  return {
    id: row.id,
    name: row.name,
    response: row.response,
    pax: row.pax,
    note: row.note || '',
    edition: row.edition || 'singapore',
    timestamp: row.created_at || row.timestamp,
  }
}
 
// ---- Public API -----------------------------------------------------------
 
/**
 * Persist one RSVP.
 * @param {{name: string, response: 'yes'|'no', edition?: string, pax?: number, note?: string}} entry
 * @returns {Promise<object>} the stored record
 */
export async function submitRsvp(entry) {
  const base = {
    name: entry.name.trim(),
    response: entry.response, // 'yes' | 'no'
    edition: entry.edition || 'singapore',
    pax: entry.pax ?? (entry.response === 'yes' ? 1 : 0),
    note: entry.note || '',
  }
 
  if (BACKEND === 'supabase') {
    // No .select() here on purpose: guests (anon) can INSERT but not SELECT under
    // the secure RLS policies, so reading the row back would be denied. We just
    // insert and build the confirmation record locally.
    const { error } = await supabase.from(TABLE).insert(base)
    if (error) throw new Error(error.message)
    return { id: `sb_${Date.now()}`, ...base, timestamp: new Date().toISOString() }
  }
 
  // local
  const record = {
    id:
      (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
      `r_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    ...base,
    timestamp: new Date().toISOString(),
  }
  memory = [...memory, record]
  localWriteAll(memory)
  return record
}
 
/** Return all stored RSVPs, newest first. */
export async function getRsvps() {
  if (BACKEND === 'supabase') {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data || []).map(normalize)
  }
 
  // local
  if (storageAvailable()) memory = localReadAll()
  return [...memory].reverse()
}
 
/** Remove every stored RSVP. Local backend only. */
export async function clearRsvps() {
  if (BACKEND === 'supabase') {
    throw new Error(
      'Clearing is disabled for Supabase. Delete rows in the Supabase dashboard instead.',
    )
  }
  memory = []
  localWriteAll(memory)
}
 
// ---- CSV export -----------------------------------------------------------
 
function csvEscape(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
 
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