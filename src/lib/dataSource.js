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
    slug: row.slug || '',
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
    slug: entry.slug || '', // per-invite-link key; unique in the DB
  }
 
  if (BACKEND === 'supabase') {
    // No .select() here on purpose: guests (anon) can INSERT but not SELECT under
    // the secure RLS policies, so reading the row back would be denied. We just
    // insert and build the confirmation record locally.
    const { error } = await supabase.from(TABLE).insert(base)
    if (error) {
      // 23505 = unique_violation -> this link already RSVP'd.
      if (error.code === '23505') throw new DuplicateRsvpError()
      throw new Error(error.message)
    }
    return { id: `sb_${Date.now()}`, ...base, timestamp: new Date().toISOString() }
  }
 
  // local
  if (base.slug) {
    memory = storageAvailable() ? localReadAll() : memory
    if (memory.some((r) => r.slug === base.slug)) throw new DuplicateRsvpError()
  }
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
 
// Thrown when an invite link has already submitted an RSVP.
export class DuplicateRsvpError extends Error {
  constructor() {
    super('This invite has already responded.')
    this.name = 'DuplicateRsvpError'
    this.code = 'DUPLICATE'
  }
}
 
/**
 * Update the existing RSVP for an invite link (the "change once" flow).
 * One row per slug already exists; this overwrites its response/name/pax.
 */
export async function updateRsvp(entry) {
  const patch = {
    name: entry.name.trim(),
    response: entry.response,
    pax: entry.pax ?? (entry.response === 'yes' ? 1 : 0),
    note: entry.note || '',
  }
 
  if (BACKEND === 'supabase') {
    const { error } = await supabase.from(TABLE).update(patch).eq('slug', entry.slug)
    if (error) throw new Error(error.message)
    return { id: `sb_${Date.now()}`, ...patch, edition: entry.edition || 'singapore', slug: entry.slug, timestamp: new Date().toISOString() }
  }
 
  // local
  if (storageAvailable()) memory = localReadAll()
  let updated = null
  memory = memory.map((r) => {
    if (r.slug === entry.slug) {
      updated = { ...r, ...patch, timestamp: new Date().toISOString() }
      return updated
    }
    return r
  })
  localWriteAll(memory)
  return updated || { id: `r_${Date.now()}`, ...patch, slug: entry.slug, timestamp: new Date().toISOString() }
}
 
/**
 * Look up whether a specific invite link (slug) has already responded.
 * Returns { name, response, slug } or null. Used on page load to decide whether
 * to show the RSVP buttons or the "update your response" view.
 *
 * In Supabase mode this calls a security-definer RPC that returns ONLY the row
 * for the given slug, so the public anon key can't list everyone's responses.
 */
export async function getRsvpStatus(slug) {
  if (!slug) return null
 
  if (BACKEND === 'supabase') {
    const { data, error } = await supabase.rpc('get_rsvp_status', { p_slug: slug })
    if (error) throw new Error(error.message)
    const row = Array.isArray(data) ? data[0] : data
    return row ? { name: row.name, response: row.response, slug } : null
  }
 
  // local
  if (storageAvailable()) memory = localReadAll()
  const r = memory.find((x) => x.slug === slug)
  return r ? { name: r.name, response: r.response, slug } : null
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