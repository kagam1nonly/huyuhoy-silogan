import { Link, NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../api/client'

function navClass({ isActive }) {
  return isActive
    ? 'rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white'
    : 'rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200'
}

export default function Navbar({ user, onLoggedOut, cartCount = 0 }) {
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      onLoggedOut()
      navigate('/')
    } catch {
      onLoggedOut()
      navigate('/')
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-slate-900">Huyuhoy Silogan</Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={navClass}>Home</NavLink>
          <NavLink to="/meal" className={navClass}>Meals</NavLink>
          <NavLink to="/order" className={navClass}>
            Order {cartCount > 0 ? `(${cartCount})` : ''}
          </NavLink>
          {user && <NavLink to="/my-orders" className={navClass}>My Orders</NavLink>}
          {user?.is_staff && <NavLink to="/admin/orders" className={navClass}>Admin Orders</NavLink>}
          {user?.is_staff && <NavLink to="/admin/payments" className={navClass}>Admin Payments</NavLink>}
          {!user && <NavLink to="/login" className={navClass}>Login</NavLink>}
          {!user && <NavLink to="/signup" className={navClass}>Signup</NavLink>}
          {user && (
            <button onClick={handleLogout} className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
