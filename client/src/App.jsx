import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Design from './pages/Design'
import Playground from './pages/Playground'
import './App.css'

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('nc-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('nc-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <div className="app">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Design />} />
          <Route path="/playground" element={<Playground />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
