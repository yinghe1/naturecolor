import { useState, useEffect, useMemo } from 'react'
import ColorSwatch from '../components/ColorSwatch'
import ColorWheel from '../components/ColorWheel'

export default function Playground() {
  const [colors, setColors] = useState([])
  const [instruction, setInstruction] = useState('')
  const [generatedHtml, setGeneratedHtml] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedArtifact, setSavedArtifact] = useState(null)
  const [artifactName, setArtifactName] = useState('')
  const [toast, setToast] = useState(null)
  const [highlightedColorId, setHighlightedColorId] = useState(null)

  useEffect(() => {
    fetch('/api/colors')
      .then(r => r.json())
      .then(setColors)
      .catch(console.error)
  }, [])

  const colorsByCategory = useMemo(() => {
    const groups = {}
    for (const c of colors) {
      const cat = c.category || 'Uncategorized'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(c)
    }
    return groups
  }, [colors])

  const handleGenerate = async () => {
    if (!instruction.trim()) return
    setLoading(true)
    setError(null)
    setGeneratedHtml(null)
    setSavedArtifact(null)

    try {
      const res = await fetch('/api/playground/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: instruction.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Generation failed')
      } else {
        setGeneratedHtml(data.html)
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveArtifact = async () => {
    if (!artifactName.trim() || !generatedHtml) return
    setSaving(true)
    try {
      const res = await fetch('/api/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: artifactName.trim(),
          html: generatedHtml,
          instruction: instruction.trim(),
        }),
      })
      if (res.ok) {
        const artifact = await res.json()
        setSavedArtifact(artifact)
        setToast('Artifact saved!')
        setTimeout(() => setToast(null), 2500)
      }
    } catch (err) {
      console.error('Failed to save artifact:', err)
    } finally {
      setSaving(false)
    }
  }

  const embedUrl = savedArtifact
    ? `${window.location.origin}/api/artifacts/${savedArtifact.id}/embed`
    : null

  const embedSnippet = embedUrl
    ? `<iframe src="${embedUrl}" width="600" height="400" frameborder="0"></iframe>`
    : null

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setToast('Copied to clipboard!')
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <div className="playground-page">
      <div className="palette-bar">
        {colors.length === 0 ? (
          <span className="palette-empty">No colors saved yet. Go to Design to pick some colors.</span>
        ) : (
          <div className="color-palette-layout">
            <ColorWheel colors={colors} highlightedColorId={highlightedColorId} onHoverColor={setHighlightedColorId} />
            <div className="color-categories-grid">
              {Object.entries(colorsByCategory).map(([category, catColors]) => (
                <div key={category} className="color-category-chip">
                  <span className="color-category-label">{category}</span>
                  <div className="color-category-swatches">
                    {catColors.map(c => <ColorSwatch key={c.id} color={c} highlighted={highlightedColorId === c.id} onHoverColor={setHighlightedColorId} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder='e.g. "Create an SVG logo using Forest Green and Sky Blue"'
          value={instruction}
          onChange={e => setInstruction(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
        />
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !instruction.trim()}>
          {loading ? 'Generating...' : 'Play'}
        </button>
      </div>

      <div className="display-area">
        {loading && (
          <div className="loading-spinner">Generating your design...</div>
        )}
        {error && (
          <div className="display-area-placeholder" style={{ color: 'var(--danger)' }}>{error}</div>
        )}
        {!loading && !error && !generatedHtml && (
          <div className="display-area-placeholder">
            Describe what you'd like to create and click Play
          </div>
        )}
        {generatedHtml && !loading && (
          <iframe
            title="Generated content"
            sandbox="allow-scripts"
            srcDoc={generatedHtml}
          />
        )}
      </div>

      {generatedHtml && !loading && (
        <div className="artifact-save-panel">
          {!savedArtifact ? (
            <div className="artifact-save-form">
              <input
                type="text"
                placeholder="Name this artifact (e.g. Forest Logo)"
                value={artifactName}
                onChange={e => setArtifactName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveArtifact()}
              />
              <button
                className="btn btn-primary"
                onClick={handleSaveArtifact}
                disabled={!artifactName.trim() || saving}
              >
                {saving ? 'Saving...' : 'Save Artifact'}
              </button>
            </div>
          ) : (
            <div className="artifact-embed-info">
              <div className="artifact-embed-header">
                Saved as "{savedArtifact.name}"
              </div>
              <div className="artifact-embed-row">
                <label>Embed URL</label>
                <div className="artifact-embed-code">
                  <code>{embedUrl}</code>
                  <button className="btn-copy" onClick={() => copyToClipboard(embedUrl)}>Copy</button>
                </div>
              </div>
              <div className="artifact-embed-row">
                <label>Embed Code</label>
                <div className="artifact-embed-code">
                  <code>{embedSnippet}</code>
                  <button className="btn-copy" onClick={() => copyToClipboard(embedSnippet)}>Copy</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
