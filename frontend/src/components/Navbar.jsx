import { Home, Menu, PackageSearch, ShoppingCart, UserRound, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { logout } from '../api/client'
import { Button } from './ui/button'

function menuLinkClass() {
  return 'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100'
}

function menuActionButtonClass() {
  return 'flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800'
}

export default function Navbar({ user, onLoggedOut, cartCount = 0, cartItems = [], setCartItems }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const menuRef = useRef(null)
  const cartRef = useRef(null)

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [cartItems],
  )

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setCartOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  async function handleLogout() {
    try {
      await logout()
      onLoggedOut()
      setMenuOpen(false)
      navigate('/')
    } catch {
      onLoggedOut()
      setMenuOpen(false)
      navigate('/')
    }
  }

  function clearCart() {
    if (setCartItems) {
      setCartItems([])
    }
  }

  function removeItem(itemId) {
    if (setCartItems) {
      setCartItems((previous) => previous.filter((item) => item.id !== itemId))
    }
  }

  function handleCartToggle() {
    setCartOpen((previous) => {
      const next = !previous
      if (next) {
        toast.dismiss()
      }
      return next
    })
  }

  function proceedToOrder() {
    setCartOpen(false)
    navigate('/order')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-extrabold tracking-tight text-slate-900">
          Huyuhoy Silogan
        </Link>
        <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="Home">
              <Link to="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>

            <div className="relative" ref={cartRef}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Cart"
                onClick={handleCartToggle}
                className="relative cursor-pointer transition-transform duration-200 hover:scale-105"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 ? (
                  <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                ) : null}
              </Button>

              <div
                className={`fixed right-[5px] top-[70px] z-50 w-[min(24rem,95vw)] origin-top-right rounded-xl border border-slate-200 bg-white p-4 shadow-xl transition duration-200 ${
                  cartOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Clear Cart
                  </button>
                  <button type="button" onClick={() => setCartOpen(false)} className="cursor-pointer rounded-sm p-1 text-slate-500 transition-colors hover:text-slate-900">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {!cartItems.length ? (
                  <p className="py-6 text-3xl font-bold tracking-tight text-slate-900">Your cart is empty</p>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {cartItems.map((item, index) => (
                      <div key={item.id || `${item.name}-${index}`} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-600">{item.rice} · ₱{Number(item.price || 0).toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="cursor-pointer text-xs font-medium text-rose-600 transition-colors hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 border-t border-dashed border-slate-300 pt-4">
                  <div className="flex items-center justify-between text-2xl font-bold tracking-tight text-slate-900">
                    <span>Total</span>
                    <span>Php {total.toFixed(2)}</span>
                  </div>

                  <Button
                    type="button"
                    className="mt-4 w-full"
                    onClick={proceedToOrder}
                    disabled={!cartItems.length}
                  >
                    Proceed with Order
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div
                className={`fixed right-[5px] top-[70px] z-50 w-[min(22rem,95vw)] origin-top-right rounded-xl border border-slate-200 bg-white p-3 shadow-xl transition duration-200 ${
                  menuOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="absolute right-3 top-3 cursor-pointer rounded-sm p-1 text-slate-500 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="space-y-1">
                  {!user ? (
                    <>
                      <Link to="/my-orders" onClick={() => setMenuOpen(false)} className={menuActionButtonClass()}>
                        <PackageSearch className="h-4 w-4" />
                        ORDER TRACKER
                      </Link>
                      <Link to="/login" onClick={() => setMenuOpen(false)} className={menuLinkClass()}>
                        <UserRound className="h-4 w-4" />
                        LOG IN/REGISTER
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Account</p>
                        <p className="mt-1 flex items-center gap-2 font-medium text-slate-800">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Signed in as <span className="font-bold text-slate-900">{user.username}</span>
                        </p>
                      </div>
                      <Link to="/my-orders" onClick={() => setMenuOpen(false)} className={menuActionButtonClass()}>
                        <PackageSearch className="h-4 w-4" />
                        ORDER TRACKER
                      </Link>
                      {user?.is_staff && (
                        <Link to="/admin/orders" onClick={() => setMenuOpen(false)} className={menuLinkClass()}>
                          ADMIN PANEL
                        </Link>
                      )}
                      <Button type="button" onClick={handleLogout} className="mt-1 w-full">
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
      </div>
    </header>
  )
}
