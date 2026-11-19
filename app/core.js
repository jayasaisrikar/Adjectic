// Orbital "agent core": marketplaces orbit a central agent; data packets flow in,
// action packets flow out, and each landed action nudges that marketplace's metric.
// Drawn in ink on paper. A 2D canvas fallback runs on phones and low-power devices.

const INK = '#292723'
const CORAL = '#ed5939'
const CORAL_DEEP = '#b63e23'

export const CORE_MARKETS = [
  { name: 'Amazon', c: '#e47911', m: 'ACOS', v: 24.1, u: '%', dir: -1, lo: 18.5, hi: 25.5, step: 0.3, acts: ['TOS +40%, bid held', 'negated 14 terms', 'harvested 6 terms', 'budget moved to long-tail'] },
  { name: 'TikTok Shop', c: '#e5426f', m: 'ROI', v: 3.1, u: '×', dir: 1, lo: 2.6, hi: 4.4, step: 0.06, acts: ['creative #17 live', 'creator ad boosted', 'GMV Max capped'] },
  { name: 'Walmart', c: '#2a6fdb', m: 'ROAS', v: 4.8, u: '×', dir: 1, lo: 4.1, hi: 6.2, step: 0.07, acts: ['37 terms negated', 'top item bid +8%', 'Buy Box lost, ads paused'] },
  { name: 'Target', c: '#cc1f2d', m: 'ROAS', v: 4.4, u: '×', dir: 1, lo: 3.8, hi: 5.8, step: 0.07, acts: ['flight re-paced', 'spend to best ROAS', 'out-of-stock item paused'] },
  { name: 'Noon', c: '#c9a400', m: 'ACOS', v: 17.9, u: '%', dir: -1, lo: 13.5, hi: 19.5, step: 0.25, acts: ['dayparted 21:00 to 02:00', 'KSA bids −15%', 'organic #2, bid −12%'] },
]

const fmtMetric = (mk) => mk.v.toFixed(1) + mk.u

function nudgeMetric(mk) {
  const better = Math.random() < 0.72 ? 1 : -1
  mk.v += mk.dir * better * mk.step * (0.5 + Math.random())
  mk.v = Math.max(mk.lo, Math.min(mk.hi, mk.v))
  return better > 0
}

function makeLabels(host, markets) {
  const box = document.createElement('div')
  box.className = 'core-labels'
  box.setAttribute('aria-hidden', 'true')
  const els = markets.map((mk) => {
    const el = document.createElement('div')
    el.className = 'cl'
    el.innerHTML =
      `<span class="cl-n"><i style="background:${mk.c}"></i>${mk.name}</span>` +
      `<span class="cl-m">${mk.m} <b>${fmtMetric(mk)}</b><em>${mk.dir < 0 ? '▼' : '▲'}</em></span><span class="cl-a"></span>`
    box.appendChild(el)
    return el
  })
  host.appendChild(box)
  return { box, els }
}

function flashLabel(el, mk) {
  if (!el) return
  const good = nudgeMetric(mk)
  el.querySelector('.cl-m b').textContent = fmtMetric(mk)
  const em = el.querySelector('.cl-m em')
  em.textContent = (mk.dir < 0) === good ? '▼' : '▲'
  em.dataset.good = good ? '1' : '0'
  el.querySelector('.cl-a').textContent = mk.acts[Math.floor(Math.random() * mk.acts.length)]
  el.classList.add('flash')
  clearTimeout(el._t)
  el._t = setTimeout(() => el.classList.remove('flash'), 1700)
}

