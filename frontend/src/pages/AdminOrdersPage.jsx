import { useEffect, useState } from 'react'
import { adminFetchOrders, adminOrderAction } from '../api/client'

export default function AdminOrdersPage({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadOrders() {
    try {
      setLoading(true)
      const data = await adminFetchOrders()
      setOrders(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.is_staff) {
      loadOrders()
    } else {
      setLoading(false)
    }
  }, [user])

  async function handleAction(orderId, action) {
    setError('')
    setMessage('')
    try {
      const response = await adminOrderAction(orderId, action)
      setMessage(response.detail || 'Action completed.')
      await loadOrders()
    } catch (actionError) {
      setError(actionError.message)
    }
  }

  if (!user?.is_staff) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Admin access only.</main>
  }

  if (loading) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Loading admin orders...</main>
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Admin · Orders</h1>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">#{order.number} · {order.customer_name}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{order.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-700">Bill: ₱{order.bill} · Payment: {order.payment_status || 'N/A'} ({order.payment_method || 'N/A'})</p>
            <p className="text-sm text-slate-700">Transaction: {order.transaction} · Address: {order.address || 'N/A'}</p>
            <p className="text-sm text-slate-700">Note: {order.note || 'N/A'}</p>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {order.cart_items.map((item) => (
                <li key={item.cartitem_id}>{item.name} · {item.rice} · ₱{item.price}</li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => handleAction(order.id, 'Accept')} className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">Accept</button>
              <button onClick={() => handleAction(order.id, 'Refuse')} className="rounded-md bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700">Refuse</button>
              <button onClick={() => handleAction(order.id, 'Complete')} className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">Complete</button>
              <button onClick={() => handleAction(order.id, 'Delete')} className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
