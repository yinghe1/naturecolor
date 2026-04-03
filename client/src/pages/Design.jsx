import { useState, useEffect, useRef, useMemo } from 'react'
import ImageCanvas from '../components/ImageCanvas'
import ColorInfo from '../components/ColorInfo'
import ColorSwatch from '../components/ColorSwatch'
import ColorWheel from '../components/ColorWheel'

export default function Design() {
  const [imageSrc, setImageSrc] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [savedColors, setSavedColors] = useState([])
  const [toast, setToast] = useState(null)
  const [highlightedColorId, setHighlightedColorId] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchColors()
  }, [])

  const fetchColors = async () => {
    try {
      const res = await fetch('/api/colors')
      const data = await res.json()
      setSavedColors(data)
    } catch (err) {
      console.error('Failed to fetch colors:', err)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImageSrc(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleColorPick = (color) => {
    setSelectedColor(color)
  }

  const handleSave = async (colorData) => {
    try {
      const res = await fetch('/api/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colorData),
      })
      if (res.ok) {
        const saved = await res.json()
        showToast(`Saved "${saved.name}"`)
        setSelectedColor(null)
        setSavedColors(prev => [...prev, saved])
      }
    } catch (err) {
      console.error('Failed to save color:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/colors/${id}`, { method: 'DELETE' })
      fetchColors()
    } catch (err) {
      console.error('Failed to delete color:', err)
    }
  }

  const colorsByCategory = useMemo(() => {
    const groups = {}
    for (const c of savedColors) {
      const cat = c.category || 'Uncategorized'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(c)
    }
    return groups
  }, [savedColors])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="design-page">
      {!imageSrc && (
        <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
          <div className="upload-zone-icon">+</div>
          <div className="upload-zone-text">Upload an image of nature</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {imageSrc && (
        <div className="design-workspace">
          <ImageCanvas imageSrc={imageSrc} onColorPick={handleColorPick} />
          <ColorInfo color={selectedColor} onSave={handleSave} />
        </div>
      )}

      {savedColors.length > 0 && (
        <div className="saved-colors">
          <h3>Saved Colors ({savedColors.length})</h3>
          <div className="color-palette-layout">
            <ColorWheel colors={savedColors} highlightedColorId={highlightedColorId} onHoverColor={setHighlightedColorId} />
            <div className="color-categories-grid">
              {Object.entries(colorsByCategory).map(([category, catColors]) => (
                <div key={category} className="color-category-chip">
                  <span className="color-category-label">{category}</span>
                  <div className="color-category-swatches">
                    {catColors.map(c => (
                      <ColorSwatch key={c.id} color={c} onDelete={handleDelete} highlighted={highlightedColorId === c.id} onHoverColor={setHighlightedColorId} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
