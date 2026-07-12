import { useEffect, useState } from 'react'

// Animated donut allocation chart. Segments grow in on mount by animating
// stroke-dashoffset from full circumference to their target arc length.
export default function DonutChart({
  data,
  size = 132,
  thickness = 20,
  label = 'HOLDINGS',
  centerValue,
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const total = data.reduce((s, d) => s + d.value, 0)
  const cx = size / 2
  const cy = size / 2

  let acc = 0
  const segs = data.map((d) => {
    const frac = d.value / total
    const seg = { ...d, frac, offset: acc, len: c * frac }
    acc += frac
    return seg
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none' }}>
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1c1c28" strokeWidth={thickness} />
        {segs.map((s) => (
          <circle
            key={s.id}
            className="donut-seg"
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${s.len} ${c - s.len}`}
            strokeDashoffset={mounted ? -s.offset * c : -c}
            style={{ transitionDelay: '0.15s' }}
          />
        ))}
      </g>
      <text
        x={cx}
        y={cy - 5}
        textAnchor="middle"
        fill="#8b8ba3"
        style={{ font: "600 8.5px 'IBM Plex Sans'", letterSpacing: '0.12em' }}
      >
        {label}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="#fff"
        style={{ font: "700 22px 'Space Grotesk'" }}
      >
        {centerValue ?? data.length}
      </text>
    </svg>
  )
}