function softDot(THREE) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.45, 'rgba(255,255,255,.9)')
  g.addColorStop(0.7, 'rgba(255,255,255,.25)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

export function webglOK() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

/** Three.js version. Returns a cleanup function. */
export function createCore(THREE, canvas, opts) {
  THREE.ColorManagement.enabled = false
  const markets = CORE_MARKETS.map((m) => ({ ...m }))
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace
  const DPR = Math.min(window.devicePixelRatio || 1, 2)
  renderer.setPixelRatio(DPR)
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0, 12.5)
  const root = new THREE.Group()
  scene.add(root)
  const system = new THREE.Group()
  system.rotation.set(0.42, 0, -0.07)
  root.add(system)
  const disc = new THREE.Group()
  system.add(disc)
  const orbit = new THREE.Group()
  system.add(orbit)

  const cInk = new THREE.Color(INK)
  const cCoral = new THREE.Color(CORAL)
  const cDeep = new THREE.Color(CORAL_DEEP)
  const tex = softDot(THREE)
  const R = 3.4
  const tmp = new THREE.Vector3()
  const disposables = [tex]

  const lineMat = (color, op) => {
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false })
    disposables.push(m)
    return m
  }
  const circle = (r, seg) => {
    const p = []
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2
      p.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r))
    }
    const g = new THREE.BufferGeometry().setFromPoints(p)
    disposables.push(g)
    return g
  }

  // Orbital disc: main ring, guide rings, dashed boundary, spokes, sweep
  disc.add(new THREE.Line(circle(R, 180), lineMat(cInk, 0.55)))
  ;[1.5, 2.45, R * 1.32].forEach((r, i) => disc.add(new THREE.Line(circle(r, 140), lineMat(cInk, i === 2 ? 0.16 : 0.12))))
  const dashed = new THREE.Line(
    circle(R * 1.16, 220),
    new THREE.LineDashedMaterial({ color: cInk, dashSize: 0.05, gapSize: 0.14, transparent: true, opacity: 0.35 })
  )
  dashed.computeLineDistances()
  disc.add(dashed)
  const spk = []
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * Math.PI * 2
    spk.push(Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15, Math.cos(a) * R * 1.32, 0, Math.sin(a) * R * 1.32)
  }
  const spg = new THREE.BufferGeometry()
  spg.setAttribute('position', new THREE.Float32BufferAttribute(spk, 3))
  disc.add(new THREE.LineSegments(spg, lineMat(cInk, 0.07)))
  const sweep = new THREE.Mesh(
    new THREE.CircleGeometry(R * 1.32, 48, 0, 0.7),
    new THREE.MeshBasicMaterial({ color: cInk, transparent: true, opacity: 0.035, depthWrite: false, side: THREE.DoubleSide })
  )
  sweep.rotation.x = -Math.PI / 2
  const sweepPivot = new THREE.Group()
  sweepPivot.add(sweep)
  disc.add(sweepPivot)

  // Agent core: coral fresnel sphere, ink wireframe "brain", two gyro rings
  const coreMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uBoost: { value: 0 }, uA: { value: cCoral }, uB: { value: cDeep } },
    vertexShader:
      'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader:
      'uniform float uTime;uniform float uBoost;uniform vec3 uA;uniform vec3 uB;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-max(dot(vN,vV),0.),2.2);vec3 c=mix(uA,uB,f*.8);gl_FragColor=vec4(c*(1.-f*.25),1.);}',
    transparent: false,
  })
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 48), coreMat)
  root.add(core)
  const brain = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.68, 1)), lineMat(cInk, 0.28))
  root.add(brain)
  const gyro1 = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.009, 6, 160), new THREE.MeshBasicMaterial({ color: cInk, transparent: true, opacity: 0.7 }))
  const gyro2 = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.007, 6, 160), new THREE.MeshBasicMaterial({ color: cCoral, transparent: true, opacity: 0.8 }))
  root.add(gyro1)
  root.add(gyro2)
  let coreBoost = 0

  // Marketplace stations with stacked product cartons
  const labels = opts.labels ? makeLabels(canvas.parentNode, markets) : null
  const stations = markets.map((mk, i) => {
    const col = new THREE.Color(mk.c)
    const a = (i / markets.length) * Math.PI * 2 - Math.PI / 2
    const g = new THREE.Group()
    g.position.set(Math.cos(a) * R, 0, Math.sin(a) * R)
    orbit.add(g)
    const hex = new THREE.CylinderGeometry(0.46, 0.5, 0.08, 6)
    g.add(new THREE.Mesh(hex, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.18, depthWrite: false })))
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(hex), lineMat(col, 1)))
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.25, 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6 }))
    beam.position.y = 0.62
    g.add(beam)
    const prods = []
    for (let j = 0; j < 3; j++) {
      const s = 0.19 + (j === 1 ? 0.06 : 0)
      const bg = new THREE.BoxGeometry(s, s * 0.82, s)
      const box = new THREE.Group()
      box.add(new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: new THREE.Color('#f1d9c4'), transparent: true, opacity: 0.95, depthWrite: true })))
      box.add(new THREE.LineSegments(new THREE.EdgesGeometry(bg), lineMat(cInk, 0.85)))
      const tape = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-s / 2, s * 0.41, 0), new THREE.Vector3(s / 2, s * 0.41, 0)])
      box.add(new THREE.Line(tape, lineMat(col, 1)))
      box.position.set((j - 1) * 0.3, 0.28 + (j === 1 ? 0.16 : 0), j === 1 ? -0.05 : 0.08)
      g.add(box)
      prods.push({ o: box, y: box.position.y, ph: Math.random() * 6.28 })
    }
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.52, 0.58, 6),
      new THREE.MeshBasicMaterial({ color: cCoral, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
    )
    ring.rotation.x = -Math.PI / 2
    g.add(ring)
    const anchor = new THREE.Object3D()
    anchor.position.y = 1.45
    g.add(anchor)
    const p0 = g.position.clone()
    const O = new THREE.Vector3()
    const inC = new THREE.QuadraticBezierCurve3(p0, new THREE.Vector3(p0.x * 0.45, 2.1, p0.z * 0.45), O)
    const outC = new THREE.QuadraticBezierCurve3(O, new THREE.Vector3(p0.x * 0.55, -1.2, p0.z * 0.55), p0.clone())
    orbit.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(inC.getPoints(64)), lineMat(col, 0.45)))
    orbit.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(outC.getPoints(64)), lineMat(cCoral, 0.3)))
    return { g, mk, inC, outC, ring, prods, pulse: 0, anchor, el: labels ? labels.els[i] : null }
  })

  // Packets: data in (marketplace colour), actions out (coral)
  const packets = []
  stations.forEach((s, si) => {
    for (let q = 0; q < 4; q++) packets.push({ s: si, out: false, t: Math.random(), v: 0.22 + Math.random() * 0.22 })
    for (let r = 0; r < 2; r++) packets.push({ s: si, out: true, t: Math.random(), v: 0.16 + Math.random() * 0.14 })
  })
  const pk = new Float32Array(packets.length * 3)
  const pc = new Float32Array(packets.length * 3)
  packets.forEach((p, i) => {
    const c = p.out ? cCoral : new THREE.Color(stations[p.s].mk.c)
    pc[i * 3] = c.r
    pc[i * 3 + 1] = c.g
    pc[i * 3 + 2] = c.b
  })
  const pg = new THREE.BufferGeometry()
  pg.setAttribute('position', new THREE.BufferAttribute(pk, 3))
  pg.setAttribute('color', new THREE.BufferAttribute(pc, 3))
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ map: tex, size: 0.26, vertexColors: true, transparent: true, depthWrite: false }))
  pts.frustumCulled = false
  orbit.add(pts)

  // Ambient data dust drifting into the core
  const PN = opts.particles || 700
  const seed = new Float32Array(PN * 4)
  const dummy = new Float32Array(PN * 3)
  for (let q = 0; q < PN; q++) {
    seed[q * 4] = Math.random() * 6.283
    seed[q * 4 + 1] = Math.acos(2 * Math.random() - 1)
    seed[q * 4 + 2] = 0.03 + Math.random() * 0.05
    seed[q * 4 + 3] = Math.random()
  }
  const fg = new THREE.BufferGeometry()
  fg.setAttribute('position', new THREE.BufferAttribute(dummy, 3))
  fg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
  const flowMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPR: { value: DPR }, uA: { value: cCoral }, uB: { value: cInk } },
    vertexShader:
      'uniform float uTime;uniform float uPR;attribute vec4 aSeed;varying float vA;varying float vP;void main(){float p=fract(uTime*aSeed.z+aSeed.w);float r=mix(9.5,.8,pow(p,.8));float th=aSeed.x+p*2.6;float ph=aSeed.y;vec3 pos=vec3(r*sin(ph)*cos(th),r*cos(ph)*.7,r*sin(ph)*sin(th));vA=smoothstep(0.,.2,p)*(1.-smoothstep(.85,1.,p));vP=p;vec4 mv=modelViewMatrix*vec4(pos,1.);gl_PointSize=(1.2+1.6*p)*uPR*(9./-mv.z);gl_Position=projectionMatrix*mv;}',
    fragmentShader:
      'uniform vec3 uA;uniform vec3 uB;varying float vA;varying float vP;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.15,d);gl_FragColor=vec4(mix(uB,uA,vP),a*vA*.28);}',
    transparent: true,
    depthWrite: false,
  })
  const flow = new THREE.Points(fg, flowMat)
  flow.frustumCulled = false
  root.add(flow)

  // Interaction + lifecycle
  let mx = 0, my = 0, rx = 0, ry = 0, running = false, visible = false, last = 0, W = 1, H = 1, raf = 0
  const clock = new THREE.Clock()
  const onMove = (e) => {
    mx = (e.clientX / innerWidth) * 2 - 1
    my = (e.clientY / innerHeight) * 2 - 1
  }
  if (opts.interactive) window.addEventListener('mousemove', onMove, { passive: true })

  function resize() {
    W = canvas.clientWidth
    H = canvas.clientHeight
    if (!W || !H) return
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    camera.updateProjectionMatrix()
    const wide = W / H > 1.25
    if (opts.backdrop) {
      // hero background: orbit sits low and wide so its disc frames the headline
      const ar = W / H
      root.position.set(0, ar > 1.2 ? -2.85 : -2.9, 0)
      root.scale.setScalar(ar > 1.2 ? Math.min(1.4, 0.5 * ar + 0.45) : 0.62 * ar + 0.3)
    } else if (opts.center) {
      root.position.set(0, -0.1, 0)
      root.scale.setScalar(Math.min(1.05, 0.62 * (W / H) + 0.25))
    } else if (wide) {
      const ar = W / H
      root.position.set(Math.min(3.3, 1.75 * ar), 1.2, 0)
      root.scale.setScalar(Math.min(0.74, 0.45 * ar))
    } else {
      root.position.set(0, 1.9, 0)
      root.scale.setScalar(0.72)
    }
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  function placeLabels() {
    if (!labels) return
    stations.forEach((s) => {
      s.anchor.getWorldPosition(tmp)
      const z = tmp.z
      tmp.project(camera)
      const x = (tmp.x * 0.5 + 0.5) * W
      const y = (-tmp.y * 0.5 + 0.5) * H
      s.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-100%)`
      s.el.style.opacity = z < -0.6 ? 0.4 : 1
      s.el.style.zIndex = z < -0.6 ? 0 : 2
    })
  }

  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const t = clock.getElapsedTime()
    const dt = Math.min(0.05, t - last)
    last = t
    coreMat.uniforms.uTime.value = t
    flowMat.uniforms.uTime.value = t
    coreBoost *= 0.94
    coreMat.uniforms.uBoost.value = coreBoost
    orbit.rotation.y += dt * 0.11
    sweepPivot.rotation.y -= dt * 0.7
    dashed.rotation.y -= dt * 0.04
    brain.rotation.y -= dt * 0.5
    brain.rotation.x += dt * 0.2
    gyro1.rotation.x = t * 0.6
    gyro1.rotation.y = t * 0.3
    gyro2.rotation.y = -t * 0.45
    gyro2.rotation.z = t * 0.25
    const pulse = 1 + Math.sin(t * 2.2) * 0.04 + coreBoost * 0.12
    core.scale.setScalar(pulse)
    stations.forEach((s) => {
      s.pulse *= 0.955
      s.ring.material.opacity = s.pulse * 0.45
      s.ring.scale.setScalar(1 + (1 - s.pulse) * 1.6)
      s.g.rotation.y = -orbit.rotation.y
      s.prods.forEach((p) => {
        p.o.position.y = p.y + Math.sin(t * 1.6 + p.ph) * 0.05
        p.o.rotation.y = Math.sin(t * 0.7 + p.ph) * 0.5
      })
    })
    for (let i = 0; i < packets.length; i++) {
      const p = packets[i]
      const st = stations[p.s]
      p.t += dt * p.v
      if (p.t >= 1) {
        p.t = 0
        if (p.out) {
          st.pulse = 1
          flashLabel(st.el, st.mk)
        } else coreBoost = Math.min(1, coreBoost + 0.25)
      }
      ;(p.out ? st.outC : st.inC).getPoint(p.t, tmp)
      pk[i * 3] = tmp.x
      pk[i * 3 + 1] = tmp.y
      pk[i * 3 + 2] = tmp.z
    }
    pg.attributes.position.needsUpdate = true
    rx += (my * 0.18 - rx) * 0.04
    ry += (mx * 0.3 - ry) * 0.04
    root.rotation.x = rx
    root.rotation.y = ry
    renderer.render(scene, camera)
    placeLabels()
  }
  function setRun() {
    const should = visible && !document.hidden
    if (should && !running) {
      running = true
      clock.getDelta()
      raf = requestAnimationFrame(frame)
    } else if (!should) {
      running = false
      cancelAnimationFrame(raf)
    }
  }
  const io = new IntersectionObserver((en) => {
    visible = en[0].isIntersecting
    setRun()
  }, { rootMargin: '100px' })
  io.observe(canvas)
  document.addEventListener('visibilitychange', setRun)
  renderer.render(scene, camera)
  placeLabels()
  requestAnimationFrame(() => {
    canvas.classList.add('is-ready')
    if (labels) labels.box.classList.add('is-ready')
  })

  return () => {
    running = false
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', setRun)
    window.removeEventListener('mousemove', onMove)
    if (labels) labels.box.remove()
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) o.material.dispose()
    })
    disposables.forEach((d) => d.dispose && d.dispose())
    renderer.dispose()
  }
}

/** 2D canvas version for phones, low-power devices and reduced motion. */
export function createFallback(canvas, opts, reduceMotion) {
  const ctx = canvas.getContext('2d')
  const DPR = Math.min(window.devicePixelRatio || 1, 2)
  let w, h, cx, cy, R, running = false, visible = false, raf = 0
  function resize() {
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = w * DPR
    canvas.height = h * DPR
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    const wide = w > h * 1.25
    cx = opts.center || opts.backdrop ? w / 2 : wide ? w * 0.72 : w / 2
    cy = opts.backdrop ? h * 0.76 : opts.center ? h * 0.52 : wide ? h * 0.42 : Math.min(h * 0.26, 300)
    R = opts.backdrop ? Math.min(w * 0.44, 320) : Math.min(w * 0.38, opts.center ? h * 0.9 : 230, 260)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  function hexPath(x, y, r, sq) {
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r * sq)
    }
    ctx.closePath()
  }
  function draw(t) {
    ctx.clearRect(0, 0, w, h)
    const BA = opts.center || opts.backdrop ? 1 : w > h * 1.25 ? 0.9 : 0.5
    ctx.globalAlpha = BA
    const sq = 0.36
    const pulse = 1 + Math.sin(t / 500) * 0.05
    const cr = R * 0.2 * pulse
    ctx.fillStyle = '#ed5939'
    ctx.beginPath()
    ctx.arc(cx, cy, cr * 0.9, 0, 6.283)
    ctx.fill()
    ctx.strokeStyle = 'rgba(41,39,35,.6)'
    ctx.beginPath()
    ctx.arc(cx, cy, cr * 1.35, 0, 6.283)
    ctx.stroke()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(41,39,35,.5)'
    ctx.beginPath()
    ctx.ellipse(cx, cy, R, R * sq, 0, 0, 6.283)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(41,39,35,.3)'
    ctx.setLineDash([2, 6])
    ctx.beginPath()
    ctx.ellipse(cx, cy, R * 1.18, R * 1.18 * sq, 0, 0, 6.283)
    ctx.stroke()
    ctx.setLineDash([])
    const rot = t * 0.00012
    const st = CORE_MARKETS.map((mk, i) => {
      const a = (i / CORE_MARKETS.length) * 6.283 - 1.57 + rot
      return { mk, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R * sq, front: Math.sin(a) }
    }).sort((a, b) => a.front - b.front)
    st.forEach((s, i) => {
      const qx = (s.x + cx) / 2
      const qy = Math.min(s.y, cy) - R * 0.45
      ctx.strokeStyle = s.mk.c + '77'
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.quadraticCurveTo(qx, qy, cx, cy)
      ctx.stroke()
      for (let k = 0; k < 2; k++) {
        const u = (t * 0.00035 + k * 0.5 + i * 0.17) % 1
        const iu = 1 - u
        const px = iu * iu * s.x + 2 * iu * u * qx + u * u * cx
        const py = iu * iu * s.y + 2 * iu * u * qy + u * u * cy
        ctx.fillStyle = k ? '#ed5939' : s.mk.c
        ctx.beginPath()
        ctx.arc(px, py, 2.6, 0, 6.283)
        ctx.fill()
      }
      ctx.globalAlpha = BA * (s.front > 0 ? 1 : 0.45)
      hexPath(s.x, s.y, 15, sq * 1.4)
      ctx.fillStyle = s.mk.c + '30'
      ctx.fill()
      ctx.strokeStyle = s.mk.c
      ctx.stroke()
      ctx.fillStyle = '#f1d9c4'
      ctx.strokeStyle = 'rgba(41,39,35,.85)'
      ctx.fillRect(s.x - 10, s.y - 20, 9, 8)
      ctx.strokeRect(s.x - 10, s.y - 20, 9, 8)
      ctx.fillRect(s.x + 1, s.y - 23, 10, 11)
      ctx.strokeRect(s.x + 1, s.y - 23, 10, 11)
      if (opts.labels && w > h * 1.25) {
        ctx.font = '500 11px "IBM Plex Mono", monospace'
        ctx.fillStyle = '#292723'
        ctx.textAlign = 'center'
        ctx.fillText(s.mk.name, s.x, s.y - 30)
      }
      ctx.globalAlpha = BA
    })
    ctx.globalAlpha = 1
  }
  function loop(t) {
    if (!running) return
    draw(t)
    raf = requestAnimationFrame(loop)
  }
  if (reduceMotion) {
    draw(0)
    canvas.classList.add('is-ready')
    return () => ro.disconnect()
  }
  function setRun() {
    const s = visible && !document.hidden
    if (s && !running) {
      running = true
      raf = requestAnimationFrame(loop)
    } else if (!s) {
      running = false
      cancelAnimationFrame(raf)
    }
  }
  const io = new IntersectionObserver((en) => {
    visible = en[0].isIntersecting
    setRun()
  })
  io.observe(canvas)
  document.addEventListener('visibilitychange', setRun)
  canvas.classList.add('is-ready')
  return () => {
    running = false
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', setRun)
  }
}
