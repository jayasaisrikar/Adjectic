'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { createCore, createFallback, webglOK } from './core'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fmtUSD = (n) => '$' + Math.round(n).toLocaleString('en-US')

let lenisRef = null
function scrollToHash(hash) {
  const el = hash === '#top' ? document.body : document.getElementById(hash.slice(1))
  if (!el) return
  if (lenisRef) lenisRef.scrollTo(hash === '#top' ? 0 : el, { offset: -72, duration: 1.4 })
  else el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth' })
  if (history.replaceState) history.replaceState(null, '', hash)
}

/* ───────── Global motion: smooth scroll, reveals, hero intro, cursor, magnetic, tilt, count-up ───────── */
export function SiteMotion() {
  useEffect(() => {
    const reduce = prefersReduced()
    const cleanups = []

    // In-page anchors
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')
      if (!id || id.length < 2) return
      e.preventDefault()
      document.body.classList.remove('menu-open')
      scrollToHash(id)
    }
    document.addEventListener('click', onClick)
    cleanups.push(() => document.removeEventListener('click', onClick))

    // Count-up
    const animateNum = (el, from, to, dur, fmt) => {
      if (reduce) return (el.textContent = fmt(to))
      const t0 = performance.now()
      const f = (now) => {
        const p = Math.min(1, (now - t0) / dur)
        const e = 1 - Math.pow(1 - p, 3)
        el.textContent = fmt(from + (to - from) * e)
        if (p < 1) requestAnimationFrame(f)
      }
      requestAnimationFrame(f)
    }
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return
        const el = en.target
        const to = +el.dataset.count
        const from = +(el.dataset.from || 0)
        const pre = el.dataset.prefix || ''
        const suf = el.dataset.suffix || ''
        animateNum(el, from, to, 1800, (v) => pre + Math.round(v) + suf)
        countIO.unobserve(el)
      })
    }, { threshold: 0.6 })
    document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el))
    cleanups.push(() => countIO.disconnect())

    if (reduce) return () => cleanups.forEach((c) => c())

    // Lenis smooth scroll driven by GSAP's ticker
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    lenisRef = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    cleanups.push(() => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef = null
    })

    const ctx = gsap.context(() => {
      gsap.from('[data-hero]', { opacity: 0, y: 28, duration: 1.1, ease: 'power3.out', stagger: 0.09, delay: 0.15 })
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, { opacity: 0, y: 40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      })
      gsap.utils.toArray('.s-bar i').forEach((el) => {
        gsap.from(el, { width: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
      })
    })
    cleanups.push(() => ctx.revert())

    // Pointer-only niceties
    if (window.matchMedia('(pointer: fine)').matches) {
      document.querySelectorAll('.magnetic').forEach((b) => {
        const mm = (e) => {
          const r = b.getBoundingClientRect()
          b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.32}px)`
        }
        const ml = () => {
          b.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)'
          b.style.transform = ''
          setTimeout(() => (b.style.transition = ''), 500)
        }
        b.addEventListener('mousemove', mm)
        b.addEventListener('mouseleave', ml)
        cleanups.push(() => {
          b.removeEventListener('mousemove', mm)
          b.removeEventListener('mouseleave', ml)
        })
      })

      document.querySelectorAll('.tilt').forEach((c) => {
        const mm = (e) => {
          const r = c.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width
          const py = (e.clientY - r.top) / r.height
          c.style.setProperty('--mx', px * 100 + '%')
          c.style.setProperty('--my', py * 100 + '%')
          c.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * 2.5}deg) rotateY(${(px - 0.5) * 3}deg)`
        }
        const ml = () => (c.style.transform = '')
        c.addEventListener('mousemove', mm)
        c.addEventListener('mouseleave', ml)
        cleanups.push(() => {
          c.removeEventListener('mousemove', mm)
          c.removeEventListener('mouseleave', ml)
        })
      })
    }

    return () => cleanups.forEach((c) => c())
  }, [])
  return null
}

