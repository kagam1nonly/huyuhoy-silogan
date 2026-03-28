import { ArrowRight, Bell, Home, Menu, PackageSearch, ShoppingCart, UserRound, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { logout } from '../api/client'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'

function menuLinkClass() {
  return 'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[13px] font-semibold tracking-[0.06em] text-white transition-colors hover:bg-white/10'
}

function menuActionButtonClass() {
  return 'flex w-full items-center justify-between rounded-md border border-[#f4c23d]/30 bg-[#f4c23d]/10 px-2.5 py-2 text-[13px] font-semibold tracking-[0.06em] text-[#f4c23d] transition-colors hover:bg-[#f4c23d]/20'
}

function formatRiceOptionLabel(value) {
  const normalized = String(value || '').trim().toLowerCase()

  if (['withunli-rice', 'withunlirice', 'withrice', 'with unli-rice', 'with rice'].includes(normalized)) {
    return 'With unli-rice'
  }

  if (['withoutunli', 'without unli', 'withoutrice', 'without rice'].includes(normalized)) {
    return 'Without unli'
  }

  return value || 'Without unli'
}

export default function Navbar({
  user,
  onLoggedOut,
  cartCount = 0,
  cartItems = [],
  setCartItems,
  adminNotifications = [],
  onMarkAdminNotificationRead,
  onMarkAllAdminNotificationsRead,
  onClearAdminNotifications,
  userNotifications = [],
  onMarkUserNotificationRead,
  onMarkAllUserNotificationsRead,
  onClearUserNotifications,
}) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [showOrderHint, setShowOrderHint] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationFilter, setNotificationFilter] = useState('unread')
  const [orderHintMessage, setOrderHintMessage] = useState('Need help checking out? Tap Proceed to Order.')
  const [now, setNow] = useState(() => new Date())
  const menuRef = useRef(null)
  const cartRef = useRef(null)
  const notificationRef = useRef(null)
  const previousCartCountRef = useRef(cartCount)
  const hintShowTimeoutRef = useRef(null)
  const hintTimeoutRef = useRef(null)

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [cartItems],
  )

  const isAdmin = Boolean(user?.is_staff)
  const activeNotifications = isAdmin ? adminNotifications : userNotifications

  const unreadNotificationCount = useMemo(
    () => activeNotifications.filter((item) => !item.read).length,
    [activeNotifications],
  )

  const visibleNotifications = useMemo(() => {
    if (notificationFilter === 'all') {
      return activeNotifications
    }
    if (notificationFilter === 'read') {
      return activeNotifications.filter((item) => item.read)
    }
    return activeNotifications.filter((item) => !item.read)
  }, [activeNotifications, notificationFilter])

  const philippinesDate = useMemo(
    () => new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(now),
    [now],
  )

  const philippinesTime = useMemo(
    () => new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(now),
    [now],
  )

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setCartOpen(false)
        setNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (cartCount <= 0) {
      return
    }

    if (hintShowTimeoutRef.current) {
      window.clearTimeout(hintShowTimeoutRef.current)
      hintShowTimeoutRef.current = null
    }

    if (hintTimeoutRef.current) {
      window.clearTimeout(hintTimeoutRef.current)
      hintTimeoutRef.current = null
    }

    setOrderHintMessage('You have items in your cart. Want to proceed with your order?')

    hintShowTimeoutRef.current = window.setTimeout(() => {
      setShowOrderHint(true)
      hintShowTimeoutRef.current = null

      hintTimeoutRef.current = window.setTimeout(() => {
        setShowOrderHint(false)
        hintTimeoutRef.current = null
      }, 7000)
    }, 5000)
  }, [])

  useEffect(() => {
    function clearHintTimers() {
      if (hintShowTimeoutRef.current) {
        window.clearTimeout(hintShowTimeoutRef.current)
        hintShowTimeoutRef.current = null
      }
      if (hintTimeoutRef.current) {
        window.clearTimeout(hintTimeoutRef.current)
        hintTimeoutRef.current = null
      }
    }

    function scheduleHintHide(delayMs) {
      if (hintTimeoutRef.current) {
        window.clearTimeout(hintTimeoutRef.current)
      }

      hintTimeoutRef.current = window.setTimeout(() => {
        setShowOrderHint(false)
        hintTimeoutRef.current = null
      }, delayMs)
    }

    function scheduleHintShow(delayMs, message) {
      clearHintTimers()
      setOrderHintMessage(message)

      hintShowTimeoutRef.current = window.setTimeout(() => {
        setShowOrderHint(true)
        hintShowTimeoutRef.current = null
        scheduleHintHide(7000)
      }, delayMs)
    }

    const previousCount = previousCartCountRef.current
    const addedFirstItem = previousCount === 0 && cartCount > 0

    if (addedFirstItem) {
      const showDelay = Math.floor(Math.random() * 5001) + 5000
      scheduleHintShow(showDelay, 'Need help checking out? Tap Proceed to Order.')
    }

    if (cartCount === 0) {
      setShowOrderHint(false)
      clearHintTimers()
    }

    previousCartCountRef.current = cartCount
  }, [cartCount])

  useEffect(() => {
    return () => {
      if (hintShowTimeoutRef.current) {
        window.clearTimeout(hintShowTimeoutRef.current)
      }
      if (hintTimeoutRef.current) {
        window.clearTimeout(hintTimeoutRef.current)
      }
    }
  }, [])

  async function handleLogout() {
    try {
      await logout()
      onLoggedOut()
      setMenuOpen(false)
      window.location.assign('/')
    } catch {
      onLoggedOut()
      setMenuOpen(false)
      window.location.assign('/')
    }
  }

  function clearCart() {
    if (setCartItems) {
      setCartItems([])
    }
    setConfirmClearOpen(false)
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
        setShowOrderHint(false)
        if (hintShowTimeoutRef.current) {
          window.clearTimeout(hintShowTimeoutRef.current)
          hintShowTimeoutRef.current = null
        }
        if (hintTimeoutRef.current) {
          window.clearTimeout(hintTimeoutRef.current)
          hintTimeoutRef.current = null
        }
      }
      return next
    })
  }

  function handleOrderHintHover() {
    if (hintTimeoutRef.current) {
      window.clearTimeout(hintTimeoutRef.current)
    }

    hintTimeoutRef.current = window.setTimeout(() => {
      setShowOrderHint(false)
      hintTimeoutRef.current = null
    }, 10000)
  }

  function proceedToOrder() {
    setShowOrderHint(false)
    if (hintShowTimeoutRef.current) {
      window.clearTimeout(hintShowTimeoutRef.current)
      hintShowTimeoutRef.current = null
    }
    if (hintTimeoutRef.current) {
      window.clearTimeout(hintTimeoutRef.current)
      hintTimeoutRef.current = null
    }
    setCartOpen(false)
    navigate('/order')
  }

  function formatAdminNotificationDate(value) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return 'Just now'
    }

    return date.toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function goToNotificationTarget() {
    setNotificationOpen(false)
    navigate(isAdmin ? '/admin/orders' : '/my-orders')
  }

  function handleMarkNotificationRead(notificationId) {
    if (isAdmin) {
      onMarkAdminNotificationRead?.(notificationId)
      return
    }
    onMarkUserNotificationRead?.(notificationId)
  }

  function handleMarkAllNotificationsRead() {
    if (isAdmin) {
      onMarkAllAdminNotificationsRead?.()
      return
    }
    onMarkAllUserNotificationsRead?.()
  }

  function handleClearNotifications() {
    if (isAdmin) {
      onClearAdminNotifications?.()
      return
    }
    onClearUserNotifications?.()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#f4c23d]/20 bg-[#1b2132]/95 backdrop-blur supports-backdrop-filter:bg-[#1b2132]/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="group relative inline-flex items-center">
          <span data-text="Huyuhoy Silogan" className="brand-wordmark text-lg font-extrabold tracking-tight md:text-[1.35rem]">
            Huyuhoy Silogan
          </span>
        </Link>
        <div>
          <p className="text-xs font-semibold text-white">Philippines: {philippinesDate}</p>
          <p className="text-3xl font-black leading-none text-[#f4c23d]">{philippinesTime}</p>
        </div>
        <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="Home" className="text-[#f4c23d] hover:bg-white/10 hover:text-[#ffd560]">
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
                className="relative cursor-pointer text-[#f4c23d] transition-transform duration-200 hover:scale-105 hover:bg-white/10 hover:text-[#ffd560]"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 ? (
                  <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                ) : null}
              </Button>

              <div
                className={`fixed right-2 top-18.5 z-50 w-64 max-w-[90vw] rounded-lg border border-[#f4c23d]/30 bg-[#1b2132]/95 px-3 pb-3 pt-2 text-white shadow-xl transition-all duration-200 ${
                  showOrderHint ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
                }`}
                onMouseEnter={handleOrderHintHover}
              >
                <button
                  type="button"
                  onClick={() => setShowOrderHint(false)}
                  className="absolute right-2 top-1.5 rounded-sm p-0.5 text-slate-300 transition-colors hover:text-white"
                  aria-label="Close proceed hint"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <p className="pr-6 text-[13px] leading-snug text-slate-200">{orderHintMessage}</p>
                <Button type="button" size="sm" className="mt-2.5 h-8 w-full bg-[#f4c23d] text-slate-900 text-[11px] uppercase tracking-[0.08em] hover:bg-[#ffd560]" onClick={proceedToOrder}>
                  Proceed to Order
                </Button>
              </div>

              <div
                className={`fixed right-1.25 top-18.5 z-50 w-[min(24rem,95vw)] origin-top-right rounded-xl border border-slate-200 bg-white p-4 shadow-xl transition duration-200 ${
                  cartOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setConfirmClearOpen(true)}
                    className="cursor-pointer rounded-md border border-slate-300 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Clear Cart
                  </button>
                  <button type="button" onClick={() => setCartOpen(false)} className="cursor-pointer rounded-sm p-1 text-slate-500 transition-colors hover:text-slate-900">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {!cartItems.length ? (
                  <p className="py-6 text-base font-semibold tracking-tight text-slate-900">Your cart is empty</p>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {cartItems.map((item, index) => (
                      <div key={item.id || `${item.name}-${index}`} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                        <div>
                          <p className="text-[13px] font-semibold text-slate-900">{item.name}</p>
                          <p className="text-[12px] text-slate-600">{formatRiceOptionLabel(item.rice)} · ₱{Number(item.price || 0).toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="cursor-pointer text-[12px] font-medium text-rose-600 transition-colors hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 border-t border-dashed border-slate-300 pt-4">
                  <div className="flex items-center justify-between text-lg font-bold tracking-tight text-slate-900">
                    <span>Total</span>
                    <span>Php {total.toFixed(2)}</span>
                  </div>

                  <Button
                    type="button"
                    className="mt-4 w-full bg-[#f4c23d] text-slate-900 hover:bg-[#ffd560]"
                    onClick={proceedToOrder}
                    disabled={!cartItems.length}
                  >
                    Proceed with Order
                  </Button>
                </div>
              </div>

              <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Clear all cart items?</DialogTitle>
                    <DialogDescription>This will remove all meals currently in your cart.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setConfirmClearOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={clearCart}>
                      Yes, clear cart
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {user ? (
              <div className="relative" ref={notificationRef}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={isAdmin ? 'Admin notifications' : 'Order notifications'}
                  onClick={() => setNotificationOpen((previous) => !previous)}
                  className="relative cursor-pointer text-[#f4c23d] transition-transform duration-200 hover:scale-105 hover:bg-white/10 hover:text-[#ffd560]"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationCount > 0 ? (
                    <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  ) : null}
                </Button>

                <div
                  className={`fixed right-2 top-18.5 z-50 w-[min(26rem,95vw)] origin-top-right rounded-2xl  bg-[#1b2132]/95 p-4 text-white shadow-xl backdrop-blur transition duration-200 ${
                    notificationOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-black uppercase tracking-[0.08em] text-white">{isAdmin ? 'Admin Notifications' : 'Order Notifications'}</p>
                    <button
                      type="button"
                      onClick={() => setNotificationOpen(false)}
                      className="cursor-pointer rounded-sm p-1 text-slate-300 transition-colors hover:text-white"
                      aria-label="Close notifications"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={goToNotificationTarget}
                    className="mb-3 h-9 w-full justify-between border border-[#f4c23d]/40 bg-[#f4c23d]/12 text-xs font-bold uppercase tracking-[0.08em] text-[#f4c23d] hover:bg-[#f4c23d]/20"
                  >
                    {isAdmin ? 'Open Orders Admin' : 'Open My Orders'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <div className="mb-3 flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`h-8 border-[#f4c23d]/35 text-xs font-semibold uppercase tracking-[0.06em] ${
                        notificationFilter === 'unread'
                          ? 'bg-[#f4c23d]/20 text-[#f4c23d]'
                          : 'bg-transparent text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => setNotificationFilter('unread')}
                    >
                      Unread
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`h-8 border-[#f4c23d]/35 text-xs font-semibold uppercase tracking-[0.06em] ${
                        notificationFilter === 'read'
                          ? 'bg-[#f4c23d]/20 text-[#f4c23d]'
                          : 'bg-transparent text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => setNotificationFilter('read')}
                    >
                      Read
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`h-8 border-[#f4c23d]/35 text-xs font-semibold uppercase tracking-[0.06em] ${
                        notificationFilter === 'all'
                          ? 'bg-[#f4c23d]/20 text-[#f4c23d]'
                          : 'bg-transparent text-slate-200 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => setNotificationFilter('all')}
                    >
                      All
                    </Button>
                  </div>

                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                      onClick={handleMarkAllNotificationsRead}
                      disabled={!activeNotifications.length}
                    >
                      Mark all read
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 border-rose-300/35 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:text-rose-100"
                      onClick={handleClearNotifications}
                      disabled={!activeNotifications.length}
                    >
                      Clear all
                    </Button>
                  </div>

                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {visibleNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          handleMarkNotificationRead(notification.id)
                          goToNotificationTarget()
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                          notification.read
                            ? 'border-white/15 bg-white/5 hover:bg-white/10'
                            : 'border-[#f4c23d]/45 bg-[#f4c23d]/12 hover:bg-[#f4c23d]/18'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-white">
                            {isAdmin ? `New Order Received! #${notification.orderNumber}` : `Order Accepted! #${notification.orderNumber}`}
                          </p>
                          <ArrowRight className="h-3.5 w-3.5 text-[#f4c23d]" />
                        </div>
                        <p className="text-xs text-slate-200">
                          {isAdmin
                            ? `Total amount: ₱${Number(notification.amount || 0).toFixed(2)}`
                            : 'Your order is now being processed.'}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-slate-300">{formatAdminNotificationDate(notification.date)}</p>
                      </button>
                    ))}

                    {!visibleNotifications.length ? (
                      <p className="py-6 text-center text-sm text-slate-300">No notifications in this view.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="cursor-pointer text-[#f4c23d] hover:bg-white/10 hover:text-[#ffd560]"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div
                className={`fixed right-1 top-18.5 z-50 w-[min(20rem,95vw)] origin-top-right rounded-2xl bg-[#1b2132]/95 backdrop-blur p-2.5 shadow-xl transition duration-200 ${
                  menuOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="absolute right-3 top-3 cursor-pointer rounded-sm p-1 text-slate-300 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="space-y-2 pt-6">
                  {!user ? (
                    <>
                      <Link to="/my-orders" onClick={() => setMenuOpen(false)} className={menuActionButtonClass()}>
                        <span>ORDER TRACKER</span>
                        <PackageSearch className="h-4 w-4" />
                      </Link>
                      <Link to="/login" onClick={() => setMenuOpen(false)} className={menuLinkClass()}>
                        <span>LOG IN/REGISTER</span>
                        <UserRound className="h-4 w-4 text-[#f4c23d]" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="rounded-xl border border-white/20 bg-white/5 px-2.5 py-2.5 text-[13px] text-white">
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">Welcome,</p>
                        <p className="mt-1 text-2xl font-black uppercase tracking-tight text-white">{user.username}</p>
                      </div>
                      <div className="my-2 border-t border-white/20" />
                      <Link to="/my-orders" onClick={() => setMenuOpen(false)} className={menuActionButtonClass()}>
                        <span>ORDER TRACKER</span>
                        <PackageSearch className="h-4 w-4" />
                      </Link>
                      <Link to="/account" onClick={() => setMenuOpen(false)} className={menuLinkClass()}>
                        <span>MY ACCOUNT</span>
                        <UserRound className="h-4 w-4 text-[#f4c23d]" />
                      </Link>
                      {user?.is_staff && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)} className={menuLinkClass()}>
                          <span>ADMIN PANEL</span>
                          <span className="text-[#f4c23d]">→</span>
                        </Link>
                      )}
                      <button type="button" onClick={handleLogout} className={`${menuLinkClass()} border border-white/15 bg-white/10`}>
                        <span>LOG OUT</span>
                      </button>
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
