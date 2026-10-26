// Real-browser walkthrough: drives headless Chrome over the DevTools protocol.
//
// AGENTS.md asks for a browser walkthrough when a sheet control, layout, or
// Combat math changes. The bundled browser bridge only speaks Firefox, which is
// not installed here, so this talks to Chrome directly. No new dependency:
// Node's built-in WebSocket is enough for CDP.
//
//   google-chrome-stable --headless=new --remote-debugging-port=9222 \
//     --no-first-run --user-data-dir=/tmp/cdp-profile about:blank &
//   npm run dev
//   node scripts/walkthrough-encyclopedia.mjs
//
// Exits non-zero if any check fails, so it can gate a release by hand.

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
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
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

  await s.send('Page.navigate', { url: 'http://localhost:5173/' })
  await sleep(2200)
  await s.eval(CLICK('/new sheet/i')); await sleep(600)
  await s.eval(CLICK('/Pathfinder First Edition/i')); await sleep(1200)
  await s.eval(CLICK('/show tools|tools/i')); await sleep(800)
  await s.eval(CLICK('/encyclopedia/i')); await sleep(800)

  const g = () => s.eval(`(() => {
    const root = document.querySelector('.encyclopedia')
    const secs = [...root.querySelectorAll('section.encyclopedia-group')].map(sec => ({
      kind: sec.querySelector('h3').textContent.trim(),
      rows: [...sec.querySelectorAll('li button')].map(b => b.textContent.trim()),
      muted: [...sec.querySelectorAll('p.muted')].map(p => p.textContent.trim()),
    }))
    const total = [...root.querySelectorAll('li button')].length
    const foot = [...root.children].filter(c => c.tagName === 'P').map(p => p.textContent.trim())
    const bodyPanel = root.querySelector('.encyclopedia-body')
    return { secs, total, foot, body: bodyPanel && {
      name: bodyPanel.querySelector('h3').textContent.trim(),
      text: bodyPanel.querySelector('p').textContent.trim() } }
  })()`)

  let v = await g()
  const by = (k) => v.secs.find((x) => x.kind === k)

  // FIX 1: fair-share cap. Every group that ships rows must render some.
  check('every packed group renders rows (fair-share cap)',
    by('Spells').rows.length > 0 && by('Feats').rows.length > 0 && by('Features').rows.length === 3,
    `spells=${by('Spells').rows.length} feats=${by('Feats').rows.length} features=${by('Features').rows.length}`)

  // FIX 2: no false "nothing packed" on a packed group.
  const liars = v.secs.filter((x) => x.rows.length > 0 && x.muted.some((m) => /No entries packed yet/.test(m)))
  check('no packed group claims it is unpacked', liars.length === 0,
    liars.length ? JSON.stringify(liars.map((l) => l.kind)) : 'none')

  // Empty groups still visible, with the unpacked sentence.
  check('empty groups stay visible with the unpacked sentence',
    by('Afflictions').muted.some((m) => /No entries packed yet/.test(m)) &&
    by('Actions').muted.some((m) => /No entries packed yet/.test(m)))

  // FIX 3: alphabetical within each group.
  const sortedOk = v.secs.filter((x) => x.rows.length > 1).every((x) => {
    const a = [...x.rows]; const b = [...x.rows].sort((p, q) => p.localeCompare(q))
    return a.join('|') === b.join('|')
  })
  check('rows are alphabetical within each group', sortedOk,
    `spells start: ${by('Spells').rows.slice(0, 3).join(', ')}`)

  // Cap respected, and the overflow note accounts for the remainder.
  const note = v.foot.find((p) => /more matches/.test(p))
  const held = note && Number(/^(\d+)/.exec(note)[1])
  check('row cap respected and overflow note accurate', v.total === 60 && held === 829 - 60,
    `shown=${v.total} heldBack=${held} (pack 829)`)

  // Per-group overflow notes present on truncated groups.
  check('truncated groups report their own held-back count',
    by('Spells').muted.some((m) => /more in this group/.test(m)) &&
    by('Feats').muted.some((m) => /more in this group/.test(m)))

  // Search reaches a row past the cap, and selecting shows the real body.
  await s.eval(`(() => {
    const i = document.querySelector('.encyclopedia input[type=search]')
    const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    set.call(i, 'walk through space')
    i.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  await sleep(500)
  v = await g()
  const hit = v.secs.flatMap((x) => x.rows)
  check('search reaches an APG spell that sorts past the cap',
    hit.includes('Walk through Space'), JSON.stringify(hit))

  await s.eval(`[...document.querySelectorAll('.encyclopedia li button')]
    .find(b => b.textContent.trim() === 'Walk through Space').click()`)
  await sleep(400)
  v = await g()
  check('selecting an entry shows its summary',
    v.body && v.body.name === 'Walk through Space' && v.body.text.length > 10,
    v.body ? `"${v.body.text}"` : 'no body panel')

  // A group with entries but no match says so, rather than "unpacked".
  await s.eval(`(() => {
    const i = document.querySelector('.encyclopedia input[type=search]')
    const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    set.call(i, 'zzzznotathing')
    i.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  await sleep(500)
  v = await g()
  check('packed groups with no match say "no match", not "unpacked"',
    v.secs.find((x) => x.kind === 'Spells').muted.some((m) => /No entries match/.test(m)) &&
    v.secs.find((x) => x.kind === 'Afflictions').muted.some((m) => /No entries packed yet/.test(m)),
    JSON.stringify(v.secs.map((x) => [x.kind, x.muted])))

  check('no console errors during the walkthrough', errors.length === 0,
    errors.length ? JSON.stringify(errors.slice(0, 3)) : 'none')

  ws.close()
  const failed = checks.filter((c) => !c.pass)
  console.log(`\n${checks.length - failed.length}/${checks.length} checks passed in real Chrome`)
  if (failed.length) process.exit(1)
}
main().catch((e) => { console.error('FAILED:', e.message); process.exit(1) })
