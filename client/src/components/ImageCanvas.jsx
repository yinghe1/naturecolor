import { useRef, useEffect, useState, useCallback } from 'react'

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

export default function ImageCanvas({ imageSrc, onColorPick }) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const [hoveredColor, setHoveredColor] = useState(null)
  const [mousePos, setMousePos] = useState(null)

  useEffect(() => {
    if (!imageSrc) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      const maxWidth = canvas.parentElement.clientWidth
      const scale = Math.min(maxWidth / img.width, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      imgRef.current = img
    }
    img.src = imageSrc
  }, [imageSrc])

  const getColor = useCallback((e) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)
    const pixel = ctx.getImageData(x, y, 1, 1).data
    return { r: pixel[0], g: pixel[1], b: pixel[2], hex: rgbToHex(pixel[0], pixel[1], pixel[2]) }
  }, [])

  const handleMouseMove = useCallback((e) => {
    const color = getColor(e)
    setHoveredColor(color.hex)
    const rect = canvasRef.current.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [getColor])

  const handleClick = useCallback((e) => {
    const color = getColor(e)
    onColorPick(color)
  }, [getColor, onColorPick])

  const handleMouseLeave = useCallback(() => {
    setHoveredColor(null)
    setMousePos(null)
  }, [])

  if (!imageSrc) return null

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
      />
      {hoveredColor && mousePos && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {/* Crosshair */}
          <line x1={mousePos.x} y1={0} x2={mousePos.x} y2="100%" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          <line x1={0} y1={mousePos.y} x2="100%" y2={mousePos.y} stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          {/* Color preview circle */}
          <circle cx={mousePos.x} cy={mousePos.y} r="20" fill={hoveredColor} stroke="#fff" strokeWidth="2" />
          <circle cx={mousePos.x} cy={mousePos.y} r="20" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        </svg>
      )}
    </div>
  )
}
