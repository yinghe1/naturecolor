export default function ColorSwatch({ color, onDelete }) {
  return (
    <div className="color-swatch">
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
