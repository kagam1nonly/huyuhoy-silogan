import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { createOrder } from '../api/client'
import LoadingState from '../components/LoadingState'

export default function OrderPage({ cartItems, setCartItems, user }) {
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [transaction, setTransaction] = useState('Pickup')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [submitting, setSubmitting] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState('')

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [cartItems],
  )

  function removeItem(itemId) {
    setCartItems(cartItems.filter((item) => item.id !== itemId))
  }

  function clearCart() {
    setCartItems([])
  }

  async function submitOrder(event) {
    event.preventDefault()
    setError('')

    if (!user) {
      setError('Please login first to place an order.')
      return
    }

    if (!cartItems.length) {
      setError('Your cart is empty.')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        items: cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          rice: item.rice,
        })),
        note,
        bill: total.toFixed(2),
        transaction,
        address: transaction === 'Delivery' ? address : '',
        payment_method: paymentMethod,
      }

      const order = await createOrder(payload)
      toast.success(`Order placed successfully`, {
        description: `Order #${order.number} is now being prepared.`,
      })
      const summary = {
        orderNumber: order.number,
        total: total.toFixed(2),
        itemCount: cartItems.length,
      }
      setCartItems([])
      setNote('')
      setAddress('')
      setFinalizing(true)
      window.setTimeout(() => {
        navigate('/order-success', { state: summary })
      }, 700)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (finalizing) {
    return <LoadingState text="Finalizing your order..." />
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Order</h1>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Cart Items</h2>
          <button
            type="button"
            onClick={clearCart}
            className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Clear Cart
          </button>
        </div>
        {!cartItems.length && <p className="mt-2 text-sm text-slate-600">Your cart is empty.</p>}
        <ul className="mt-2 space-y-2">
          {cartItems.map((item, index) => (
            <li key={item.id || `${item.name}-${index}`} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-600">{item.rice} · ₱{item.price}</p>
              </div>
              <button onClick={() => removeItem(item.id)} className="cursor-pointer text-sm text-rose-600 hover:text-rose-700">Remove</button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm font-semibold text-slate-900">Total: ₱{total.toFixed(2)}</p>
      </section>

      {!user ? (
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Checkout</h2>
          <p className="mt-2 text-sm text-slate-600">Login to place your order and track it in your account.</p>
        </section>
      ) : (
      <form onSubmit={submitOrder} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Checkout</h2>

        <label className="mt-4 block text-sm font-medium text-slate-700">Transaction</label>
        <select value={transaction} onChange={(event) => setTransaction(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="Pickup">Pickup</option>
          <option value="Delivery">Delivery</option>
        </select>

        {transaction === 'Delivery' && (
          <>
            <label className="mt-4 block text-sm font-medium text-slate-700">Delivery Address</label>
            <input value={address} onChange={(event) => setAddress(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
          </>
        )}

        <label className="mt-4 block text-sm font-medium text-slate-700">Payment Method</label>
        <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="CASH">CASH</option>
          <option value="COD">COD</option>
          <option value="GCASH">GCASH</option>
        </select>

        <label className="mt-4 block text-sm font-medium text-slate-700">Note</label>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" rows={3} />

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <button disabled={submitting} className="mt-4 cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
          {submitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
      )}
    </main>
  )
}
