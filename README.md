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

**Storage:** two modes, chosen automatically.
- **Supabase** (shared): used when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
  are set. All responses land in one table you can read from any device. See
  "Shared storage with Supabase" below.
- **Local** (fallback): browser `localStorage` when those vars are absent — good
  for local testing; each browser keeps its own copy.

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

## Shared storage with Supabase

All reads/writes go through one seam (`src/lib/dataSource.js`); no UI changes needed.

**1. Create a project** at [supabase.com](https://supabase.com) → New project.

**2. Create the table + security policies.** Open **SQL Editor → New query**, paste
the contents of [`docs/supabase-setup.sql`](docs/supabase-setup.sql), and **Run**.
This creates the `rsvps` table, enables Row Level Security, and adds policies.

**3. Get your keys.** Project **Settings → API**: copy the **Project URL** and the
**anon / public** key.

**4. Set env vars.**
- Local: create `.env` (see `.env.example`) with `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY`.
- Vercel: **Settings → Environment Variables**, add the same two, then **redeploy**.

That's it — the app switches to Supabase automatically when both vars are present.

### Security model (read this)

This is a static site, so the **anon key ships in the browser**. Your data is
protected by **Row Level Security policies**, not by the app or the passcode:
- The setup grants `anon` **INSERT** so guests can submit.
- It also grants `anon` **SELECT** so the in-app `?admin=1` list works — but that
  makes responses readable by anyone with your URL who inspects the key. If guest
  names are sensitive, **remove the SELECT policy** (see the SQL comments) and view
  responses in the **Supabase dashboard** (Table Editor, with CSV export) instead,
  or put the admin behind Supabase Auth.
- No UPDATE/DELETE policies are created, so responses can't be edited or deleted
  from the browser — manage those in the dashboard. (The in-app "Clear all" button
  is therefore hidden in Supabase mode.)

## Personalising the greeting

The "Dear …" line reads the guest name from the URL **path**:

```
/liviane             -> "Dear Liviane"
/jane-doe            -> "Dear Jane Doe"     (hyphens/underscores become spaces)
/                    -> "Dear Guest"        (default)
/?edition=singapore  -> select an edition (default: singapore)
```

Names are auto-capitalised (`/liviane` -> "Liviane"). The path route relies on the
SPA rewrite in `vercel.json`, so it works once deployed to Vercel. The name a guest
types when they RSVP is prefilled from this greeting.

(There is no `?name=` query option — the path is the single, canonical format.)

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
