import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { adminFetchOrders, fetchCsrf, fetchOrders, me } from './api/client'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminPaymentsPage from './pages/AdminPaymentsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminMealsPage from './pages/AdminMealsPage'
import AdminConfigPage from './pages/AdminConfigPage'
import AdminUsersPage from './pages/AdminUsersPage'
import LoadingState from './components/LoadingState'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AccountPage from './pages/AccountPage'
import GcashPaymentPage from './pages/GcashPaymentPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MyOrdersPage from './pages/MyOrdersPage'
import NotFoundPage from './pages/NotFoundPage'
import OrderPage from './pages/OrderPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import SignupPage from './pages/SignupPage'
import { Toaster } from './components/ui/toaster'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname])

  return null
}

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [adminNotifications, setAdminNotifications] = useState(() => {
    try {
      const persisted = localStorage.getItem('huyuhoy-admin-notifications')
      return persisted ? JSON.parse(persisted) : []
    } catch {
      return []
    }
  })
  const [userNotifications, setUserNotifications] = useState(() => {
    try {
      const persisted = localStorage.getItem('huyuhoy-user-notifications')
      return persisted ? JSON.parse(persisted) : []
    } catch {
      return []
    }
  })
  const previousAdminOrderCountRef = useRef(null)
  const previousUserOrderStatusMapRef = useRef({})
  const [cartItems, setCartItems] = useState(() => {
    try {
      const persisted = localStorage.getItem('huyuhoy-cart')
      return persisted ? JSON.parse(persisted) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    async function bootstrapAuth() {
      try {
        await fetchCsrf()
        const currentUser = await me()
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    bootstrapAuth()
  }, [])

  useEffect(() => {
    localStorage.setItem('huyuhoy-cart', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    localStorage.setItem('huyuhoy-admin-notifications', JSON.stringify(adminNotifications))
  }, [adminNotifications])

  useEffect(() => {
    localStorage.setItem('huyuhoy-user-notifications', JSON.stringify(userNotifications))
  }, [userNotifications])

  useEffect(() => {
    if (!user?.is_staff) {
      previousAdminOrderCountRef.current = null
      return undefined
    }

    let canceled = false

    async function pollAdminOrders() {
      try {
        const data = await adminFetchOrders()
        if (canceled) {
          return
        }

        const previousCount = previousAdminOrderCountRef.current
        if (typeof previousCount === 'number' && data.length > previousCount) {
          const newCount = data.length - previousCount
          const latestAmount = Number(data[0]?.bill || 0)
          const plural = newCount > 1 ? 's' : ''

          const incoming = data.slice(0, newCount).map((order) => ({
            id: `order-${order.id}-${order.number}-${order.date}`,
            orderId: order.id,
            orderNumber: order.number,
            amount: Number(order.bill || 0),
            date: order.date,
            customerName: order.customer_name,
            read: false,
          }))

          setAdminNotifications((previous) => {
            const existingIds = new Set(previous.map((item) => item.id))
            const dedupedIncoming = incoming.filter((item) => !existingIds.has(item.id))
            return [...dedupedIncoming, ...previous].slice(0, 80)
          })

          toast.success('New Order Received!', {
            description: `${newCount} new order${plural}. Total amount: ₱${latestAmount.toFixed(2)}`,
          })
        }

        previousAdminOrderCountRef.current = data.length
      } catch {
        // Silent fail on background polling to avoid noisy admin UX.
      }
    }

    pollAdminOrders()
    const intervalId = window.setInterval(pollAdminOrders, 5000)

    return () => {
      canceled = true
      window.clearInterval(intervalId)
    }
  }, [user])

  useEffect(() => {
    if (!user || user.is_staff) {
      previousUserOrderStatusMapRef.current = {}
      return undefined
    }

    let canceled = false

    async function pollUserOrders() {
      try {
        const data = await fetchOrders()
        if (canceled) {
          return
        }

        const previousStatusMap = previousUserOrderStatusMapRef.current
        const nextStatusMap = {}
        const acceptedOrders = []

        data.forEach((order) => {
          const key = order.number
          const currentStatus = order.status
          const previousStatus = previousStatusMap[key]

          nextStatusMap[key] = currentStatus

          if (previousStatus === 'Pending' && currentStatus === 'Processing') {
            acceptedOrders.push(order)
          }
        })

        if (acceptedOrders.length) {
          const incoming = acceptedOrders.map((order) => ({
            id: `accepted-${order.number}-${order.date}`,
            orderNumber: order.number,
            amount: Number(order.bill || 0),
            date: order.date,
            read: false,
          }))

          setUserNotifications((previous) => {
            const existingIds = new Set(previous.map((item) => item.id))
            const dedupedIncoming = incoming.filter((item) => !existingIds.has(item.id))
            return [...dedupedIncoming, ...previous].slice(0, 80)
          })

          acceptedOrders.forEach((order) => {
            toast.success('Order Accepted!', {
              description: `Order #${order.number} is now being processed.`,
            })
          })
        }

        previousUserOrderStatusMapRef.current = nextStatusMap
      } catch {
        // Silent fail on background polling to avoid noisy customer UX.
      }
    }

    pollUserOrders()
    const intervalId = window.setInterval(pollUserOrders, 5000)

    return () => {
      canceled = true
      window.clearInterval(intervalId)
    }
  }, [user])

  function handleMarkAdminNotificationRead(notificationId) {
    setAdminNotifications((previous) =>
      previous.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
    )
  }

  function handleMarkAllAdminNotificationsRead() {
    setAdminNotifications((previous) => previous.map((item) => ({ ...item, read: true })))
  }

  function handleClearAdminNotifications() {
    setAdminNotifications([])
  }

  function handleMarkUserNotificationRead(notificationId) {
    setUserNotifications((previous) =>
      previous.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
    )
  }

  function handleMarkAllUserNotificationsRead() {
    setUserNotifications((previous) => previous.map((item) => ({ ...item, read: true })))
  }

  function handleClearUserNotifications() {
    setUserNotifications([])
  }

  function addToCart(meal, riceLabel) {
    const rawPrice = riceLabel === 'with unli-rice' ? meal.withUnliRice : meal.withoutUnli
    const price = Number(rawPrice)

    if (Number.isNaN(price)) {
      return
    }

    setCartItems((previous) => [
      ...previous,
      {
        id: `${meal.meal_id}-${Date.now()}`,
        name: meal.name,
        rice: riceLabel,
        price,
      },
    ])
  }

  const layoutClass = useMemo(() => 'flex min-h-screen flex-col bg-slate-50 text-slate-900', [])

  if (authLoading) {
    return <LoadingState text="Loading app..." />
  }

  return (
    <div className={layoutClass}>
      <ScrollToTop />
      <Navbar
        user={user}
        onLoggedOut={() => setUser(null)}
        cartCount={cartItems.length}
        cartItems={cartItems}
        setCartItems={setCartItems}
        adminNotifications={adminNotifications}
        onMarkAdminNotificationRead={handleMarkAdminNotificationRead}
        onMarkAllAdminNotificationsRead={handleMarkAllAdminNotificationsRead}
        onClearAdminNotifications={handleClearAdminNotifications}
        userNotifications={userNotifications}
        onMarkUserNotificationRead={handleMarkUserNotificationRead}
        onMarkAllUserNotificationsRead={handleMarkAllUserNotificationsRead}
        onClearUserNotifications={handleClearUserNotifications}
      />
      <Toaster />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onAddToCart={addToCart} />} />
          <Route path="/meal" element={<Navigate to="/" replace />} />
          <Route path="/order" element={<OrderPage cartItems={cartItems} setCartItems={setCartItems} user={user} />} />
          <Route path="/order/gcash" element={user ? <GcashPaymentPage user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/order-success" element={<OrderSuccessPage user={user} />} />
          <Route path="/account" element={user ? <AccountPage user={user} onUserUpdated={setUser} /> : <Navigate to="/login" replace />} />
          <Route path="/my-orders" element={user ? <MyOrdersPage user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={!user ? <LoginPage onLoggedIn={setUser} /> : <Navigate to="/" replace />} />
          <Route path="/signup" element={!user ? <SignupPage onSignedUp={setUser} /> : <Navigate to="/" replace />} />
          <Route path="/admin" element={user?.is_staff ? <AdminDashboardPage user={user} /> : <Navigate to="/" replace />} />
          <Route path="/admin/orders" element={user?.is_staff ? <AdminOrdersPage user={user} /> : <Navigate to="/" replace />} />
          <Route path="/admin/payments" element={user?.is_staff ? <AdminPaymentsPage user={user} /> : <Navigate to="/" replace />} />
          <Route path="/admin/meals" element={user?.is_staff ? <AdminMealsPage user={user} /> : <Navigate to="/" replace />} />
          <Route path="/admin/users" element={user?.is_staff ? <AdminUsersPage user={user} onUserUpdated={setUser} /> : <Navigate to="/" replace />} />
          <Route path="/admin/settings" element={user?.is_staff ? <AdminConfigPage user={user} onUserUpdated={setUser} /> : <Navigate to="/" replace />} />
          <Route path="/admin/config" element={<Navigate to="/admin/settings" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
