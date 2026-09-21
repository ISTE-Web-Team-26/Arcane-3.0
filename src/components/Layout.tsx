import { NavLink, Outlet } from 'react-router'
import './Layout.css'

export default function Layout() {
  return (
    <>
      <header className="site-nav">
        <NavLink to="/" className="brand">
          Arcane 3.0
        </NavLink>
        <nav>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Home
          </NavLink>
          <NavLink
            to="/event1"
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Event 1
          </NavLink>
          <NavLink
            to="/event2"
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Event 2
          </NavLink>
          <NavLink
            to="/event3"
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Event 3
          </NavLink>
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </>
  )
}
