import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createOrder } from '../api/client'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'

const FINALIZING_DELAY_MS = 4000
const PROGRESS_TICK_MS = 100

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

export default function OrderPage({ cartItems, setCartItems, user }) {
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [transaction, setTransaction] = useState('Pickup')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [submitting, setSubmitting] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [cartItems],
  )

  useEffect(() => {
    if (!finalizing) {
      setProgress(0)
      return
    }

    const progressStep = 100 / (FINALIZING_DELAY_MS / PROGRESS_TICK_MS)

    const interval = window.setInterval(() => {
      setProgress((previous) => {
        return Math.min(previous + progressStep, 100)
      })
    }, PROGRESS_TICK_MS)

    return () => window.clearInterval(interval)
  }, [finalizing])

  function removeItem(itemId) {
    setCartItems(cartItems.filter((item) => item.id !== itemId))
  }

  function clearCart() {
    setCartItems([])
    setConfirmClearOpen(false)
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
      const summary = {
        orderNumber: order.number,
        total: total.toFixed(2),
        itemCount: cartItems.length,
      }

      setCartItems([])
      setNote('')
      setAddress('')

      setFinalizing(true)

      if (paymentMethod === 'GCASH') {
        window.setTimeout(() => {
          navigate(`/order/gcash?order=${order.number}&amount=${summary.total}&items=${summary.itemCount}`)
        }, FINALIZING_DELAY_MS)
        return
      }

      window.setTimeout(() => {
        navigate('/order-success', { state: summary })
      }, FINALIZING_DELAY_MS)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (finalizing) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10">
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Order Processing</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Finalizing your order</h1>
          <p className="mt-2 text-sm text-slate-600">Preparing your order confirmation.</p>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#f4c23d] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Order</h1>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Cart Items</h2>
          <Button type="button" onClick={() => setConfirmClearOpen(true)} variant="outline" size="sm">
            Clear Cart
          </Button>
        </div>

        {!cartItems.length && <p className="mt-2 text-sm text-slate-600">Your cart is empty.</p>}

        <ul className="mt-2 space-y-2">
          {cartItems.map((item, index) => (
            <li key={item.id || `${item.name}-${index}`} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-600">{formatRiceOptionLabel(item.rice)} · ₱{item.price}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-sm font-semibold text-slate-900">Total: ₱{total.toFixed(2)}</p>

        <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Clear all cart items?</DialogTitle>
              <DialogDescription>This removes all items in your cart and cannot be undone.</DialogDescription>
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
      </section>

      {!user ? (
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Checkout</h2>
          <p className="mt-2 text-sm text-slate-600">Login to place your order and track it in your account.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild type="button" size="sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild type="button" variant="outline" size="sm">
              <Link to="/signup">Register</Link>
            </Button>
          </div>
        </section>
      ) : (
        <form onSubmit={submitOrder} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Checkout</h2>

          <label className="mt-4 block text-sm font-medium text-slate-700">Transaction</label>
          <select
            value={transaction}
            onChange={(event) => setTransaction(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm"
            style={{ backgroundPosition: 'right 0.9rem center' }}
          >
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
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm"
            style={{ backgroundPosition: 'right 0.9rem center' }}
          >
            <option value="CASH">CASH</option>
            <option value="COD">COD</option>
            <option value="GCASH">GCASH</option>
          </select>

          <label className="mt-4 block text-sm font-medium text-slate-700">Note</label>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" rows={3} />

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-4">
            {submitting ? 'Placing Order...' : 'Place Order'}
          </Button>
        </form>
      )}
    </main>
  )
}
