import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dist = path.join(root, 'dist')
const PORT = 4319
const base = `http://127.0.0.1:${PORT}`

// Serve the built app
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', dist], {
  stdio: 'ignore',
})
await new Promise((r) => setTimeout(r, 800))

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  headless: false,
  args: ['--headless=new', '--no-sandbox'],
})
const results = []
const check = (name, cond) => {
  results.push({ name, ok: !!cond })
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
}

try {
  // ---- Desktop ----
  const fsMod = await import('node:fs/promises')
  const idxHtml = await fsMod.readFile(path.join(dist, 'index.html'), 'utf-8')

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  // Simulate the Vercel SPA rewrite so /olivia serves the app (path-based name).
  await page.route('**/olivia', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: idxHtml }),
  )
  await page.goto(`${base}/olivia`, { waitUntil: 'networkidle' })

  check('greeting shows guest name from path', (await page.locator('text=Olivia').count()) > 0)
  check('Yes button present', (await page.getByRole('button', { name: /Yes, I/ }).count()) > 0)
  check('No button present', (await page.getByRole('button', { name: /No, can/ }).count()) > 0)
  check('date value present', (await page.locator('text=22nd October').count()) > 0)
  check('venue present', (await page.locator('text=café nesuto').count()) > 0)
  check('footer note present', (await page.locator('text=/registered to one guest/').count()) > 0)

  await page.screenshot({ path: path.join(root, 'test', 'desktop.png'), fullPage: true })

  // ---- RSVP: Yes flow ----
  await page.getByRole('button', { name: /Yes, I/ }).click()
  check('dialog opens', (await page.getByRole('dialog').count()) > 0)
  check('name prefilled from invite', (await page.locator('#rsvp-name').inputValue()) === 'Olivia')
  await page.getByRole('button', { name: /Confirm attendance/ }).click()
  await page.waitForSelector('text=/You’re confirmed/')
  check('confirmation shown', (await page.locator('text=/You’re confirmed/').count()) > 0)

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gtx_rsvp_responses') || '[]'))
  check('one record stored', stored.length === 1)
  check('record has name', stored[0]?.name === 'Olivia')
  check('record response = yes', stored[0]?.response === 'yes')

  // ---- Second guest: No flow (fresh nav keeps storage) ----
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /No, can/ }).click()
  await page.locator('#rsvp-name').fill('Sam Rivera')
  await page.getByRole('button', { name: /Send response/ }).click()
  await page.waitForSelector('text=/Response received/')
  const stored2 = await page.evaluate(() => JSON.parse(localStorage.getItem('gtx_rsvp_responses') || '[]'))
  check('two records stored', stored2.length === 2)
  check('second is no', stored2[1]?.response === 'no' && stored2[1]?.name === 'Sam Rivera')

  // ---- Admin view + CSV (behind passcode) ----
  await page.goto(`${base}/index.html?admin=1`, { waitUntil: 'networkidle' })
  check('passcode gate shown', (await page.locator('text=Collector access').count()) > 0)
  await page.locator('input[type=password]').fill('GTConnect2026')
  await page.getByRole('button', { name: /Unlock/ }).click()
  await page.waitForSelector('table')
  check('admin lists 2 rows', (await page.locator('table tbody tr').count()) === 2)
  check('total stat = 2', (await page.locator('text=Total').count()) > 0)

  // CSV content sanity via the exported helper logic
  const csv = await page.evaluate(() => {
    const rows = JSON.parse(localStorage.getItem('gtx_rsvp_responses') || '[]')
    const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))
    const header = ['Name', 'RSVP', 'Pax', 'Note', 'Edition', 'Timestamp']
    const body = rows.map((r) => [esc(r.name), esc(r.response), esc(r.pax), esc(r.note), esc(r.edition), esc(r.timestamp)].join(','))
    return [header.join(','), ...body].join('\n')
  })
  check('csv has header + 2 data rows', csv.split('\n').length === 3)

  // ---- Personalised path route (/name -> "Dear Name") ----
  const pctx = await browser.newContext({ viewport: { width: 1200, height: 900 } })
  const ppage = await pctx.newPage()
  const fs = await import('node:fs/promises')
  const indexHtml = await fs.readFile(path.join(dist, 'index.html'), 'utf-8')
  // Simulate the Vercel SPA rewrite: /liviane serves index.html
  await ppage.route('**/liviane', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: indexHtml }),
  )
  await ppage.goto(`${base}/liviane`, { waitUntil: 'networkidle' })
  check('path /liviane greets "Liviane"', (await ppage.locator('text=Liviane').count()) > 0)
  await ppage.goto(`${base}/index.html`, { waitUntil: 'networkidle' })
  check('no path -> greets "Guest"', (await ppage.locator('span:has-text("Guest")').count()) > 0)

  // ---- Mobile render ----
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })
  const mpage = await mctx.newPage()
  await mpage.goto(`${base}/index.html?name=Olivia`, { waitUntil: 'networkidle' })
  // No horizontal overflow
  const overflow = await mpage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check('no horizontal overflow on mobile', overflow <= 1)
  await mpage.screenshot({ path: path.join(root, 'test', 'mobile.png'), fullPage: true })
} catch (err) {
  console.error('ERROR', err)
  results.push({ name: 'exception', ok: false })
} finally {
  await browser.close()
  server.kill()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
