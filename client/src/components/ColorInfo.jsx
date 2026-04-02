import { useState } from 'react'

export default function ColorInfo({ color, onSave }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  if (!color) {
    return (
      <div className="color-info">
        <h3>Selected Color</h3>
        <div className="color-preview" style={{ background: 'var(--bg-tertiary)' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
          Click on the image to pick a color
        </p>
      </div>
    )
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave({ name: name.trim(), hex: color.hex, rgb: `rgb(${color.r}, ${color.g}, ${color.b})` })
    setName('')
    setSaving(false)
  }

  return (
    <div className="color-info">
      <h3>Selected Color</h3>
      <div className="color-preview" style={{ backgroundColor: color.hex }} />
      <div className="color-hex">{color.hex.toUpperCase()}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        rgb({color.r}, {color.g}, {color.b})
      </div>
      <input
        type="text"
        placeholder="Name this color (e.g. Forest Green)"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
      />
      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={!name.trim() || saving}
      >
        {saving ? 'Saving...' : 'Save Color'}
      </button>
    </div>
  )
}
