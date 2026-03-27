import { useEffect, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import { cancelOrder, fetchOrders, processGcashPayment } from '../api/client'
import ImageWithFallback from '../components/ImageWithFallback'
import LoadingState from '../components/LoadingState'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'

function formatCurrency(value) {
  return `₱${Number(value || 0).toFixed(2)}`
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusClass(status) {
  const map = {
    Pending: 'bg-[#f4c23d]/20 text-[#926500] border-[#f4c23d]/45',
    Processing: 'bg-slate-200 text-slate-700 border-slate-300',
    Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Canceled: 'bg-red-100 text-red-700 border-red-200',
  }
  return map[status] || 'bg-slate-100 text-slate-700 border-slate-200'
}

function paymentClass(status) {
  const map = {
    Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Pending: 'bg-[#f4c23d]/20 text-[#926500] border-[#f4c23d]/45',
    Unpaid: 'bg-red-100 text-red-700 border-red-200',
  }
  return map[status] || 'bg-slate-100 text-slate-700 border-slate-200'
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

const GROUPS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'awaiting-payment', label: 'Awaiting Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
]

function getOrderStatusHelp(status) {
  if (status === 'Pending') {
    return 'Pending: your order was received and is waiting for staff confirmation.'
  }
  if (status === 'Processing') {
    return 'Processing: your order is being prepared or handled by the store.'
  }
  return ''
}

function getPaymentStatusHelp(status) {
  if (status === 'Pending') {
    return 'Payment Pending: we received your payment details and we are waiting for confirmation.'
  }
  if (status === 'Unpaid') {
    return 'Unpaid: payment has not been submitted yet.'
  }
  return ''
}

export default function MyOrdersPage({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [gcashOrder, setGcashOrder] = useState(null)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [submittingReference, setSubmittingReference] = useState(false)
  const [groupFilter, setGroupFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const totalToPay = useMemo(
    () => orders
      .filter((order) => order.payment?.payment_status !== 'Paid')
      .reduce((sum, order) => sum + Number(order.bill || 0), 0),
    [orders],
  )

  const groupCounts = useMemo(() => {
    const counts = Object.fromEntries(GROUPS.map((group) => [group.value, 0]))

    orders.forEach((order) => {
      const paymentStatus = order.payment?.payment_status || 'N/A'

      counts.all += 1
      if (['Pending', 'Processing'].includes(order.status)) counts.active += 1
      if (paymentStatus !== 'Paid' && order.status !== 'Canceled') counts['awaiting-payment'] += 1
      if (paymentStatus === 'Paid') counts.paid += 1
      if (order.status === 'Completed') counts.completed += 1
      if (order.status === 'Canceled') counts.canceled += 1
    })

    return counts
  }, [orders])

  const visibleOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    const filtered = orders.filter((order) => {
      const paymentStatus = order.payment?.payment_status || 'N/A'
      const method = (order.payment?.method || '').toUpperCase()

      const matchesGroup =
        groupFilter === 'all'
          ? true
          : groupFilter === 'active'
            ? ['Pending', 'Processing'].includes(order.status)
            : groupFilter === 'awaiting-payment'
              ? paymentStatus !== 'Paid' && order.status !== 'Canceled'
              : groupFilter === 'paid'
                ? paymentStatus === 'Paid'
                : groupFilter === 'completed'
                  ? order.status === 'Completed'
                  : groupFilter === 'canceled'
                    ? order.status === 'Canceled'
                    : true

      if (!matchesGroup) return false

      if (!keyword) return true

      const itemNames = order.cart_items.map((item) => item.name.toLowerCase()).join(' ')
      const haystack = [
        String(order.number).toLowerCase(),
        String(order.status).toLowerCase(),
        String(paymentStatus).toLowerCase(),
        String(order.transaction).toLowerCase(),
        String(method).toLowerCase(),
        itemNames,
      ].join(' ')

      return haystack.includes(keyword)
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      if (sortBy === 'highest-bill') {
        return Number(b.bill || 0) - Number(a.bill || 0)
      }
      if (sortBy === 'lowest-bill') {
        return Number(a.bill || 0) - Number(b.bill || 0)
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [orders, groupFilter, searchTerm, sortBy])

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

  async function refreshOrders() {
    const refreshedOrders = await fetchOrders()
    setOrders(refreshedOrders)
  }

  async function handleGcashPaymentSubmit(event) {
    event.preventDefault()
    if (!gcashOrder) return

    setError('')
    setMessage('')

    const refNum = referenceNumber.trim()
    if (!/^\d{12,13}$/.test(refNum)) {
      setError('GCash reference number must be 13 digits.')
      return
    }

    try {
      setSubmittingReference(true)
      await processGcashPayment(gcashOrder.number, {
        amount: gcashOrder.bill,
        ref_num: refNum,
      })
      setMessage(`GCash payment submitted for order #${gcashOrder.number}.`)
      toast.success('GCash payment submitted.')
      setGcashOrder(null)
      setReferenceNumber('')
      await refreshOrders()
    } catch (submitError) {
      setError(submitError.message)
      toast.error(submitError.message)
    } finally {
      setSubmittingReference(false)
    }
  }

  async function handleCancel(orderNumber) {
    setError('')
    setMessage('')

    try {
      await cancelOrder(orderNumber)
      setMessage(`Order #${orderNumber} removed.`)
      toast.success(`Order #${orderNumber} removed.`)
      await refreshOrders()
    } catch (cancelError) {
      setError(cancelError.message)
      toast.error(cancelError.message)
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
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Order Dashboard</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">My Orders</h1>
        <p className="mt-2 text-sm text-slate-600">Outstanding total: <span className="font-bold text-slate-900">{formatCurrency(totalToPay)}</span></p>

        <div className="mt-4 flex flex-wrap gap-2">
          {GROUPS.map((group) => (
            <Button
              key={group.value}
              type="button"
              size="sm"
              variant={groupFilter === group.value ? 'default' : 'outline'}
              onClick={() => setGroupFilter(group.value)}
            >
              {group.label} ({groupCounts[group.value] ?? 0})
            </Button>
          ))}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search order #, item name, status, or payment method"
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
          />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-10 rounded-lg border border-slate-300 px-3 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
            style={{ backgroundPosition: 'right 0.9rem center' }}
          >
            <option value="newest">Sort: Newest first</option>
            <option value="oldest">Sort: Oldest first</option>
            <option value="highest-bill">Sort: Highest bill</option>
            <option value="lowest-bill">Sort: Lowest bill</option>
          </select>
        </div>
      </header>

      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

      {!orders.length && <p className="mt-6 text-sm text-slate-700">No orders found.</p>}
      {orders.length > 0 && !visibleOrders.length && <p className="mt-6 text-sm text-slate-700">No orders match your current filters.</p>}

      <div className="mt-6 space-y-4">
        {visibleOrders.map((order) => {
          const paymentMethod = (order.payment?.method || 'N/A').toUpperCase()
          const paymentStatus = order.payment?.payment_status || 'N/A'
          const canPayGcash = paymentMethod === 'GCASH' && paymentStatus !== 'Paid' && order.status !== 'Canceled'
          const orderStatusHelp = getOrderStatusHelp(order.status)
          const paymentStatusHelp = getPaymentStatusHelp(paymentStatus)

          return (
            <article key={order.number} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Order #{order.number}</h2>
                  <p className="mt-1 text-sm text-slate-500">Placed on {formatDate(order.date)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${statusClass(order.status)}`}>
                    Order: {order.status}
                    {orderStatusHelp ? (
                      <TooltipProvider delayDuration={120}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="rounded-full p-0.5 text-current/80 hover:text-current" aria-label="Order status info">
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-56 text-left leading-snug">{orderStatusHelp}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${paymentClass(paymentStatus)}`}>
                    Payment: {paymentStatus}
                    {paymentStatusHelp ? (
                      <TooltipProvider delayDuration={120}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="rounded-full p-0.5 text-current/80 hover:text-current" aria-label="Payment status info">
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-56 text-left leading-snug">{paymentStatusHelp}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total Bill</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{formatCurrency(order.bill)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Transaction Type</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{order.transaction}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Payment Method</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Address</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{order.address || 'Not provided'}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Items</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {order.cart_items.map((item) => (
                    <li key={item.cartitem_id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span>{item.name} · {formatRiceOptionLabel(item.rice)}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(item.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {canPayGcash ? (
                  <Button type="button" onClick={() => setGcashOrder(order)}>
                    Pay with GCash
                  </Button>
                ) : null}

                {order.status === 'Canceled' ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => handleCancel(order.number)}
                  >
                    Remove Canceled Order
                  </Button>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>

      <Dialog open={Boolean(gcashOrder)} onOpenChange={(open) => !open && setGcashOrder(null)}>
        <DialogContent className="max-w-lg">
          {gcashOrder ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-[0.05em]">GCash Payment</DialogTitle>
                <DialogDescription>
                  Order #{gcashOrder.number} · Total {formatCurrency(gcashOrder.bill)}
                </DialogDescription>
              </DialogHeader>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <ImageWithFallback
                  src="/gcash.jpg"
                  alt="GCash QR or payment instructions"
                  wrapperClassName="max-h-[64vh] w-full"
                  className="max-h-[64vh] w-full object-contain"
                />
              </div>

              <form onSubmit={handleGcashPaymentSubmit} className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Reference Number
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(event) => setReferenceNumber(event.target.value.replace(/\D/g, '').slice(0, 13))}
                    placeholder="9805468937481"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
                  />
                </label>

                <p className="text-xs text-slate-500">Reference number must be 13 digits.</p>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={submittingReference}>
                    {submittingReference ? 'Submitting...' : 'Submit Reference'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setGcashOrder(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  )
}
