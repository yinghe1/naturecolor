const CATEGORIES = [
  { name: 'Red', startHue: 346, endHue: 375, color: '#FF0000' },
  { name: 'Orange', startHue: 16, endHue: 45, color: '#FF8000' },
  { name: 'Yellow', startHue: 46, endHue: 70, color: '#FFD700' },
  { name: 'Yellow-Green', startHue: 71, endHue: 79, color: '#ADFF2F' },
  { name: 'Green', startHue: 80, endHue: 169, color: '#00CC00' },
  { name: 'Cyan', startHue: 170, endHue: 200, color: '#00CCCC' },
  { name: 'Blue', startHue: 201, endHue: 260, color: '#0066FF' },
  { name: 'Purple', startHue: 261, endHue: 290, color: '#8000FF' },
  { name: 'Pink', startHue: 291, endHue: 345, color: '#FF00FF' },
]

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function polarToCart(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  let sweep = endAngle - startAngle
  if (sweep < 0) sweep += 360
  const largeArc = sweep > 180 ? 1 : 0
  const s = polarToCart(cx, cy, r, startAngle)
  const e = polarToCart(cx, cy, r, endAngle)
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} Z`
}

export default function ColorWheel({ colors = [], highlightedColorId, onHoverColor }) {
  const size = 220
  const cx = size / 2
  const cy = size / 2
  const outerR = 95
  const innerR = 55
  const dotR = 70

  const activeCategories = new Set(colors.map(c => c.category).filter(Boolean))

  const highlightedColor = highlightedColorId
    ? colors.find(c => c.id === highlightedColorId)
    : null
  const highlightedCategory = highlightedColor?.category

  return (
    <div className="color-wheel">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategories.has(cat.name)
          const isHighlighted = highlightedCategory === cat.name
          return (
            <path
              key={cat.name}
              d={arcPath(cx, cy, outerR, cat.startHue > 345 ? cat.startHue - 360 : cat.startHue, cat.endHue > 360 ? cat.endHue - 360 : cat.endHue)}
              fill={cat.color}
              opacity={isHighlighted ? 1 : isActive ? 0.85 : 0.2}
              stroke={isHighlighted ? cat.color : 'var(--bg-secondary)'}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              style={{ transition: 'opacity 0.15s, stroke-width 0.15s' }}
            />
          )
        })}
        <circle cx={cx} cy={cy} r={innerR} fill="var(--bg-secondary)" />
        {highlightedColor ? (
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="var(--text-primary)" fontSize="10" fontWeight="600">
            {highlightedColor.name}
          </text>
        ) : (
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="var(--text-tertiary)" fontSize="11" fontWeight="500">
            {colors.length} color{colors.length !== 1 ? 's' : ''}
          </text>
        )}
        {colors.map((c, i) => {
          const { h, s } = hexToHsl(c.hex)
          if (s < 10) return null
          const isHovered = highlightedColorId === c.id
          const pos = polarToCart(cx, cy, dotR, h)
          return (
            <circle
              key={c.id || i}
              cx={pos.x}
              cy={pos.y}
              r={isHovered ? 8 : 5}
              fill={c.hex}
              stroke={isHovered ? 'var(--text-primary)' : 'var(--bg-secondary)'}
              strokeWidth={isHovered ? 2.5 : 2}
              style={{ transition: 'r 0.15s, stroke-width 0.15s', cursor: 'pointer' }}
              onMouseEnter={() => onHoverColor?.(c.id)}
              onMouseLeave={() => onHoverColor?.(null)}
            >
              <title>{c.name}: {c.hex}</title>
            </circle>
          )
        })}
      </svg>
    </div>
  )
}
