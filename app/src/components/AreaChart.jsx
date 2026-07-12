// Animated area/line chart built from a normalised series (values 0..1).
// Uses a Catmull-Rom -> cubic Bezier smoothing so the line has the same
// flowing quality as the prototype's hand-authored SVG paths.

function buildPath(series, w, h, pad) {
  const n = series.length
  const innerW = w - pad * 2
  const innerH = h - pad * 2
  const pts = series.map((v, i) => [
    pad + (innerW * i) / (n - 1),
    // invert: 1 => top
    pad + innerH * (1 - v),
  ])

  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return { line: d, last: pts[n - 1] }
}

export default function AreaChart({
  series,
  height = 150,
  stroke = '#818cf8',
  fillId = 'ac-grad',
  showDot = true,
  keyId,
}) {
  const w = 300
  const h = height
  const pad = 8
  const { line, last } = buildPath(series, w, h, pad)
  const fill = `${line} L${w - pad},${h - pad} L${pad},${h - pad} Z`

  return (
    <svg
      key={keyId}
      width="100%"
      height={height}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.4" />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="area-fill" fill={`url(#${fillId})`} d={fill} />
      <path
        className="area-line"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={line}
        vectorEffect="non-scaling-stroke"
      />
      {showDot && (
        <circle
          className="area-fill"
          cx={last[0]}
          cy={last[1]}
          r="3.5"
          fill="#fff"
          stroke={stroke}
          strokeWidth="2"
        />
      )}
    </svg>
  )
}
