import { useEffect, useMemo, useState } from 'react'
import { cancelOrder, fetchOrders, processGcashPayment } from '../api/client'
import LoadingState from '../components/LoadingState'

export default function MyOrdersPage({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [refInputs, setRefInputs] = useState({})

  const totalToPay = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.bill || 0), 0),
    [orders],
  )

  useEffect(() => {
    let mounted = true

    async function loadOrders() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await fetchOrders()
        if (mounted) setOrders(data)
      } catch (loadError) {
        if (mounted) setError(loadError.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadOrders()

    return () => {
      mounted = false
    }
  }, [user])

  async function handleGcashPayment(order) {
    setError('')
    setMessage('')

    const refNum = (refInputs[order.number] || '').trim()
    if (!refNum) {
      setError('Please provide GCash reference number.')
      return
    }

    try {
      await processGcashPayment(order.number, {
        amount: order.bill,
        ref_num: refNum,
      })
      setMessage(`GCash payment submitted for order #${order.number}.`)
      const refreshedOrders = await fetchOrders()
      setOrders(refreshedOrders)
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  async function handleCancel(orderNumber) {
    setError('')
    setMessage('')

    try {
      await cancelOrder(orderNumber)
      setMessage(`Order #${orderNumber} removed.`)
      const refreshedOrders = await fetchOrders()
      setOrders(refreshedOrders)
    } catch (cancelError) {
      setError(cancelError.message)
    }
  }

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <p className="text-sm text-slate-700">Please login to view your orders.</p>
      </main>
    )
  }

  if (loading) {
    return <LoadingState text="Loading your orders..." />
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
      <p className="mt-2 text-sm text-slate-600">Amount to pay: ₱{totalToPay.toFixed(2)}</p>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}

      {!orders.length && <p className="mt-6 text-sm text-slate-700">No orders found.</p>}

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article key={order.number} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Order #{order.number}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{order.status}</span>
            </div>
            <div className="mt-2 text-sm text-slate-700">
              <p>Bill: ₱{order.bill}</p>
              <p>Date: {new Date(order.date).toLocaleString()}</p>
              <p>Transaction: {order.transaction}</p>
              <p>Address: {order.address || 'N/A'}</p>
              <p>Note: {order.note || 'N/A'}</p>
            </div>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {order.cart_items.map((item) => (
                <li key={item.cartitem_id}>{item.name} · {item.rice} · ₱{item.price}</li>
              ))}
            </ul>

            {order.status !== 'Processing' && order.status !== 'Completed' && order.status !== 'Refused' && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-medium text-slate-600">GCash Payment</p>
                <div className="flex flex-wrap gap-2">
                  <input
                    placeholder="Reference Number"
                    className="min-w-56 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={refInputs[order.number] || ''}
                    onChange={(event) => setRefInputs((previous) => ({ ...previous, [order.number]: event.target.value }))}
                  />
                  <button
                    onClick={() => handleGcashPayment(order)}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Submit GCash
                  </button>
                </div>
              </div>
            )}

            {order.status === 'Canceled' && (
              <button
                onClick={() => handleCancel(order.number)}
                className="mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
              >
                Remove Canceled Order
              </button>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}
