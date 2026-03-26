import { useEffect, useMemo, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { adminFetchOrders, adminOrderAction } from '../api/client'
import AdminShell from '../components/admin/AdminShell'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

const STATUS_OPTIONS = ['All', 'Pending', 'Processing', 'Completed', 'Canceled']
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'bill-high', label: 'Highest Bill' },
  { value: 'bill-low', label: 'Lowest Bill' },
]

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

function paymentStatusClass(status) {
  const map = {
    Unpaid: 'bg-red-100 text-red-700 border-red-200',
    Pending: 'bg-[#f4c23d]/20 text-[#926500] border-[#f4c23d]/45',
    Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }
  return map[status] || 'bg-slate-100 text-slate-700 border-slate-200'
}

function actionDisabledReason(order, action) {
  if (action === 'Accept' && order.status !== 'Pending') {
    return 'Only pending orders can be accepted.'
  }
  if (action === 'Refuse' && !['Pending', 'Processing'].includes(order.status)) {
    return 'Only pending or processing orders can be refused.'
  }
  if (action === 'Complete' && order.status !== 'Processing') {
    return 'Only processing orders can be completed.'
  }
  if (action === 'Delete' && order.status !== 'Canceled') {
    return 'Only canceled orders can be deleted.'
  }
  return ''
}

function ActionButton({ label, onClick, className, disabledReason }) {
  const disabled = Boolean(disabledReason)

  if (!disabled) {
    return (
      <Button size="sm" className={className} onClick={onClick}>
        {label}
      </Button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex w-full">
          <Button size="sm" className={className} disabled>
            {label}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  )
}

export default function AdminOrdersPage({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('latest')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [actionOrder, setActionOrder] = useState(null)

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
      toast.success(response.detail || 'Action completed.')
      await loadOrders()
      setSelectedOrder(null)
      setActionOrder(null)
    } catch (actionError) {
      setError(actionError.message)
      toast.error(actionError.message || 'Unable to process order action.')
    }
  }

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    let next = orders.filter((order) => {
      if (statusFilter !== 'All' && order.status !== statusFilter) {
        return false
      }

      if (!query) {
        return true
      }

      const itemNames = (order.cart_items || []).map((item) => item.name).join(' ')
      const haystack = [
        order.number,
        order.customer_name,
        order.transaction,
        order.status,
        order.payment_status,
        order.payment_method,
        itemNames,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })

    next = next.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.date) - new Date(b.date)
      }
      if (sortBy === 'bill-high') {
        return Number(b.bill || 0) - Number(a.bill || 0)
      }
      if (sortBy === 'bill-low') {
        return Number(a.bill || 0) - Number(b.bill || 0)
      }
      return new Date(b.date) - new Date(a.date)
    })

    return next
  }, [orders, searchTerm, statusFilter, sortBy])

  if (!user?.is_staff) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Admin access only.</main>
  }

  if (loading) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Loading admin orders...</main>
  }

  return (
    <AdminShell user={user} title="Orders" subtitle="Search, sort, and process orders from one clean control table.">
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

      <TooltipProvider delayDuration={150}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Search
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Order #, customer, meal"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
            />
          </label>

          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Sort By
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Bill</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="w-44">Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-semibold text-slate-900">#{order.number}</TableCell>
                <TableCell className="font-semibold text-slate-800">{order.customer_name}</TableCell>
                <TableCell>{order.transaction}</TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${paymentStatusClass(order.payment_status)}`}>
                    {order.payment_status || 'N/A'}
                  </span>
                  <p className="mt-1 text-xs text-slate-500">{order.payment_method || 'N/A'}</p>
                </TableCell>
                <TableCell className="font-semibold text-slate-800">{formatCurrency(order.bill)}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="h-8 border-slate-300" onClick={() => setSelectedOrder(order)}>
                    View ({(order.cart_items || []).length})
                  </Button>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">{formatDate(order.date)}</TableCell>
                <TableCell className="align-top">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 w-12 border-slate-300 px-0"
                    onClick={() => setActionOrder(order)}
                    aria-label={`Open actions for order ${order.number}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!filteredOrders.length ? (
          <p className="py-6 text-center text-sm text-slate-500">No orders matched your current filters.</p>
        ) : null}
      </div>

      <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          {selectedOrder ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-[0.05em]">Order #{selectedOrder.number}</DialogTitle>
                <DialogDescription>
                  {selectedOrder.customer_name} · {selectedOrder.transaction} · {formatDate(selectedOrder.date)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Payment</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{selectedOrder.payment_status || 'N/A'}</p>
                  <p className="text-xs text-slate-500">{selectedOrder.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total Bill</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{formatCurrency(selectedOrder.bill)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Meals Ordered</p>
                <div className="mt-2 space-y-2">
                  {(selectedOrder.cart_items || []).map((item, index) => (
                    <div key={`${item.cartitem_id || item.name}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.rice}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(item.price)}</p>
                    </div>
                  ))}
                  {!selectedOrder.cart_items?.length ? <p className="text-sm text-slate-500">No line items available.</p> : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Delivery Address</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{selectedOrder.address || 'Not provided'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Order Note</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{selectedOrder.note || 'No note from customer.'}</p>
                </div>
              </div>

              <div className="grid gap-2 pt-1 sm:grid-cols-3">
                <ActionButton
                  label="Accept Order"
                  className="h-10 w-full bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                  disabledReason={actionDisabledReason(selectedOrder, 'Accept')}
                  onClick={() => handleAction(selectedOrder.id, 'Accept')}
                />
                <ActionButton
                  label="Refuse Order"
                  className="h-10 w-full bg-[#f4c23d] px-4 text-sm font-semibold text-white hover:bg-[#e7b52a]"
                  disabledReason={actionDisabledReason(selectedOrder, 'Refuse')}
                  onClick={() => handleAction(selectedOrder.id, 'Refuse')}
                />
                <ActionButton
                  label="Complete Order"
                  className="h-10 w-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
                  disabledReason={actionDisabledReason(selectedOrder, 'Complete')}
                  onClick={() => handleAction(selectedOrder.id, 'Complete')}
                />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(actionOrder)} onOpenChange={(open) => !open && setActionOrder(null)}>
        <DialogContent className="max-w-md">
          {actionOrder ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-black uppercase tracking-[0.05em]">Order Actions</DialogTitle>
                <DialogDescription>
                  #{actionOrder.number} · {actionOrder.customer_name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 sm:grid-cols-2">
                <ActionButton
                  label="Accept"
                  className="h-10 w-full bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800"
                  disabledReason={actionDisabledReason(actionOrder, 'Accept')}
                  onClick={() => handleAction(actionOrder.id, 'Accept')}
                />
                <ActionButton
                  label="Refuse"
                  className="h-10 w-full bg-[#f4c23d] px-3 text-sm font-semibold text-white hover:bg-[#e7b52a]"
                  disabledReason={actionDisabledReason(actionOrder, 'Refuse')}
                  onClick={() => handleAction(actionOrder.id, 'Refuse')}
                />
                <ActionButton
                  label="Complete"
                  className="h-10 w-full bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  disabledReason={actionDisabledReason(actionOrder, 'Complete')}
                  onClick={() => handleAction(actionOrder.id, 'Complete')}
                />
                <ActionButton
                  label="Delete"
                  className="h-10 w-full bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700"
                  disabledReason={actionDisabledReason(actionOrder, 'Delete')}
                  onClick={() => handleAction(actionOrder.id, 'Delete')}
                />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
      </TooltipProvider>
    </AdminShell>
  )
}
