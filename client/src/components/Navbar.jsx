import { NavLink } from 'react-router-dom'

export default function Navbar({ theme, toggleTheme }) {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">NatureColor</NavLink>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>
          Design
        </NavLink>
        <NavLink to="/playground" className={({ isActive }) => isActive ? 'active' : ''}>
          Playground
        </NavLink>
        <NavLink to="/artifacts" className={({ isActive }) => isActive ? 'active' : ''}>
          Artifacts
        </NavLink>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? '\u263E' : '\u2600'}
        </button>
      </div>
    </nav>
  )
}
