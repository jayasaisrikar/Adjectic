// Site configuration, read at build time from environment variables.
// Anything left unset is hidden or degrades gracefully. No placeholders reach the page.
const env = (k) => {
  const v = process.env[k]
  return typeof v === 'string' && v.trim() && !v.includes('{{') ? v.trim() : null
}
const num = (k) => {
  const v = env(k)
  if (v == null) return null
  const n = parseFloat(v.replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : null
}

export const site = {
  // Google Apps Script web-app URL (…/exec) that stores audit requests in a Sheet.
  auditFormUrl: env('AUDIT_FORM_URL'),
  // Optional external audit page. Used only when AUDIT_FORM_URL is not set.
  auditUrl: env('AUDIT_URL'),
  calendarUrl: env('CALENDAR_URL'),
  contactEmail: env('CONTACT_EMAIL'),
  minFee: num('MIN_FEE'),
  // Case-study outcome figures. Shown only once all of them are set.
  caseOutcome: {
    acosAfter: num('CASE_ACOS_AFTER'),
    tacosBefore: num('CASE_TACOS_BEFORE'),
    tacosAfter: num('CASE_TACOS_AFTER'),
    salesChange: num('CASE_SALES_CHANGE'),
  },
  isDev: process.env.NODE_ENV !== 'production',
}

export const markets = [
  { key: 'amz', name: 'Amazon', color: '#e47911', night: '#ffb547' },
  { key: 'tts', name: 'TikTok Shop', color: '#e5426f', night: '#ff7aa2' },
  { key: 'wmt', name: 'Walmart', color: '#2a6fdb', night: '#7fb2ff' },
  { key: 'tgt', name: 'Target', color: '#cc1f2d', night: '#ff7b7b' },
  { key: 'noon', name: 'Noon', color: '#c9a400', night: '#ffe14d' },
]
