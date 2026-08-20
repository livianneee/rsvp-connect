# rsvp-connect

Responsive RSVP invitation for **GlobalTix Connect — Singapore Edition**, built
from the Figma design (file `S0g2wGgI8ZR0Ei8ZtuknQ1`, node `85:920`).

Guests respond **Yes** or **No**; their **name + response** are captured, stored
in the browser, and can be reviewed and exported as CSV from a passcode-protected
collector view.

Stack: **React 18 + Vite + Tailwind CSS v3**.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## How RSVP data is collected

1. Guest clicks **Yes, I'm coming** or **No, can't make it**.
2. A dialog captures their **name**.
3. The response is stored as `{ id, name, response, pax, note, timestamp }`.

**Storage:** in the browser via `localStorage` — no backend or accounts. Each
device/browser keeps its own copy, which suits a single collector.

### Collector view (admin)

- Add `?admin=1` to the URL, **or** press the **`a`** key on the invitation.
- Enter the passcode (see below).
- Shows live totals (coming / not coming / pax), the full response table, and
  **Export CSV**. Also Refresh and Clear.

### Passcode

Set via the `VITE_ADMIN_PASSCODE` environment variable (defaults to `GTConnect2026`).
Because this is a static site, the passcode is embedded in the built JavaScript —
it's a deterrent that keeps casual guests out of the response list, not hard
security. For truly private data, wire storage to a backend (see below).

### Moving to shared storage later

All reads/writes go through one seam: `src/lib/dataSource.js`. Set `USE_LOCAL = false`
and fill in `submitRsvp` / `getRsvps` / `clearRsvps` to point at your API or CMS
(e.g. a "RSVPs" collection or a Google Sheet endpoint). No UI changes needed.

## Personalising the greeting

The "Dear …" line reads from the invite link:

```
/?name=Olivia        -> "Dear Olivia"
/?edition=singapore  -> select an edition (default: singapore)
```

## Editing content

All per-event copy (date, venue, intro, footer) lives in `src/data/editions.js`.
Add a new event by adding one object keyed by slug — no component changes.

## Deploy to Vercel

Vercel auto-detects Vite; the defaults are correct, but for reference:

| Setting | Value |
|---|---|
| Framework Preset | **Vite** |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Root Directory | `./` (repo root) |
| Node.js Version | 18.x or 20.x |

Optional environment variable (Project → Settings → Environment Variables):

| Key | Value | Notes |
|---|---|---|
| `VITE_ADMIN_PASSCODE` | your passcode | Overrides the default. Applies at build time — redeploy after changing. |

Steps: push this repo to GitHub → in Vercel, **Add New → Project → Import** the
repo → keep the auto-detected settings → **Deploy**. The invitation is public (so
guests can open it); the collector view stays behind the passcode.

## Project structure

```
src/
  App.jsx                 # routes: invitation vs. admin (URL + "a" key)
  config.js               # admin passcode
  data/editions.js        # per-event content (multi-edition)
  lib/dataSource.js        # storage seam: localStorage + CSV export
  components/
    Hero.jsx              # skyline hero + logo
    RsvpPage.jsx          # invitation layout + RSVP flow
    RsvpButtons.jsx       # Yes / No buttons
    NameDialog.jsx        # name-capture modal
    EventDetails.jsx      # date / registration / location
    Footer.jsx, BrandLogo.jsx
    AdminPanel.jsx        # passcode gate + collector table + CSV
    Divider.jsx, ArrowBadge.jsx
  assets/images/          # hero photo + logos
```

## Assets & fonts

Brand assets live in `src/assets/images/`: `hero-singapore.jpg` (hero photo),
`logo-gt-connect.png` (hero wordmark), `logo-globaltix-footer.png` (footer mark).
The hero photo and hero logo are wired via `src/data/editions.js` (`heroImage`,
`logo`), each with a gradient/text fallback if set to `null`.

Fonts: **Montserrat** and **Poppins** (Google Fonts, loaded in `index.html`).
**Caveat** stands in for *Linotype Feltpen* (proprietary) for the script text —
swap the `script` family in `tailwind.config.js` if you license the original.