/* ───────── Header with scroll state and mobile menu ───────── */
export function Header({ children, cta }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const btn = useRef(null)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    if (lenisRef) open ? lenisRef.stop() : lenisRef.start()
    const esc = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
        btn.current?.focus()
      }
    }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open])
  useEffect(() => {
    const obs = new MutationObserver(() => {
      if (!document.body.classList.contains('menu-open')) setOpen(false)
    })
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return (
    <header className={'site-header' + (scrolled ? ' is-scrolled' : '')}>
      <div className="container nav">
        {children}
        <div className="nav-end">
          {/* on phones the main action stays one tap away instead of hiding in the menu */}
          <span className="mobile-cta" hidden={open}>{cta}</span>
          <button ref={btn} className="menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="navLinks" onClick={() => setOpen(!open)}>
            <span />
          </button>
        </div>
        <nav className="nav-links" id="navLinks" aria-label="Primary">
          <a href="#agents">Agents</a>
          <a href="#how">How it works</a>
          <a href="#case-study">Case study</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          {cta}
        </nav>
      </div>
    </header>
  )
}

/* ───────── 3D agent core canvas ───────── */
export function CoreCanvas({ id, opts, lazy }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    let dispose = null
    let cancelled = false
    const reduce = prefersReduced()
    const lowPower = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
    const start = () => {
      if (cancelled) return
      if (reduce || lowPower || !webglOK()) {
        dispose = createFallback(canvas, opts, reduce)
        return
      }
      import('three')
        .then((THREE) => {
          if (!cancelled) dispose = createCore(THREE, canvas, opts)
        })
        .catch(() => {
          if (!cancelled) dispose = createFallback(canvas, opts, reduce)
        })
    }
    let io
    if (lazy) {
      io = new IntersectionObserver((en) => {
        if (!en[0].isIntersecting) return
        io.disconnect()
        start()
      }, { rootMargin: '400px' })
      io.observe(canvas)
    } else {
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 250))
      idle(start, { timeout: 900 })
    }
    return () => {
      cancelled = true
      io?.disconnect()
      dispose?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <canvas ref={ref} id={id} className="core-canvas" aria-hidden="true" />
}

/* ───────── Live decision feed ───────── */
const FEED = [
  { k: 'amz', a: 'Amazon Agent', t: 'ACOS +6.2% on SKU-B12 → cause: competitor coupon + CPC +18% on top term → shifted 30% budget to exact-match long-tail, held hero keyword bid', ok: 1 },
  { k: 'tts', a: 'TikTok Agent', t: 'Creative #14 CTR down 41% over 3 days → fatigue detected → rotated to creative #17', ok: 1 },
  { k: 'guard', a: 'Guardrail', t: 'Bid change blocked: exceeds 25% daily limit → queued for next cycle' },
  { k: 'wmt', a: 'Walmart Agent', t: '37 search terms, 0 orders after $412 spend → negated, budget moved to 4 converting terms', ok: 1 },
  { k: 'amz', a: 'Amazon Agent', t: 'Harvested 22 converting terms from auto → launched exact match at 0.85× suggested bid', ok: 1 },
  { k: 'noon', a: 'Noon Agent', t: 'KSA CPC +27% after 21:00 → dayparting applied, bids −15% from 21:00 to 02:00', ok: 1 },
  { k: 'tgt', a: 'Target Agent', t: '"linen sheets queen" ROAS 6.1× → budget +20%, still inside monthly pacing', ok: 1 },
  { k: 'amz', a: 'Amazon Agent', t: 'Buy Box 71% on SKU-H04 (reseller undercut) → paused SB on that ASIN, client alerted', ok: 1 },
  { k: 'tts', a: 'TikTok Agent', t: 'Creator video GMV up 3.4× on SKU-T09 → product ad budget moved behind the same hook', ok: 1 },
  { k: 'guard', a: 'Guardrail', t: 'Anomaly: spend pacing 2.6× normal at 10:14 → campaign paused, kill-switch logged, client alerted' },
  { k: 'amz', a: 'Amazon Agent', t: 'SKU-K22 at 18 days of cover → spend throttled −35% to avoid stock-out', ok: 1 },
  { k: 'wmt', a: 'Walmart Agent', t: 'Item page CVR −3.1 pts after content change → listing flagged, bids held', ok: 1 },
  { k: 'noon', a: 'Noon Agent', t: 'UAE "vitamin c serum" holds organic #2 → sponsored bid −12%, no sales lost', ok: 1 },
  { k: 'amz', a: 'Amazon Agent', t: 'Top-of-search share 34% → 19% → TOS placement +40%, base bid unchanged', ok: 1 },
  { k: 'rep', a: 'Report', t: 'Weekly update sent: 14 changes, 3 alerts, expected ACOS −2.8 pts', ok: 1 },
]

