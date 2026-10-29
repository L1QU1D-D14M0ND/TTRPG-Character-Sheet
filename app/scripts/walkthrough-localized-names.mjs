// Real-browser walkthrough for Phase 5.2, localized catalog names.
//
// AGENTS.md asks for a browser walkthrough when a sheet control changes. The
// catalog picker and the encyclopedia both changed: they relabel rows in the
// active UI locale, carry the English name alongside, and search both names
// accent-insensitively. This drives all of that through the real language
// switcher in headless Chrome, which is the one thing a unit test cannot do.
//
//   google-chrome-stable --headless=new --remote-debugging-port=9222 \
//     --no-first-run --user-data-dir=/tmp/cdp-profile about:blank &
//   npm run dev
//   node scripts/walkthrough-localized-names.mjs
//
// Exits non-zero if any check fails.

const BASE = 'http://127.0.0.1:9222'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

class Session {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map()
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) reject(new Error(JSON.stringify(msg.error)))
        else resolve(msg.result)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + expression)
    return r.result.value
  }
}

const CLICK = (re) => `(() => {
  const b = [...document.querySelectorAll('button')].find(x => ${re}.test(x.textContent.trim()))
  if (b) { b.click(); return b.textContent.trim() } return null })()`

const TYPE = (selector, text) => `(() => {
  const i = document.querySelector(${JSON.stringify(selector)})
  if (!i) return null
  const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  set.call(i, ${JSON.stringify(text)})
  i.dispatchEvent(new Event('input', { bubbles: true }))
  return i.value })()`

const checks = []
const check = (name, pass, detail) => {
  checks.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -- ' + detail : ''}`)
}

