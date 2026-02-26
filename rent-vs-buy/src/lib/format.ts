export function formatMoney(n: number, currency = 'USD') {
  const v = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(v)
}

export function formatMoney2(n: number, currency = 'USD') {
  const v = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(v)
}

export function formatPct(n: number, digits = 2) {
  const v = Number.isFinite(n) ? n : 0
  return `${v.toFixed(digits)}%`
}

export function monthToYearsLabel(month: number) {
  const y = month / 12
  if (y < 1) return `${month} mo`
  const whole = Math.floor(y)
  const rem = month - whole * 12
  if (rem === 0) return `${whole} yr`
  return `${whole} yr ${rem} mo`
}

