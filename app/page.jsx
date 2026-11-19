import { site } from './site'
import { SiteMotion, Header, CoreCanvas, DecisionFeed, HowLoop, CaseBoard, Faq, Calculator, AuditForm, SwipeDots } from './interactive'

const Ico = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

/* Marketplace marks, drawn as app-icon tiles. TikTok and Target paths are from simple-icons (CC0);
   Amazon, Walmart and Noon are simplified renditions. Trademarks belong to their owners. */
const TIKTOK = 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'
const TARGET = 'M12.0005 0C18.627 0 24 5.373 24 12.0005 24 18.627 18.627 24 11.9995 24 5.373 24 0 18.627 0 11.9995 0 5.373 5.373 0 12.0005 0zm0 19.826a7.8265 7.8265 0 10-.001-15.652C7.7133 4.2246 4.2653 7.7136 4.2653 12c0 4.2864 3.448 7.7754 7.7342 7.826h.001zm0-3.9853a3.8402 3.8402 0 110-7.6803c2.1204.0006 3.839 1.7197 3.839 3.8401s-1.7186 3.8396-3.839 3.8402z'

function MarketLogo({ m }) {
  if (m === 'amz')
    return (
      <span className="mlogo" style={{ background: '#232f3e' }}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <text x="12" y="14.2" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff" fontFamily="Arial, Helvetica, sans-serif">a</text>
          <path d="M5.2 16.4c4.3 2.7 9.4 2.8 13.4.3" fill="none" stroke="#ff9900" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16.6 15.6l2.3.9-.6 2.3" fill="none" stroke="#ff9900" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  if (m === 'tts')
    return (
      <span className="mlogo" style={{ background: '#010101' }}>
        <svg viewBox="-2 -2 28 28" aria-hidden="true">
          <path d={TIKTOK} fill="#25f4ee" transform="translate(-0.7 -0.7)" />
          <path d={TIKTOK} fill="#fe2c55" transform="translate(0.7 0.7)" />
          <path d={TIKTOK} fill="#fff" />
        </svg>
      </span>
    )
  if (m === 'wmt')
    return (
      <span className="mlogo" style={{ background: '#0071ce' }}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {[0, 60, 120, 180, 240, 300].map((r) => (
            <rect key={r} x="10.6" y="2.2" width="2.8" height="7.2" rx="1.4" fill="#ffc220" transform={`rotate(${r} 12 12)`} />
          ))}
        </svg>
      </span>
    )
  if (m === 'tgt')
    return (
      <span className="mlogo" style={{ background: '#fff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)' }}>
        <svg viewBox="-3 -3 30 30" aria-hidden="true"><path d={TARGET} fill="#cc0000" /></svg>
      </span>
    )
  return (
    <span className="mlogo" style={{ background: '#feee00' }}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <text x="12" y="14.6" textAnchor="middle" fontSize="8.6" fontWeight="800" fill="#1c1c1c" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="-.3">noon</text>
      </svg>
    </span>
  )
}

function Brand({ label = 'Adgentic home' }) {
  return (
    <a href="#top" className="logo" aria-label={label}>
      <img src="/images/adgentic.svg" alt="" width="28" height="28" />
      Adgentic
    </a>
  )
}

/* ───────── How-it-works stage drawings (dark tile) ───────── */
const stages = [
  <svg key="o" viewBox="0 0 400 400">
    <defs>
      <radialGradient id="sweepGrad" cx="0" cy="1" r="1">
        <stop offset="0" stopColor="#f3efe8" stopOpacity=".22" />
        <stop offset="1" stopColor="#f3efe8" stopOpacity="0" />
      </radialGradient>
    </defs>
    {[60, 110, 160].map((r) => <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="rgba(243,239,232,.12)" />)}
    <g className="sweep"><path d="M200 200 L200 40 A160 160 0 0 1 338.6 120 Z" fill="url(#sweepGrad)" /></g>
    <g fill="#f3efe8">
      {[[268, 118], [300, 236], [148, 290], [110, 150], [236, 320], [176, 96], [96, 236], [330, 170]].map(([x, y]) => <circle key={x} className="blip" cx={x} cy={y} r="4.5" />)}
    </g>
    <text x="278" y="112">search terms</text><text x="310" y="240">CPC</text><text x="62" y="306">placements</text><text x="40" y="140">Buy Box</text>
    <text x="246" y="336">inventory</text><text x="140" y="84">organic rank</text><text x="22" y="252">coupons</text><text x="340" y="164">CVR</text>
    <circle cx="200" cy="200" r="9" fill="#ed5939" />
  </svg>,
  <svg key="d" viewBox="0 0 400 400">
    <g stroke="rgba(243,239,232,.4)" strokeWidth="1.2" fill="none">
      {['M80 90 Q150 120 200 200', 'M320 90 Q250 130 200 200', 'M60 230 Q130 220 200 200', 'M340 240 Q270 220 200 200', 'M130 330 Q160 260 200 200', 'M280 330 Q240 260 200 200'].map((d) => (
        <path key={d} className="dg-line" d={d} />
      ))}
    </g>
    <g fill="#34312c">
      <rect x="30" y="72" width="100" height="34" rx="17" /><rect x="270" y="72" width="104" height="34" rx="17" /><rect x="8" y="214" width="104" height="34" rx="17" />
      <rect x="290" y="224" width="104" height="34" rx="17" /><rect x="80" y="316" width="104" height="34" rx="17" /><rect x="230" y="316" width="104" height="34" rx="17" />
    </g>
    <text x="48" y="94">CPC +22%</text><text x="286" y="94">coupon −20%</text><text x="24" y="236">Buy Box 71%</text>
    <text x="306" y="246">TOS share ↓</text><text x="100" y="338">stock 18d</text><text x="250" y="338">CVR −3.1pt</text>
    <g className="dg-core">
      <circle cx="200" cy="200" r="44" fill="#ed5939" />
      <text x="200" y="197" textAnchor="middle" className="hi">root</text>
      <text x="200" y="212" textAnchor="middle" className="hi">cause</text>
    </g>
  </svg>,
  <svg key="a" viewBox="0 0 400 400">
    {[
      ['Top-of-search placement', 104, 110, '120px', '+20%', ''],
      ['Budget on exact long-tail', 194, 90, '150px', '+15%', 'k2'],
      ['Bid on low-stock variation', 284, 290, '-110px', '−20%', 'k3'],
    ].map(([label, y, x, kx, v, k]) => (
      <g key={label}>
        <text x="50" y={y}>{label}</text>
        <rect x="50" y={y + 12} width="300" height="4" rx="2" fill="rgba(243,239,232,.14)" />
        <g className={'knob ' + k} style={{ '--kx': kx }}>
          <circle cx={x} cy={y + 14} r="11" fill="#f3efe8" />
        </g>
        <text x="350" y={y} textAnchor="end" className="hi">{v}</text>
      </g>
    ))}
    <text x="50" y="352" className="ok">All moves within the 25% daily limit</text>
  </svg>,
  <div key="r" className="report-card">
    <div className="rc-h"><span>Amazon PPC Agent</span><span>Mon 09:00</span></div>
    <div className="rc-l"><b>What changed</b> Raised the top-of-search adjustment by 20% and excluded 63 search terms</div>
    <div className="rc-l"><b>Why</b> Top-of-search clicks converted at 2.3× the rate of other search placements</div>
    <div className="rc-l"><b>Expected</b> <span className="ok">ACOS −2.5 to −3.5 pts over 14 days</span></div>
    <div className="rc-l"><b>Needs you</b> SKU-K22 reorder, 18 days of cover</div>
  </div>,
]

const steps = [
  ['Observe', 'See what changed.', 'The agent reads bids and search terms alongside sales, prices and inventory. On Amazon, it also checks whether your offer still holds the Buy Box.'],
  ['Diagnose', 'Explain the change.', 'Did clicks get more expensive, or did fewer shoppers buy? The agent weighs the evidence for each explanation before choosing a response.'],
  ['Act', 'Make a targeted adjustment.', 'If a search term keeps spending without an order, the agent can exclude it. If another term consistently converts, it can move budget there within your limits.'],
  ['Report', 'You hear what changed and why.', 'Your update lists the action, the evidence and the expected impact. Check the actual numbers in the marketplace console you already use.'],
]

const guardrails = [
  ['Budget caps', 'Hard daily and monthly caps per marketplace. Agents pace inside them and cannot exceed them.', <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></>],
  ['Bid ceilings', 'Maximum CPC per keyword tier, agreed with you. No runaway bids on a hot term.', <><path d="M4 20h16M6 16l4-6 4 3 5-8" /><path d="M3 4h18" strokeDasharray="2 3" /></>],
  ['Daily change limits', 'By default, bid and budget changes are capped at 25% per day. Larger adjustments wait until the limit allows them.', <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>],
  ['Protected keywords', 'Hero keywords and ASINs are locked. Agents defend them and never cut them to hit an ACOS number.', <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />],
  ['Anomaly kill-switch', 'Spend pacing, CPC or CVR outside its normal range? The agent pauses that spend and alerts you.', <path d="M12 2v10M6.3 6.3a8 8 0 1 0 11.4 0" />],
  ['Full decision log', 'Every action is recorded with a timestamp, the data behind it, the reason and the expected impact.', <><path d="M7 3h8l4 4v14H7z" /><path d="M15 3v4h4M10 12h6M10 16h6" /></>],
]

const agents = [
  { key: 'amz', name: 'Amazon', full: 'Amazon PPC Agent', sub: 'Sponsored Products, Brands and Display',
    monitors: 'Search terms, CPC, placements, impression share, Buy Box, inventory, organic rank and CVR by ASIN.',
    decides: 'What to harvest, what to negate, and where each dollar goes by placement and hour.',
    actions: ['Harvests converting auto and broad terms into exact match', 'Raises top-of-search when it out-converts rest-of-search', 'Throttles ASINs under 21 days of inventory cover'] },
  { key: 'tts', name: 'TikTok Shop', full: 'TikTok Shop Agent', sub: 'GMV Max, product ads and creators',
    monitors: 'Creative CTR and hook-rate decay, GMV by creative, affiliate and creator sales, CPA and ROI.',
    decides: 'Which creatives to rotate, which creator content to amplify, where to cap spend.',
    actions: ['Spots creative fatigue before CPA spikes and rotates fresh creative', 'Puts spend behind creator videos that already convert', 'Caps GMV Max budgets when ROI drops under target'] },
  { key: 'wmt', name: 'Walmart', full: 'Walmart Connect Agent', sub: 'Sponsored Products and Sponsored Brands',
    monitors: 'Keyword bids, item page CVR, Buy Box, share of voice and in-stock rate.',
    decides: 'Bid level per keyword, which keywords to add or negate, budget per item.',
    actions: ['Negates zero-order terms past a spend threshold', 'Moves bids on top performers, always under the ceiling', 'Pauses ads on items that lose the Buy Box'] },
  { key: 'tgt', name: 'Target', full: 'Target Roundel Agent', sub: 'Target marketplace and Roundel campaigns',
    monitors: 'Campaign ROAS, search and category placements, flight pacing, item availability.',
    decides: 'Budget pacing across flights, which items to push, which placements to scale.',
    actions: ["Re-paces flight budgets so they don't burn out early", 'Shifts spend toward the best-ROAS items', 'Pulls spend from out-of-stock items the same cycle'] },
  { key: 'noon', name: 'Noon', full: 'Noon Ads Agent', sub: 'Sponsored products in the UAE and KSA',
    monitors: 'CPC by hour and region, sponsored vs organic rank, seasonal peaks like Ramadan and White Friday, stock.',
    decides: 'Dayparting, bids by country, and when sponsored spend is cannibalising organic sales.',
    actions: ['Dayparts bids around peak hours in the UAE and KSA', 'Trims bids where organic rank already holds the top 3', 'Scales budgets ahead of seasonal peaks, not after'] },
]

const training = [
  ['Meta Ads', 'Retargets your marketplace shoppers on Facebook and Instagram, judged on marketplace sales, not clicks.', 68],
  ['Google Shopping', 'Runs Shopping and Performance Max for your D2C store with the same diagnose-first loop.', 54],
  ['Inventory and Forecast', 'Forecasts stock-outs and tells every ad agent when to push and when to throttle.', 41],
  ['Listing and SEO', 'Finds conversion leaks on your listings and tests titles, bullets and images against CVR.', 33],
]

export default function Page() {
  const { auditFormUrl, auditUrl, calendarUrl, contactEmail, minFee, caseOutcome, isDev } = site
  const formEnabled = !!auditFormUrl || isDev
  const auditOpen = formEnabled || !!auditUrl
  const outcomeReady = Object.values(caseOutcome).every((v) => v != null)
  const minFeeText = minFee != null ? `$${minFee.toLocaleString('en-US')}` : null
  const auditHref = formEnabled ? '#audit' : auditUrl || '#agents'

  const faqs = [
    ['Do I approve every bid change?', 'You approve the limits at onboarding. Within those limits, agents can adjust bids and budgets around the clock. You get a written record of their decisions and can pause any agent at any time.'],
    ['What stops an agent from overspending or making a bad call?', 'Guardrails the agent cannot override. Hard daily and monthly budget caps. Bid ceilings per keyword tier. A maximum daily change limit (25% by default), so no bid or budget swings overnight. Protected hero keywords and ASINs that agents defend but never cut. An anomaly kill-switch that pauses spend and alerts you if pacing, CPC or conversion rate moves outside its normal range. And a full decision log: every action has a timestamp, the data behind it and the reason.'],
    ['Do I need to learn a new dashboard?', "No. You measure performance where you already do: the Amazon Ads console, Seller Central, Walmart Connect, TikTok Shop Seller Center, Target's Roundel reporting and Noon's seller tools. The agents send you written updates on what changed, why, and the expected impact. Nothing new to log into."],
    ['Which marketplaces do you support?', 'Five agents are live today: Amazon (Sponsored Products, Sponsored Brands, Sponsored Display), TikTok Shop, Walmart Connect, Target (Roundel) and Noon in the UAE and Saudi Arabia. Agents for Meta Ads, Google Shopping, Inventory and Forecasting, and Listing and SEO are in training.'],
    ['What changes should I look for first?', "Look for excluded search terms, corrected bids and budget shifts in the first one to two weeks. Use a longer window, typically 60 to 90 days, to assess placement changes and advertising cost against total sales. Track both in your own reports."],
    ['Will you need access to my Seller Central or ad account?', "Yes, the agents need access to act. For advertising, we connect through each marketplace's official advertising access (for Amazon, an authorized Amazon Ads API connection) with campaign management permissions. For Seller Central, we ask for a user with view access to inventory, pricing and business reports, so the agents can see Buy Box, stock and conversion data. We never need access to payments, disbursements or account settings. You can revoke access at any time."],
    ['Is my data safe? Where is it stored?', "Yes. The account data our agents read (search terms, bids, sales, inventory) is stored only on Adgentic's private servers. If you'd rather keep it in-house, the agents can run on your own server or localhost. Your data is never shared with third parties, never sold, never sent to data brokers or ad networks, and never used to train models for other brands. Access runs through official marketplace permissions with no payment access, you can revoke it at any time, and we delete your data on request."],
    ['How is pricing calculated? Any setup fee or lock-in?', `3% of your monthly ad spend across the marketplaces we manage${minFeeText ? `, with a minimum monthly fee of ${minFeeText}` : ', with a monthly minimum confirmed at onboarding'}. All live agents for the marketplaces you sell on are included. No setup fee. No long-term contract: we work month to month and you can cancel with 30 days' notice.`],
    ['What happens in the free audit?', 'You fill in the form and grant read access, or send 60 days of search term and campaign reports. An audit agent reviews your search terms, bids, placements, campaign structure, budget pacing and wasted spend. Within 48 hours you get a written breakdown: where money is leaking, which growth gaps exist, and what the agents would change first. No obligation, no sales deck.'],
  ]

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteMotion />
      <Header cta={<a href={auditHref} className="btn btn-primary btn-sm">{auditOpen ? 'Free audit' : 'Agents'}</a>}>
        <Brand />
      </Header>

      <div className="page">
        <main id="main">
          {/* ───────── Hero: statement left, the live agent orbit right ───────── */}
          <section className="hero" id="top" aria-labelledby="hero-title">
            <div className="container hero-grid">
              <div className="hero-copy">
                <h1 id="hero-title" data-hero>Your ad accounts,<br /> run by agents that<br /> <span>actually think.</span></h1>
                <p className="lead" data-hero>
                  A competitor runs a coupon. Your best seller runs low. Our AI agents check what changed before they touch your bids.
                </p>
                <div className="cta-row" data-hero>
                  <a href={auditHref} className="btn btn-primary magnetic">{auditOpen ? 'Get a free audit' : 'Meet the agents'}</a>
                  {calendarUrl ? (
                    <a href={calendarUrl} className="text-link" target="_blank" rel="noopener">Book a strategy call</a>
                  ) : (
                    <a href="#case-study" className="text-link">See an investigation</a>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* ───────── Proof bento: feed, photo, numbers ───────── */}
          <section className="section" id="decision-proof" aria-labelledby="proof-title">
            <div className="container">
              <header className="head center" data-reveal>
                <h2 id="proof-title">Every decision, <span>in writing.</span></h2>
                <p>See how five marketplace agents handle a shift in demand, a bid that hits its ceiling, or a product running low. The feed shows example decisions.</p>
              </header>
              <div className="bento">
                <div className="tile tile-feed" data-reveal><DecisionFeed /></div>
                <figure className="tile tile-photo" data-reveal>
                  <img src="/images/parcel.jpg" alt="An open orange shipping carton resting on two stacked paper pedestals" width="1448" height="1086" loading="lazy" />
                  <figcaption>
                    <strong data-count="25" data-prefix="$" data-suffix="M+">$25M+</strong>
                    <span>in ad spend managed</span>
                  </figcaption>
                </figure>
                <div className="tile tile-num" data-reveal><strong data-count="5">5</strong><span>marketplaces, one specialist agent each</span></div>
                <div className="tile tile-num" data-reveal><strong data-count="24" data-suffix="/7">24/7</strong><span>account monitoring</span></div>
                <div className="tile tile-num" data-reveal><strong data-count="0" data-from="15">0</strong><span>new dashboards to learn</span></div>
              </div>
            </div>
          </section>

          {/* ───────── Problem ───────── */}
          <section className="section" id="problem" aria-labelledby="problem-title">
            <div className="container">
              <header className="head center" data-reveal>
                <h2 id="problem-title">Your ACOS went up. <span>Nobody asked why.</span></h2>
                <p>Your advertising cost of sales (ACOS) can rise even when bids stay flat. A rival’s discount, a lost Buy Box, or a change in where your ads appear can all explain the jump.</p>
              </header>
              <div className="trio">
                <article className="tile tile-plain" data-reveal>
                  <div className="vis">
                    <div className="code-chip">
                      <s>if acos &gt; 30%: bid *= 0.90</s>
                      <span>hero keyword bid cut 4 times in 9 days</span>
                      <span>rank #3 to #11, sales −22%</span>
                    </div>
                  </div>
                  <h3>A bid rule sees one number.</h3>
                  <p>Fixed-ACOS automation sees a number go up and cuts bids, often on the keywords that hold your organic rank. The real cause never gets looked at.</p>
                </article>
                <article className="tile tile-plain" data-reveal>
                  <div className="vis">
                    <div className="am-bar" aria-hidden="true">
                      {Array.from({ length: 15 }, (_, i) => <span key={i} className={i === 2 ? 'hot' : ''}>{i === 2 ? 'You' : ''}</span>)}
                    </div>
                  </div>
                  <h3>A weekly review can miss six days.</h3>
                  <p>If a competitor discounts its best seller on Tuesday, your ads can keep spending until the next account review.</p>
                </article>
                <article className="tile tile-plain" data-reveal>
                  <div className="vis">
                    <div className="silos" aria-hidden="true"><span>Ads</span><span>Inventory</span><span>Pricing</span><span>Rank</span></div>
                  </div>
                  <h3>Data lives in silos.</h3>
                  <p>Ads in one tool, inventory in Seller Central, pricing in a spreadsheet. It takes all three to explain why the same clicks now generate fewer orders.</p>
                </article>
              </div>
              <SwipeDots count={3} />
            </div>
          </section>

          {/* ───────── How ───────── */}
          <section className="section tint" id="how" aria-labelledby="how-title">
            <div className="container">
              <header className="head center" data-reveal>
                <h2 id="how-title">Observe. Diagnose. <span>Act. Report.</span></h2>
                <p>Follow one decision from the first change in your account to the update in your inbox.</p>
              </header>
              <HowLoop stages={stages}>
                {steps.map(([title, tagline, body], i) => (
                  <li className="step" data-step={i} key={title}>
                    <span className="step-n">Step {i + 1}</span>
                    <h3>{title}</h3>
                    <p className="tagline">{tagline}</p>
                    <p className="body">{body}</p>
                  </li>
                ))}
              </HowLoop>
            </div>
          </section>

          {/* ───────── Guardrails ───────── */}
          <section className="section guard" id="guardrails" aria-labelledby="guard-title">
            <div className="guard-stage">
              <div className="container">
                <header className="head center" data-reveal>
                  <h2 id="guard-title">Fully autonomous. Never unsupervised.</h2>
                  <p>You set the budget caps, bid ceilings and protected keywords with us at onboarding. Agents work within those limits. You can pause any agent at any time.</p>
                </header>
              </div>
            </div>
            <div className="container">
              <div className="features">
                {guardrails.map(([title, body, icon]) => (
                  <div className="feature" key={title} data-reveal>
                    <span className="f-ic"><Ico>{icon}</Ico></span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ───────── Agents ───────── */}
          <section className="section" id="agents" aria-labelledby="agents-title">
            <div className="container">
              <header className="head center" data-reveal>
                <h2 id="agents-title">One specialist <span>per marketplace.</span></h2>
                <p>On Amazon, the agent watches search terms and the Buy Box. On TikTok Shop, it watches which creator videos turn views into orders. Each specialist uses the signals that matter on its marketplace.</p>
              </header>
              <div className="agents">
                {agents.map((a) => (
                  <article className={`agent m-${a.key}`} data-reveal key={a.key}>
                    <div className="a-top">
                      <MarketLogo m={a.key} />
                      <span className="a-status">Live</span>
                    </div>
                    <h3>{a.full}</h3>
                    <p className="a-sub">{a.sub}</p>
                    <dl className="a-dl">
                      <div><dt>Watches</dt><dd>{a.monitors}</dd></div>
                      <div><dt>Decides</dt><dd>{a.decides}</dd></div>
                    </dl>
                    <ul className="a-actions">{a.actions.map((x) => <li key={x}>{x}</li>)}</ul>
                  </article>
                ))}
                <article className="agent agent-soon" data-reveal>
                  <h3>In training</h3>
                  <p className="a-sub">Clients get these first, at no extra fee for marketplaces already included.</p>
                  <ul className="soon">
                    {training.map(([name, body, pct]) => (
                      <li key={name}>
                        <div className="soon-row"><b>{name}</b><span>{pct}%</span></div>
                        <div className="s-bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label={`${name} agent training progress`}>
                          <i style={{ width: pct + '%' }} />
                        </div>
                        <p>{body}</p>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
              <SwipeDots count={agents.length + 1} />
            </div>
          </section>

          {/* ───────── Case study ───────── */}
          <section className="section tint" id="case-study" aria-labelledby="case-title">
            <div className="container">
              <header className="head center" data-reveal>
                <h2 id="case-title">Anatomy of an ACOS spike.</h2>
                <p>Same symptom, two responses. A rule cuts bids. An agent connects five data points, finds the cause and fixes that instead.</p>
              </header>
              <p className="case-meta">Illustrative walkthrough: a health and wellness brand on US Amazon, about $80K a month in ad spend.</p>
              <CaseBoard>
                <div className="b-col">
                  <p className="b-col-label">Symptom</p>
                  <div className="node n-sym" id="n-sym">
                    <span className="k">Top SKU, last 9 days</span>
                    <div className="big">24% <span className="arrow">→</span> <span className="to">38%</span></div>
                    <div className="big-l">ACOS on the best seller</div>
                    <svg className="spark" viewBox="0 0 200 46" preserveAspectRatio="none" aria-hidden="true">
                      <polyline points="0,38 22,37 44,36 66,33 88,30 110,24 132,20 154,14 176,9 200,4" fill="none" stroke="#b63e23" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </div>
                  <p className="b-col-label">What a rule-based tool does</p>
                  <div className="node n-rule" id="n-rule">
                    <span className="stamp" id="stamp">Rejected</span>
                    <span className="k">Rule: ACOS above target</span>
                    <ol>
                      <li>Cuts bids 10–20% across the board</li>
                      <li>Loses top-of-search on hero terms</li>
                      <li>Organic rank slips</li>
                      <li>Sales drop. ACOS still high.</li>
                    </ol>
                  </div>
                </div>
                <div className="b-col">
                  <p className="b-col-label">Evidence the agent connected</p>
                  <div className="node n-ev" id="e1"><span className="k">CPC</span><b>+22%</b> on the top 3 keywords. A new competitor entered with aggressive bids.</div>
                  <div className="node n-ev" id="e2"><span className="k">Competitor price</span>A <b>20% coupon</b> launched. Our CVR on shared terms fell.</div>
                  <div className="node n-ev" id="e3"><span className="k">Buy Box</span><b>Dipped</b> on 2 variations. A reseller undercut the price.</div>
                  <div className="node n-ev" id="e4"><span className="k">Placement</span><b>Top-of-search share fell.</b> Rest-of-search ate the budget.</div>
                  <div className="node n-ev" id="e5"><span className="k">Inventory</span>Best-selling variation under <b>21 days of cover.</b></div>
                </div>
                <div className="b-col">
                  <p className="b-col-label">What the agent did</p>
                  <div className="node n-act" id="a1"><span className="k">Protect</span>Held the hero keyword with a <b>placement adjustment</b>, not a bid cut.</div>
                  <div className="node n-act" id="a2"><span className="k">Reallocate</span><b>Moved budget to long-tail exact</b> terms where CVR held.</div>
                  <div className="node n-act" id="a3"><span className="k">Negate</span><b>140+ bleeding search terms</b> removed from rest-of-search.</div>
                  <div className="node n-act" id="a4"><span className="k">Escalate</span><b>Flagged to the client:</b> coupon response and the reseller issue.</div>
                  <div className="node n-act" id="a5"><span className="k">Throttle</span><b>Slowed spend on the low-stock variation</b> to avoid a stock-out.</div>
                </div>
                <div className={'node n-out' + (outcomeReady ? '' : ' qualitative')} id="n-out">
                  <span className="k">Outcome</span>
                  {outcomeReady ? (
                    <>
                      <div className="o-metric">
                        <span className="o-label">ACOS, top SKU</span>
                        <div className="o-vals"><span className="from">38%</span><span className="to" data-outcome={caseOutcome.acosAfter} data-suffix="%">{caseOutcome.acosAfter}%</span></div>
                        <div className="o-bars" aria-hidden="true"><i className="b1" /><i className="b2" data-bar-from="38" data-bar-to={caseOutcome.acosAfter} /></div>
                      </div>
                      <div className="o-metric">
                        <span className="o-label">TACoS</span>
                        <div className="o-vals"><span className="from">{caseOutcome.tacosBefore}%</span><span className="to" data-outcome={caseOutcome.tacosAfter} data-suffix="%">{caseOutcome.tacosAfter}%</span></div>
                        <div className="o-bars" aria-hidden="true"><i className="b1" /><i className="b2" data-bar-from={caseOutcome.tacosBefore} data-bar-to={caseOutcome.tacosAfter} /></div>
                      </div>
                      <div className="o-metric">
                        <span className="o-label">Ad-attributed sales</span>
                        <div className="o-vals"><span className="to" data-outcome={caseOutcome.salesChange} data-prefix="+" data-suffix="%">+{caseOutcome.salesChange}%</span></div>
                        <div className="o-bars" aria-hidden="true"><i className="b2" style={{ '--w': '100%' }} /></div>
                      </div>
                    </>
                  ) : (
                    <ul className="o-list">
                      <li>Hero keyword kept its top-of-search position</li>
                      <li>Wasted spend cut from rest-of-search</li>
                      <li>Stock-out avoided on the best seller</li>
                    </ul>
                  )}
                </div>
              </CaseBoard>
              <p className="case-foot">Built from patterns the agents handle every week. No brand data shown.</p>
            </div>
          </section>

          {/* ───────── Deliverables ───────── */}
          <section className="section" id="deliverables" aria-labelledby="deliv-title">
            <div className="container">
              <h2 className="conversation-title" id="deliv-title" data-reveal>No new dashboard.<br /><span>Just answers.</span></h2>
              <ol className="conversation" aria-label="Example exchange between the agent and a seller" data-reveal>
                <li aria-label="Agent">
                  <p>I cut overnight bids <strong>by 20%</strong>.</p>
                  <time dateTime="08:14">8:14 AM</time>
                </li>
                <li className="seller" aria-label="Seller">
                  <p>Why did overnight bids change?</p>
                  <time dateTime="08:16">8:16 AM <span aria-hidden="true">✓✓</span></time>
                </li>
                <li aria-label="Agent">
                  <p>Conversion from 1 to 6 AM was <em>41% below average</em>. That bid cut was one of <em>14 changes</em> this week. One thing needs your call: SKU-K22 has <em>18 days</em> of stock left. Reorder?</p>
                  <time dateTime="08:17">8:17 AM</time>
                </li>
              </ol>
              <div className="deliv">
                {[
                  ['Agent updates', 'Weekly by default, plus instant alerts when something needs your call.'],
                  ['Monthly review', "ACOS, TACoS, spend, sales and rank by marketplace, and what's next."],
                  ['Decision log', 'Every action with its timestamp, data and reasoning, on request.'],
                  ['Your own consoles', 'Amazon Ads, Seller Central, Walmart Connect, TikTok Shop, Roundel and Noon.'],
                ].map(([t, b]) => (
                  <div key={t} data-reveal><h3>{t}</h3><p>{b}</p></div>
                ))}
              </div>
            </div>
          </section>

          {/* ───────── Privacy ───────── */}
          <section className="section privacy" id="data-security" aria-labelledby="sec-title">
            <div className="container">
              <div className="privacy-layout" data-reveal>
                <header>
                  <h2 id="sec-title">Your data<br /> stays yours.</h2>
                  <p>Choose where your data lives, on our servers or your own.</p>
                </header>
                <div className="server-plans">
                  {['Our servers', 'Your servers'].map((label, index) => (
                    <figure className="server-plan" key={label}>
                      <figcaption>{label}</figcaption>
                      <svg viewBox="0 0 280 202" aria-hidden="true" fill="none">
                        <defs>
                          <pattern id={`wall-hatch-${index}`} width="4" height="4" patternUnits="userSpaceOnUse">
                            <path d="m-1 1 2-2m-1 5 4-4m-1 5 2-2" stroke="#807667" strokeWidth=".7" />
                          </pattern>
                        </defs>
                        <g stroke="#9a907f" strokeWidth=".7">
                          <path d="M8 12h264M15 5v191M265 5v191M8 190h264M6 21v162M2 21h18M2 183h18M28 3h222M28 0v17M250 0v17" />
                          <path d="m12 15 6-6m244 6 6-6M12 193l6-6m244 6 6-6" />
                        </g>
                        <path d="M119 183H20V18h240v165h-99v-6h93V24H26v153h93z" fill={`url(#wall-hatch-${index})`} stroke="#514b41" strokeWidth="1.4" />
                        <path d="M119 178v-40a40 40 0 0 1 40 40" stroke="#857b6b" />
                        {[51, 117, 183].map(x => (
                          <g key={x} transform={`translate(${x} 94)`}>
                            {[0, 12, 24].map(y => (
                              <g key={y} transform={`translate(0 ${y})`}>
                                <rect width="46" height="9" rx="2" fill="#d95537" />
                                <circle cx="6" cy="4.5" r="1" fill="#fff2dd" />
                                <path d="M34 4.5h6" stroke="#fff2dd" />
                              </g>
                            ))}
                          </g>
                        ))}
                      </svg>
                    </figure>
                  ))}
                </div>
              </div>
              <div className="features four">
                {[
                  ['Stored privately', "Your account data lives only on Adgentic's private servers, or on your own server if you prefer."],
                  ['Never shared', "No third parties, no data brokers, no ad networks. Your numbers don't leave where they're stored."],
                  ['Used only for you', 'Never used to train models for any other brand.'],
                  ['You hold the keys', 'You can revoke marketplace permissions at any time and request deletion of your data. Agents have no payment access.'],
                ].map(([t, b]) => (
                  <div className="feature" key={t} data-reveal><h3>{t}</h3><p>{b}</p></div>
                ))}
              </div>
            </div>
          </section>

          {/* ───────── Pricing ───────── */}
          <section className="section" id="pricing" aria-labelledby="pricing-title">
            <div className="container">
              <header className="head center" data-reveal>
                <h2 id="pricing-title">One number. No surprises.</h2>
              </header>
              <div className="pricing-layout">
                <div>
                  <div className="price" data-reveal>
                    <strong>3%</strong>
                    <span>of monthly ad spend across the marketplaces we manage. Every live agent for those marketplaces is included.</span>
                  </div>
                  <ul className="price-list" data-reveal>
                    <li>Guardrails set up with you</li>
                    <li>Agent updates and alerts</li>
                    <li>Monthly performance review</li>
                    <li>Decision log on request</li>
                    <li>No setup fee</li>
                    <li>Month to month</li>
                  </ul>
                </div>
                <div>
                  <Calculator minFee={minFee} />
                  <p className="min-fee">{minFeeText ? `Minimum monthly fee: ${minFeeText}.` : 'Monthly minimum confirmed at onboarding.'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ───────── FAQ ───────── */}
          <section className="section tint" id="faq" aria-labelledby="faq-title">
            <div className="container narrow faq-layout">
              <header className="head center" data-reveal>
                <h2 id="faq-title">Questions sellers <span>ask first.</span></h2>
                <p>Still unsure? Ask during the <a href={auditHref}>free audit</a>. It costs nothing.</p>
              </header>
              <Faq items={faqs} />
            </div>
          </section>

          {/* ───────── Audit ───────── */}
          <section className="section final" id="audit" aria-labelledby="audit-title">
            <div className={formEnabled ? "container audit-layout" : "container"}>
              <div>
                <div className="final-core" aria-hidden="true">
                  <CoreCanvas id="ctaCanvas" lazy opts={{ interactive: true, center: true, particles: 300 }} />
                </div>
                <header className="head center" data-reveal>
                  <h2 id="audit-title">Find out where your ad spend leaks.</h2>
                  <p>Share read-only access or 60 days of campaign and search term reports. Within 48 hours, get a written breakdown of wasted spend and the changes we’d make first. The audit is free.</p>
                  {!formEnabled && auditUrl && <a className="btn btn-primary" href={auditUrl}>Request your audit</a>}
                  {!auditOpen && (
                    <p className="closed-note">
                      Online audit requests are closed right now.{contactEmail ? <> Email <a href={'mailto:' + contactEmail}>{contactEmail}</a> to get on the list.</> : null}
                    </p>
                  )}
                </header>
              </div>
              {formEnabled && <AuditForm endpoint={auditFormUrl} demo={!auditFormUrl} contactEmail={contactEmail} />}
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="container">
            <div className="foot-top">
              <div>
                <Brand label="Adgentic, back to top" />
                <p>Marketplace ads, managed around the clock.</p>
              </div>
              <nav className="foot-links" aria-label="Footer">
                <a href="#agents">Agents</a><a href="#how">How it works</a><a href="#case-study">Case study</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
                {auditOpen && <a href={auditHref}>Free audit</a>}
              </nav>
            </div>
            <div className="foot-bottom">
              <span>© 2026 Adgentic. All rights reserved.</span>
              {contactEmail && <a href={'mailto:' + contactEmail}>{contactEmail}</a>}
              <span>Amazon, TikTok Shop, Walmart, Target and Noon are trademarks of their owners. Adgentic is independent.</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