async function main() {
  const page = (await (await fetch(`${BASE}/json/list`)).json()).find((t) => t.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  const s = new Session(ws)
  await s.send('Runtime.enable'); await s.send('Page.enable')
  const errors = []
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text)
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
      errors.push(m.params.args.map((a) => a.value ?? a.description).join(' '))
  })

  // Start from a clean locale so a previous run cannot decide this one.
  await s.send('Page.navigate', { url: 'http://localhost:5173/' })
  await sleep(1500)
  await s.eval(`window.localStorage.removeItem('ttrpg-sheet.locale')`)
  await s.send('Page.navigate', { url: 'http://localhost:5173/' })
  await sleep(2200)
  await s.eval(CLICK('/new sheet/i')); await sleep(600)
  await s.eval(CLICK('/Pathfinder First Edition/i')); await sleep(1200)

  // ---- English baseline, via the real language switcher ----
  const localeControl = await s.eval(`(() => {
    const sel = [...document.querySelectorAll('select')].find(
      s => [...s.options].some(o => /espa|spanish|es/i.test(o.textContent + o.value)))
    return sel ? { kind: 'select', options: [...sel.options].map(o => o.value) } : null })()`)
  check('a real language switcher exists in the chrome',
    localeControl !== null, JSON.stringify(localeControl))

  const setLocale = async (value) => {
    await s.eval(`(() => {
      const sel = [...document.querySelectorAll('select')].find(
        s => [...s.options].some(o => /^es$/.test(o.value)))
      const set = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
      set.call(sel, ${JSON.stringify(value)})
      sel.dispatchEvent(new Event('change', { bubbles: true }))
    })()`)
    await sleep(700)
  }

  // ---- Catalog picker, English ----
  const openItemPicker = async () => {
    await s.eval(CLICK('/^inventory$|inventario/i')); await sleep(600)
    await s.eval(CLICK('/add item|anadir|añadir/i')); await sleep(500)
    return s.eval(`(() => {
      const b = [...document.querySelectorAll('button[aria-haspopup=dialog]')].pop()
      if (!b) return null; b.click(); return b.getAttribute('aria-label') })()`)
  }

  const pickerRows = () => s.eval(`(() => {
    const d = document.querySelector('.catalog-picker-dialog')
    if (!d) return null
    return [...d.querySelectorAll('button[role=option]')].map(b => ({
      label: b.querySelector('span').textContent.trim(),
      alt: b.querySelector('.catalog-picker-alt')?.textContent.trim() ?? null,
    })) })()`)

  const searchPicker = (text) =>
    s.eval(TYPE('.catalog-picker-dialog input[type=search]', text))

  await openItemPicker(); await sleep(500)
  await searchPicker('longsword'); await sleep(400)
  let rows = await pickerRows()
  const enLongsword = rows.find((r) => r.label === 'Longsword')
  check('English UI labels the picker row in English, with no second name',
    Boolean(enLongsword) && enLongsword.alt === null,
    JSON.stringify(rows.slice(0, 4)))

  await s.eval(CLICK('/^close$/i')); await sleep(400)

  // ---- Switch to Spanish ----
  await setLocale('es')

  await openItemPicker(); await sleep(500)
  await searchPicker('espada larga'); await sleep(400)
  rows = await pickerRows()
  const esLongsword = rows.find((r) => r.label === 'Espada larga')
  check('Spanish UI labels the same row in Spanish',
    Boolean(esLongsword), JSON.stringify(rows.slice(0, 4)))
  check('the row still shows its English name alongside',
    esLongsword?.alt === 'Longsword', JSON.stringify(esLongsword))

  // Accent-insensitive: "punteria" must reach "Puntería mortal".
  await s.eval(CLICK('/^cerrar$|^close$/i')); await sleep(400)
  await s.eval(CLICK('/^dotes$|^feats$/i')); await sleep(600)
  await s.eval(CLICK('/anadir dote|añadir dote|add feat/i')); await sleep(500)
  await s.eval(`(() => {
    const b = [...document.querySelectorAll('button[aria-haspopup=dialog]')].pop()
    b.click() })()`)
  await sleep(500)
  await searchPicker('punteria mortal'); await sleep(400)
  rows = await pickerRows()
  check('an accented row is found typed without accents',
    rows.some((r) => r.label === 'Puntería mortal'),
    JSON.stringify(rows.slice(0, 3)))
  await s.eval(CLICK('/^cerrar$|^close$/i')); await sleep(400)

  await s.eval(CLICK('/^inventario$|^inventory$/i')); await sleep(600)
  await s.eval(`(() => {
    const b = [...document.querySelectorAll('button[aria-haspopup=dialog]')].pop()
    b.click() })()`)
  await sleep(500)
  await searchPicker('longsword'); await sleep(400)
  rows = await pickerRows()
  check('a row is still findable by its English name in the Spanish UI',
    rows.some((r) => r.label === 'Espada larga'),
    JSON.stringify(rows.slice(0, 4)))

  // Pick it, and confirm the document keeps the English name.
  await s.eval(`(() => {
    const d = document.querySelector('.catalog-picker-dialog')
    const b = [...d.querySelectorAll('button[role=option]')]
      .find(x => x.querySelector('span').textContent.trim() === 'Espada larga')
    b.click() })()`)
  await sleep(600)
  const picked = await s.eval(`(() => {
    const trigger = [...document.querySelectorAll('button[aria-haspopup=dialog]')].pop()
    const field = trigger.parentElement.querySelector('input:not([type=search])')
    return { trigger: trigger.textContent.trim(), field: field ? field.value : null } })()`)
  check('the trigger shows the Spanish name while the sheet stores the English one',
    picked.trigger === 'Espada larga' && picked.field === 'Longsword',
    JSON.stringify(picked))

  // ---- Encyclopedia in Spanish ----
  await s.eval(CLICK('/herramientas|show tools|tools/i')); await sleep(800)
  await s.eval(CLICK('/enciclopedia|encyclopedia/i')); await sleep(800)
  await s.eval(TYPE('.encyclopedia input[type=search]', 'Fireball')); await sleep(600)
  let enc = await s.eval(`(() => {
    const root = document.querySelector('.encyclopedia')
    return [...root.querySelectorAll('li button')].map(b => b.textContent.trim()) })()`)
  check('the encyclopedia finds a Spanish-labelled entry by its English name',
    enc.includes('Bola de fuego'), JSON.stringify(enc.slice(0, 5)))

  await s.eval(`[...document.querySelectorAll('.encyclopedia li button')]
    .find(b => b.textContent.trim() === 'Bola de fuego').click()`)
  await sleep(500)
  const body = await s.eval(`(() => {
    const p = document.querySelector('.encyclopedia-body')
    return p && { head: p.querySelector('h3').textContent.trim(),
                  text: p.querySelector('p').textContent.trim() } })()`)
  check('the selected entry shows both names and keeps its English prose',
    body && /Bola de fuego/.test(body.head) && /Fireball/.test(body.head) && body.text.length > 10,
    JSON.stringify(body))

  await s.eval(TYPE('.encyclopedia input[type=search]', 'bola de fuego')); await sleep(600)
  enc = await s.eval(`(() => [...document.querySelectorAll('.encyclopedia li button')]
    .map(b => b.textContent.trim()))()`)
  check('the encyclopedia also finds it by the Spanish name, lowercase',
    enc.includes('Bola de fuego'), JSON.stringify(enc.slice(0, 5)))

  // ---- Back to English: nothing is stuck ----
  await setLocale('en')
  await s.eval(TYPE('.encyclopedia input[type=search]', 'Fireball')); await sleep(600)
  enc = await s.eval(`(() => [...document.querySelectorAll('.encyclopedia li button')]
    .map(b => b.textContent.trim()))()`)
  check('switching back to English relabels the encyclopedia immediately',
    enc.includes('Fireball') && !enc.includes('Bola de fuego'),
    JSON.stringify(enc.slice(0, 5)))

  check('no console errors during the walkthrough', errors.length === 0,
    errors.length ? JSON.stringify(errors.slice(0, 3)) : 'none')

  ws.close()
  const failed = checks.filter((c) => !c.pass)
  console.log(`\n${checks.length - failed.length}/${checks.length} checks passed in real Chrome`)
  if (failed.length) process.exit(1)
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
