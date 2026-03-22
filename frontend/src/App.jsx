import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { fetchCsrf, me } from './api/client'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminPaymentsPage from './pages/AdminPaymentsPage'
import LoadingState from './components/LoadingState'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MealPage from './pages/MealPage'
import MyOrdersPage from './pages/MyOrdersPage'
import NotFoundPage from './pages/NotFoundPage'
import OrderPage from './pages/OrderPage'
import SignupPage from './pages/SignupPage'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
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

  function addToCart(meal, riceLabel) {
    const rawPrice = riceLabel === 'with rice' ? meal.withRice : meal.withOutRice
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

  const layoutClass = useMemo(() => 'min-h-screen bg-slate-50 text-slate-900', [])

  if (authLoading) {
    return <LoadingState text="Loading app..." />
  }

  return (
    <div className={layoutClass}>
      <Navbar user={user} onLoggedOut={() => setUser(null)} cartCount={cartItems.length} />
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/meal" element={<MealPage onAddToCart={addToCart} />} />
        <Route path="/order" element={user ? <OrderPage cartItems={cartItems} setCartItems={setCartItems} user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/my-orders" element={user ? <MyOrdersPage user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={!user ? <LoginPage onLoggedIn={setUser} /> : <Navigate to="/meal" replace />} />
        <Route path="/signup" element={!user ? <SignupPage onSignedUp={setUser} /> : <Navigate to="/meal" replace />} />
        <Route path="/admin/orders" element={user?.is_staff ? <AdminOrdersPage user={user} /> : <Navigate to="/" replace />} />
        <Route path="/admin/payments" element={user?.is_staff ? <AdminPaymentsPage user={user} /> : <Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
