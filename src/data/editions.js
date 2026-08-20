// -----------------------------------------------------------------------------
// Editions data
// -----------------------------------------------------------------------------
// Multi-edition template: every piece of per-event copy lives here, keyed by slug.
// The active edition is chosen from the URL (?edition=<slug>), defaulting to
// `singapore`. Adding a new event = adding one object below — no component changes.
//
// This mirrors the `editions.js` model described in the RSVP project docs.
// -----------------------------------------------------------------------------

import heroSingapore from '../assets/images/hero-singapore.jpg'
import logoGtConnect from '../assets/images/logo-gt-connect.png'

export const editions = {
  singapore: {
    slug: 'singapore',
    editionName: 'Singapore Edition',
    tagline: 'By invite only',
    // Real "SINGAPORE EDITION / GlobalTix Connect" logo (white, transparent).
    // When `logo` is set, Hero renders it in place of the text wordmark below.
    logo: logoGtConnect,
    // Text fallback used only when `logo` is null.
    brand: { part1: 'GlobalTix', part2: 'Connect' },

    intro: [
      'The GlobalTix network has grown—and it’s time to bring our community together. ✨',
      'You’re exclusively invited to GT Connect Singapore, an intimate evening for our partners to reconnect, exchange ideas and discover new opportunities across the travel ecosystem.',
      'We’d love to have you with us. Please RSVP below.',
    ],

    transferNote: 'This invitation is extended exclusively and is not transferable.',

    details: {
      date: { label: 'DATE', primary: '22nd October, Thursday', secondary: '5.00 pm - 9.00 pm' },
      registration: { label: 'REGISTRATION', primary: '4:30 PM', secondary: 'Ahead of programme start' },
      location: { label: 'LOCATION', primary: 'café nesuto', secondary: '@ Marina Bay Sands' },
      address: '2 Bayfront Avenue, The Shoppes, #01-87, Marina Bay Sands, Singapore 018972',
    },

    footer: {
      lines: [
        'Questions about your invitation? Reach out to your account manager.',
        'Please do not forward this invitation—it is registered to one guest only.',
      ],
    },

    // Real Marina Bay Sands hero photo. Set to `null` to fall back to the
    // twilight-gradient hero (see Hero.jsx).
    heroImage: heroSingapore,
  },
}

export function getEdition(slug) {
  return editions[slug] || editions.singapore
}
