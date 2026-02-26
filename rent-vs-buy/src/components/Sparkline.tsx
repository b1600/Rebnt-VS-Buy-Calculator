type Props = {
  values: number[]
  height?: number
}

export function Sparkline({ values, height = 56 }: Props) {
  const w = 320
  const h = height

  const finite = values.filter((v) => Number.isFinite(v))
  const min = finite.length ? Math.min(...finite) : 0
  const max = finite.length ? Math.max(...finite) : 1
  const span = max - min || 1

  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * w
      const y = h - ((v - min) / span) * h
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img">
      <polyline className="sparklineLine" fill="none" strokeWidth="2" points={points} />
    </svg>
  )
}

