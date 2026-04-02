import { useState, useEffect, useRef } from 'react'
import ImageCanvas from '../components/ImageCanvas'
import ColorInfo from '../components/ColorInfo'
import ColorSwatch from '../components/ColorSwatch'

export default function Design() {
  const [imageSrc, setImageSrc] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [savedColors, setSavedColors] = useState([])
  const [toast, setToast] = useState(null)
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
        showToast(`Saved "${colorData.name}"`)
        setSelectedColor(null)
        fetchColors()
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
          <div className="saved-colors-list">
            {savedColors.map(c => (
              <ColorSwatch key={c.id} color={c} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
