# Adgentic

Marketing site for Adgentic, AI agents that manage marketplace advertising on Amazon, TikTok Shop, Walmart, Target and Noon.

Built with Next.js (App Router), GSAP + Lenis for motion, and three.js for the agent orbit.

## Run it

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## Configuration

All settings are optional environment variables, read at build time in `app/site.js`. See `.env.example` for the full list. The important one is `AUDIT_FORM_URL`. Without it, the audit form is hidden in production builds.

## Where things live

| Path | What it is |
| --- | --- |
| `app/page.jsx` | Page content and section markup |
| `app/interactive.jsx` | Client components: header, decision feed, how-it-works loop, case-study board, calculator, FAQ, audit form |
| `app/core.js` | The 3D marketplace orbit (three.js) and its 2D fallback for phones |
| `app/style.css` | All styles |
| `app/site.js` | Environment-driven settings |
| `public/images/` | Logo and imagery |
# Adjectic