function FeedText({ text, done, ok }) {
  if (!done) return <span className="fl-txt">{text}</span>
  const parts = text.split('→')
  return (
    <span className="fl-txt">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <span className="arr">→</span>}
          {p}
        </span>
      ))}
      {ok ? <span className="fl-ok">✓</span> : null}
    </span>
  )
}

let feedSeq = 0 // module-level so ids stay unique across effect re-runs

export function DecisionFeed() {
  const [lines, setLines] = useState([])
  const [cycle, setCycle] = useState(0)
  const root = useRef(null)
  useEffect(() => {
    const ts = () => new Date().toTimeString().slice(0, 8)
    let fi = 0, c = 0, alive = true, visible = true, timer
    setLines([]) // StrictMode re-runs this effect in dev; start from a clean list
    const push = (item, done) => {
      const line = { id: feedSeq++, ts: ts(), item, text: done ? item.t : '', done }
      c++
      setCycle(c)
      setLines((ls) => [...ls, line].slice(-7))
      return line.id
    }
    if (prefersReduced()) {
      FEED.slice(0, 5).forEach((it) => push(it, true))
      return
    }
    FEED.slice(0, 2).forEach((it) => push(it, true))
    fi = 2
    const io = new IntersectionObserver((en) => (visible = en[0].isIntersecting))
    io.observe(root.current)
    const next = () => {
      if (!alive) return
      if (!visible || document.hidden) {
        timer = setTimeout(next, 700)
        return
      }
      const item = FEED[fi++ % FEED.length]
      const lid = push(item, false)
      let i = 0
      const step = () => {
        if (!alive) return
        i += 2
        const done = i >= item.t.length
        setLines((ls) => ls.map((l) => (l.id === lid ? { ...l, text: item.t.slice(0, i), done } : l)))
        if (!done) timer = setTimeout(step, 15)
        else timer = setTimeout(next, 1700 + Math.random() * 900)
      }
      step()
    }
    timer = setTimeout(next, 900)
    return () => {
      alive = false
      clearTimeout(timer)
      io.disconnect()
    }
  }, [])
  return (
    <aside className="feed" aria-label="Agent decision feed, illustrative" ref={root}>
      <div className="feed-head">
        <span>Decision feed</span>
        <span className="live"><i aria-hidden="true" />Live</span>
      </div>
      <div className="feed-body">
        <ol className="feed-lines" role="log" aria-live="off">
          {lines.map((l) => (
            <li key={l.id} className={`fl fl-${l.item.k}${l.done ? '' : ' typing'}`}>
              <span className="fl-ts">{l.ts}</span>
              <span className="fl-tag">{l.item.a}</span> <FeedText text={l.text} done={l.done} ok={l.item.ok} />
            </li>
          ))}
        </ol>
      </div>
      <div className="feed-foot">
        <span>5 agents, none waiting on approval</span>
        <span>cycle {String(cycle).padStart(4, '0')}</span>
      </div>
    </aside>
  )
}

