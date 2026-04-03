export default function ColorSwatch({ color, onDelete, highlighted, onHoverColor }) {
  return (
    <div
      className={`color-swatch${highlighted ? ' color-swatch--highlighted' : ''}`}
      onMouseEnter={() => onHoverColor?.(color.id)}
      onMouseLeave={() => onHoverColor?.(null)}
    >
      <div
        className="color-swatch-circle"
        style={{ backgroundColor: color.hex }}
        title={`${color.name}: ${color.hex}`}
      />
      <span className="color-swatch-name">{color.name}</span>
      {onDelete && (
        <button
          className="color-swatch-delete"
          onClick={() => onDelete(color.id)}
          title="Remove color"
        >
          ×
        </button>
      )}
    </div>
  )
}
