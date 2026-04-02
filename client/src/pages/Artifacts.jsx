import { useState, useEffect } from 'react'

export default function Artifacts() {
  const [artifacts, setArtifacts] = useState([])
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  const fetchArtifacts = () => {
    fetch('/api/artifacts')
      .then(r => r.json())
      .then(setArtifacts)
      .catch(console.error)
  }

  useEffect(() => { fetchArtifacts() }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    try {
      await fetch(`/api/artifacts/${id}`, { method: 'DELETE' })
      if (selected?.id === id) setSelected(null)
      fetchArtifacts()
    } catch (err) {
      console.error('Failed to delete artifact:', err)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setToast('Copied to clipboard!')
    setTimeout(() => setToast(null), 2000)
  }

  const embedUrl = (id) => `${window.location.origin}/api/artifacts/${id}/embed`
  const embedSnippet = (id) => `<iframe src="${embedUrl(id)}" width="600" height="400" frameborder="0"></iframe>`

  return (
    <div className="artifacts-page">
      <div className="artifacts-header">
        <h2>Saved Artifacts</h2>
        <span className="artifacts-count">{artifacts.length} artifact{artifacts.length !== 1 ? 's' : ''}</span>
      </div>

      {artifacts.length === 0 ? (
        <div className="artifacts-empty">
          No artifacts saved yet. Generate something in Playground and save it.
        </div>
      ) : (
        <>
          <div className="artifacts-grid">
            {artifacts.map(a => (
              <div
                key={a.id}
                className={`artifact-tile ${selected?.id === a.id ? 'active' : ''}`}
                onClick={() => setSelected(selected?.id === a.id ? null : a)}
              >
                <div className="artifact-tile-preview">
                  <iframe
                    srcDoc={a.html}
                    title={a.name}
                    sandbox="allow-scripts"
                    tabIndex={-1}
                  />
                </div>
                <div className="artifact-tile-footer">
                  <span className="artifact-tile-name">{a.name}</span>
                  <button
                    className="btn btn-danger"
                    onClick={(e) => handleDelete(a.id, e)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="artifact-detail">
              <div className="artifact-detail-preview">
                <iframe
                  srcDoc={selected.html}
                  title={selected.name}
                  sandbox="allow-scripts"
                />
              </div>
              <div className="artifact-detail-meta">
                <h3>{selected.name}</h3>
                {selected.instruction && (
                  <p className="artifact-detail-instruction">{selected.instruction}</p>
                )}
              </div>
              <div className="artifact-embed-row">
                <label>Embed URL</label>
                <div className="artifact-embed-code">
                  <code>{embedUrl(selected.id)}</code>
                  <button className="btn-copy" onClick={() => copyToClipboard(embedUrl(selected.id))}>Copy</button>
                </div>
              </div>
              <div className="artifact-embed-row">
                <label>Embed Code</label>
                <div className="artifact-embed-code">
                  <code>{embedSnippet(selected.id)}</code>
                  <button className="btn-copy" onClick={() => copyToClipboard(embedSnippet(selected.id))}>Copy</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