/* ───────── How it works: sticky stage follows the active step ───────── */
export function HowLoop({ stages, children }) {
  const [active, setActive] = useState(0)
  const list = useRef(null)
  useEffect(() => {
    const steps = list.current.querySelectorAll('.step')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.isIntersecting && setActive(+en.target.dataset.step))
    }, { rootMargin: '-45% 0px -45% 0px' })
    steps.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    list.current.querySelectorAll('.step').forEach((s, j) => s.classList.toggle('is-active', j === active))
  }, [active])
  const names = ['observe', 'diagnose', 'act', 'report']
  return (
    <div className="how-wrap">
      <div className="stage-col">
        <div className="stage console" aria-hidden="true">
          <div className="stage-bar">
            <span>Agent loop</span>
            <b>{String(active + 1).padStart(2, '0')} {names[active]}</b>
          </div>
          {stages.map((s, i) => (
            <div key={i} className={'layer' + (i === active ? ' is-active' : '')}>
              {s}
            </div>
          ))}
        </div>
      </div>
      <ol className="steps" ref={list}>
        {children}
      </ol>
    </div>
  )
}

/* ───────── Case study board: wires + pinned scroll timeline ───────── */
const EDGES = [
  ['n-sym', 'n-rule', 'r'],
  ['n-sym', 'e1', 'v'], ['n-sym', 'e2', 'v'], ['n-sym', 'e3', 'v'], ['n-sym', 'e4', 'v'], ['n-sym', 'e5', 'v'],
  ['e1', 'a1', 'c'], ['e4', 'a1', 'c'], ['e2', 'a2', 'c'], ['e4', 'a2', 'c'], ['e4', 'a3', 'c'], ['e2', 'a4', 'c'], ['e3', 'a4', 'c'], ['e5', 'a5', 'c'],
  ['a5', 'n-out', 'l'],
]
const BOARD_STEPS = ['Symptom', 'Rule path', 'Evidence', 'Actions', 'Outcome']

