// Darken a hex color (used for icon gradient end-stops across the app).
export function shade(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * 0.55)
  const g = Math.round(((n >> 8) & 255) * 0.55)
  const b = Math.round((n & 255) * 0.55)
  return `rgb(${r},${g},${b})`
}
