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
import sponsorMavic from '../assets/images/sponsor-mavic.png'
import sponsorAirwallex from '../assets/images/sponsor-airwallex.png'
import logoGlobaltixDark from '../assets/images/logo-globaltix-dark.png'

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

    // Logos shown at the top of the hero, followed by the word "presents".
    // Rendered at a uniform height; `url` (optional) makes a logo clickable.
    logos: [
      { name: 'GlobalTix', logo: logoGlobaltixDark, className: 'h-3 w-auto' },
      { name: 'Mavic', logo: sponsorMavic, url: 'https://mavic.ai/' },
      { name: 'Airwallex', logo: sponsorAirwallex, url: 'https://www.airwallex.com/global', className: 'h-3.5 w-auto' },
    ],

    intro: [
      'We’re excited to welcome you back for another year of GT Connect Singapore!',
      'What began as a simple gathering has grown into a vibrant community of travel partners coming together to exchange ideas, build meaningful connections and uncover new opportunities.',
      'Join us once again for an evening with familiar faces, new introductions and the people shaping the future of travel across the region. We look forward to connecting with you!',
    ],

    transferNote: 'This invitation is extended exclusively and is not transferable.',

    details: {
      date: { label: 'DATE', primary: '22nd October, Thursday', secondary: '5.00 pm - 9.00 pm' },
      registration: { label: 'REGISTRATION', prefix: 'From', primary: '4:30 PM', secondary: 'Ahead of programme start' },
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