export function CaseBoard({ children }) {
  const wrap = useRef(null)
  const [step, setStep] = useState(4)
  const [live, setLive] = useState(false)
  const outcomeDone = useRef(false)

  const runOutcome = useCallback(() => {
    if (outcomeDone.current) return
    outcomeDone.current = true
    const board = wrap.current.querySelector('.board')
    const reduce = prefersReduced()
    board.querySelectorAll('[data-outcome]').forEach((el) => {
      const to = parseFloat(el.dataset.outcome)
      const pre = el.dataset.prefix || ''
      const suf = el.dataset.suffix || ''
      const from = pre === '+' ? 0 : to * 1.6
      const fmt = (v) => pre + (Math.abs(to) < 10 ? v.toFixed(1) : Math.round(v)) + suf
      if (reduce) return (el.textContent = fmt(to))
      const t0 = performance.now()
      const f = (now) => {
        const p = Math.min(1, (now - t0) / 1600)
        el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - p, 3)))
        if (p < 1) requestAnimationFrame(f)
      }
      requestAnimationFrame(f)
    })
    board.querySelectorAll('[data-bar-to]').forEach((b) => {
      const f = parseFloat(b.dataset.barFrom)
      const t = parseFloat(b.dataset.barTo)
      b.style.setProperty('--w', Math.max(4, Math.min(100, (t / f) * 100)) + '%')
    })
    setLive(true)
  }, [])

  useEffect(() => {
    const root = wrap.current
    const grid = root.querySelector('.board-grid')
    const svg = root.querySelector('.wires')
    const NS = 'http://www.w3.org/2000/svg'
    const wireMap = {}
    EDGES.forEach((e) => {
      const base = document.createElementNS(NS, 'path')
      base.setAttribute('pathLength', '1')
      base.setAttribute('class', 'w-' + e[2])
      svg.appendChild(base)
      let pulse = null
      if (e[2] !== 'r') {
        pulse = document.createElementNS(NS, 'path')
        pulse.setAttribute('pathLength', '1')
        pulse.setAttribute('class', 'w-' + e[2] + ' pulse')
        pulse.style.animationDelay = Math.random() * 2 + 's'
        svg.appendChild(pulse)
      }
      wireMap[e[0] + '>' + e[1]] = { base, pulse, e }
    })
    const wire = (a, b) => wireMap[a + '>' + b].base
    const byId = (id) => root.querySelector('#' + id)
    const layout = () => {
      if (window.innerWidth < 1024) return
      const g = grid.getBoundingClientRect()
      svg.setAttribute('viewBox', `0 0 ${g.width} ${g.height}`)
      Object.values(wireMap).forEach((w) => {
        const A = byId(w.e[0]).getBoundingClientRect()
        const B = byId(w.e[1]).getBoundingClientRect()
        const ax = A.left - g.left, ay = A.top - g.top, bx = B.left - g.left, by = B.top - g.top
        let d
        if (w.e[2] === 'r') d = `M${ax + A.width * 0.5},${ay + A.height} L${bx + B.width * 0.5},${by}`
        else if (w.e[2] === 'l') d = `M${ax + A.width * 0.5},${ay + A.height} L${ax + A.width * 0.5},${by}`
        else {
          const sx = ax + A.width, sy = ay + A.height / 2, ex = bx, ey = by + B.height / 2, dx = (ex - sx) * 0.55
          d = `M${sx},${sy} C${sx + dx},${sy} ${ex - dx},${ey} ${ex},${ey}`
        }
        w.base.setAttribute('d', d)
        w.pulse?.setAttribute('d', d)
      })
    }
    layout()
    window.addEventListener('resize', layout)
    document.fonts?.ready.then(layout)

    const reduce = prefersReduced()
    let mm, io
    if (!reduce) {
      mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (min-height: 780px)', () => {
        setStep(0)
        const nodes = ['#n-sym', '#n-rule', '#e1', '#e2', '#e3', '#e4', '#e5', '#a1', '#a2', '#a3', '#a4', '#a5', '#n-out'].map((s) => root.querySelector(s))
        const bases = Object.values(wireMap).map((w) => w.base)
        gsap.set(nodes, { opacity: 0.08, y: 14, filter: 'blur(3px)' })
        gsap.set(bases, { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.set(byId('stamp'), { opacity: 0, scale: 1.8 })
        const show = { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 }
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root,
            start: 'top top+=84',
            end: '+=2600',
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: layout,
            onUpdate: (s) => {
              const p = s.progress
              setStep(p < 0.1 ? 0 : p < 0.26 ? 1 : p < 0.56 ? 2 : p < 0.86 ? 3 : 4)
              if (p > 0.9) runOutcome()
              setLive(p > 0.9 && outcomeDone.current)
            },
          },
        })
        tl.to(byId('n-sym'), show)
          .to(wire('n-sym', 'n-rule'), { strokeDashoffset: 0, duration: 0.6 })
          .to(byId('n-rule'), show)
          .to(byId('stamp'), { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(3)' })
          .to(byId('n-rule'), { opacity: 0.5, duration: 0.5 })
        ;['e1', 'e2', 'e3', 'e4', 'e5'].forEach((id) => {
          tl.to(wire('n-sym', id), { strokeDashoffset: 0, duration: 0.5 }).to(byId(id), { ...show, duration: 0.6 }, '-=.2')
        })
        const into = { a1: ['e1', 'e4'], a2: ['e2', 'e4'], a3: ['e4'], a4: ['e2', 'e3'], a5: ['e5'] }
        Object.keys(into).forEach((a) => {
          tl.to(into[a].map((e) => wire(e, a)), { strokeDashoffset: 0, duration: 0.5 }).to(byId(a), { ...show, duration: 0.6 }, '-=.2')
        })
        tl.to(wire('a5', 'n-out'), { strokeDashoffset: 0, duration: 0.5 }).to(byId('n-out'), show).to({}, { duration: 0.6 })
        requestAnimationFrame(layout)
        return () => setLive(false)
      })
      mm.add('(max-width: 1023px), (max-height: 779px)', () => {
        setStep(4)
        root.querySelectorAll('.node').forEach((n) => {
          gsap.from(n, { opacity: 0, x: -14, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: n, start: 'top 90%', once: true } })
        })
        ScrollTrigger.create({ trigger: byId('n-out'), start: 'top 85%', once: true, onEnter: runOutcome })
      })
    } else {
      io = new IntersectionObserver((en) => {
        if (en[0].isIntersecting) {
          runOutcome()
          io.disconnect()
        }
      }, { threshold: 0.3 })
      io.observe(byId('n-out'))
    }
    return () => {
      window.removeEventListener('resize', layout)
      mm?.revert()
      io?.disconnect()
      svg.replaceChildren()
    }
  }, [runOutcome])

  return (
    <div className="case-wrap" ref={wrap}>
      <div className={'board' + (live ? ' is-live' : '')}>
        <div className="board-bar">
          <span>Investigation: ACOS spike on the top SKU</span>
          <ol className="board-steps" aria-hidden="true">
            {BOARD_STEPS.map((s, i) => (
              <li key={s} className={i <= step ? 'on' : ''}>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <div className="board-grid">
          <svg className="wires" aria-hidden="true" />
          {children}
        </div>
      </div>
    </div>
  )
}

/* ───────── FAQ accordion ───────── */
export function Faq({ items }) {
  const [open, setOpen] = useState(-1)
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 500)
    return () => clearTimeout(t)
  }, [open])
  return (
    <div className="faq-list" data-reveal>
      {items.map(([q, a], i) => (
        <div className="faq-item" key={i}>
          <button className="faq-q" id={'fq' + i} aria-expanded={open === i} aria-controls={'fa' + i} onClick={() => setOpen(open === i ? -1 : i)}>
            {q}
            <span className="faq-ic" aria-hidden="true" />
          </button>
          <div className="faq-a" id={'fa' + i} role="region" aria-labelledby={'fq' + i}>
            <div>
              <p>{a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ───────── Pricing calculator (log scale, $5K to $1M) ───────── */
const MIN_SPEND = 5000, MAX_SPEND = 1000000
function spendAt(p) {
  const v = MIN_SPEND * Math.pow(MAX_SPEND / MIN_SPEND, p / 1000)
  const step = v < 20000 ? 500 : v < 100000 ? 1000 : v < 500000 ? 5000 : 10000
  return Math.round(v / step) * step
}
export function Calculator({ minFee }) {
  const [p, setP] = useState(435)
  const spend = spendAt(p)
  let fee = spend * 0.03
  const usedMin = minFee != null && fee < minFee
  if (usedMin) fee = minFee
  return (
    <div className="calc" data-reveal>
      <h3>What would you pay?</h3>
      <p>Set your monthly ad spend across the marketplaces you want us to manage.</p>
      <div className="calc-row">
        <label className="calc-label" htmlFor="spendRange">Monthly ad spend</label>
        <div className="calc-val" aria-hidden="true">{fmtUSD(spend)}</div>
        <input
          className="range"
          id="spendRange"
          type="range"
          min="0"
          max="1000"
          step="1"
          value={p}
          style={{ '--p': p / 10 + '%' }}
          aria-valuetext={fmtUSD(spend) + ' per month'}
          onChange={(e) => setP(+e.target.value)}
        />
        <div className="range-scale" aria-hidden="true">
          <span>$5K</span>
          <span>$50K</span>
          <span>$250K</span>
          <span>$1M</span>
        </div>
      </div>
      <div className="fee-box" aria-live="polite">
        <span className="calc-label">Your monthly fee</span>
        <div className="fee-num">{fmtUSD(fee)}</div>
        <p className="fee-note">
          {usedMin ? `Minimum monthly fee applies below ${fmtUSD(minFee / 0.03)} ad spend.` : `3% of ${fmtUSD(spend)}. Every live agent included.`}
        </p>
      </div>
    </div>
  )
}

/* ───────── Audit form ───────── */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export function AuditForm({ endpoint, demo, contactEmail }) {
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [brand, setBrand] = useState('')
  const form = useRef(null)
  const success = useRef(null)

  const validate = () => {
    const f = form.current
    const name = f.name.value.trim(), email = f.email.value.trim(), brandV = f.brand.value.trim(), spend = f.adSpend.value, link = f.storeLink.value.trim()
    const mks = [...f.querySelectorAll('input[name="marketplaces"]:checked')].map((c) => c.value)
    const e = {}
    if (name.length < 2) e.name = 'Enter your name.'
    if (!emailRe.test(email)) e.email = 'Enter a valid work email.'
    if (brandV.length < 2) e.brand = 'Enter your brand or store name.'
    if (!spend) e.spend = 'Choose your monthly ad spend.'
    if (!mks.length) e.mk = 'Pick at least one marketplace.'
    if (link && !/^https?:\/\/\S+$/i.test(link) && !/^B0[A-Z0-9]{8}$/i.test(link)) e.link = 'Use a full URL (https://…) or a 10-character ASIN.'
    setErrors(e)
    const order = ['name', 'email', 'brand', 'spend', 'mk', 'link']
    const first = order.find((k) => e[k])
    if (first) {
      const map = { name: 'name', email: 'email', brand: 'brand', spend: 'adSpend', mk: 'marketplaces', link: 'storeLink' }
      const el = first === 'mk' ? f.querySelector('input[name="marketplaces"]') : f[map[first]]
      el?.focus()
      return null
    }
    return { name, email, brand: brandV, marketplaces: mks.join(', '), adSpend: spend, storeLink: link, problem: f.problem.value.trim() }
  }

  const onSubmit = (ev) => {
    ev.preventDefault()
    if (form.current.website.value) return // honeypot
    const data = validate()
    if (!data) return
    data.timestamp = new Date().toISOString()
    data.pageUrl = window.location.href
    data.referrer = document.referrer || ''
    setStatus('sending')
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 15000)
    const req = demo
      ? new Promise((r) => setTimeout(r, 1100))
      : fetch(endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data), signal: ctrl.signal })
    req
      .then(() => {
        clearTimeout(timer)
        if (demo) console.warn('[Adgentic] AUDIT_FORM_URL is not set. This submission was not stored.', data)
        setBrand(data.brand)
        setStatus('done')
        setTimeout(() => {
          success.current?.focus({ preventScroll: true })
          ScrollTrigger.refresh()
        }, 50)
      })
      .catch(() => {
        clearTimeout(timer)
        setStatus('error')
      })
  }

  const clearErr = (k) => errors[k] && setErrors({ ...errors, [k]: undefined })
  const field = (k, cls = '') => 'field' + (cls ? ' ' + cls : '') + (errors[k] ? ' has-error' : '')

  return (
    <div className={'form-card' + (status === 'done' ? ' is-done' : '')} data-reveal>
      <form ref={form} noValidate onSubmit={onSubmit}>
        <div className="form-grid">
          <div className={field('name')}>
            <label htmlFor="f-name">Name</label>
            <input className="input" id="f-name" name="name" type="text" autoComplete="name" placeholder="Jordan Lee" onInput={() => clearErr('name')} />
            <span className="err" aria-live="polite">{errors.name}</span>
          </div>
          <div className={field('email')}>
            <label htmlFor="f-email">Work email</label>
            <input className="input" id="f-email" name="email" type="email" autoComplete="email" placeholder="jordan@yourbrand.com" onInput={() => clearErr('email')} />
            <span className="err" aria-live="polite">{errors.email}</span>
          </div>
          <div className={field('brand')}>
            <label htmlFor="f-brand">Brand or store name</label>
            <input className="input" id="f-brand" name="brand" type="text" autoComplete="organization" placeholder="Your brand" onInput={() => clearErr('brand')} />
            <span className="err" aria-live="polite">{errors.brand}</span>
          </div>
          <div className={field('spend')}>
            <label htmlFor="f-spend">Monthly ad spend</label>
            <select className="input" id="f-spend" name="adSpend" defaultValue="" onChange={() => clearErr('spend')}>
              <option value="" disabled>Select a range</option>
              <option>&lt;$10K</option>
              <option>$10–50K</option>
              <option>$50–150K</option>
              <option>$150–500K</option>
              <option>$500K+</option>
            </select>
            <span className="err" aria-live="polite">{errors.spend}</span>
          </div>
          <fieldset className={field('mk', 'full')}>
            <legend>Marketplaces</legend>
            <div className="mk-grid">
              {['Amazon', 'TikTok Shop', 'Walmart', 'Target', 'Noon'].map((m) => (
                <label className="mk" key={m}>
                  <input type="checkbox" name="marketplaces" value={m} onChange={() => clearErr('mk')} />
                  <span>{m}</span>
                </label>
              ))}
            </div>
            <span className="err" aria-live="polite">{errors.mk}</span>
          </fieldset>
          <div className={field('link', 'full')}>
            <label htmlFor="f-link">Amazon store or ASIN link <span className="opt">(optional)</span></label>
            <input className="input" id="f-link" name="storeLink" type="url" inputMode="url" placeholder="https://www.amazon.com/stores/… or B0XXXXXXXX" onInput={() => clearErr('link')} />
            <span className="err" aria-live="polite">{errors.link}</span>
          </div>
          <div className="field full">
            <label htmlFor="f-problem">Biggest problem right now <span className="opt">(optional)</span></label>
            <textarea className="input" id="f-problem" name="problem" rows="4" placeholder="e.g. ACOS crept from 22% to 35% since Q3 and our agency keeps cutting bids." />
          </div>
          <div className="hp" aria-hidden="true">
            <label htmlFor="f-web">Website</label>
            <input id="f-web" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
        </div>
        <div className="form-bottom">
          <p>Your data is stored privately on our servers (or yours) and never shared. The audit uses read access only.</p>
          <button className={'btn btn-primary magnetic' + (status === 'sending' ? ' is-loading' : '')} type="submit" disabled={status === 'sending'}>
            <span>{status === 'sending' ? 'Assigning an agent…' : 'Get my free audit'}</span>
            <span className="spin" aria-hidden="true" />
          </button>
        </div>
        {status === 'error' && (
          <p className="form-status" role="alert">
            Your request didn't send. Check your connection and try again{contactEmail ? <>, or email <a href={'mailto:' + contactEmail}>{contactEmail}</a> and we'll start the audit by hand</> : null}.
          </p>
        )}
      </form>

      <div className="success" ref={success} tabIndex={-1}>
        <svg className="check" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" />
          <path d="M30 52l13 13 27-29" />
        </svg>
        <h3>Agent assigned. Your audit lands within 48 hours.</h3>
        <p>Check your inbox for a confirmation and access instructions.</p>
        <div className="log" aria-hidden="true">
          <span>[Audit Agent] assigned to <b>{brand || 'your brand'}</b></span>
          <span>[Audit Agent] queued: 60-day search term and placement pull</span>
          <span>[Audit Agent] checks: wasted spend, harvest gaps, placement mix, TACoS</span>
          <span className="ok">[Audit Agent] written breakdown due in ≤ 48h ✓</span>
        </div>
        {demo && <p className="demo-note">Development mode: AUDIT_FORM_URL is not set, so this request was not stored.</p>}
      </div>
    </div>
  )
}

/* ───────── Swipe position dots for the phone carousels ───────── */
export function SwipeDots({ count }) {
  const ref = useRef(null)
  const [active, setActive] = useState(0)
  useEffect(() => {
    const row = ref.current?.previousElementSibling
    if (!row) return
    const on = () => {
      const r = row.getBoundingClientRect().left
      let i = 0
      ;[...row.children].forEach((k, j) => { if (k.getBoundingClientRect().left - r < row.clientWidth * 0.4) i = j })
      setActive(i)
    }
    row.addEventListener('scroll', on, { passive: true })
    return () => row.removeEventListener('scroll', on)
  }, [])
  return (
    <div className="swipe-dots" ref={ref} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => <i key={i} className={i === active ? 'on' : ''} />)}
    </div>
  )
}
