import { useEffect, useMemo, useState } from 'react'
import { adminConfirmPayment, adminDeletePayment, adminFetchPayments } from '../api/client'
import AdminShell from '../components/admin/AdminShell'
import { Button } from '../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

const STATUS_OPTIONS = ['All', 'Unpaid', 'Pending', 'Paid', 'Failed']
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount-high', label: 'Highest Amount' },
  { value: 'amount-low', label: 'Lowest Amount' },
]

function formatCurrency(value) {
  return `₱${Number(value || 0).toFixed(2)}`
}

function statusClass(status) {
  const map = {
    Unpaid: 'bg-red-100 text-red-700 border-red-200',
    Pending: 'bg-[#f4c23d]/20 text-[#926500] border-[#f4c23d]/45',
    Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Failed: 'bg-slate-200 text-slate-700 border-slate-300',
  }
  return map[status] || 'bg-slate-100 text-slate-700 border-slate-200'
}

export default function AdminPaymentsPage({ user }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('latest')

  async function loadPayments() {
    try {
      setLoading(true)
      const data = await adminFetchPayments()
      setPayments(data)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.is_staff) {
      loadPayments()
    } else {
      setLoading(false)
    }
  }, [user])

  async function handleConfirm(paymentId) {
    setError('')
    setMessage('')
    try {
      const response = await adminConfirmPayment(paymentId)
      setMessage(response.detail || 'Payment confirmed.')
      await loadPayments()
    } catch (confirmError) {
      setError(confirmError.message)
    }
  }

  async function handleDelete(paymentId) {
    setError('')
    setMessage('')
    try {
      const response = await adminDeletePayment(paymentId)
      setMessage(response.detail || 'Payment deleted.')
      await loadPayments()
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  const filteredPayments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    let next = payments.filter((payment) => {
      if (statusFilter !== 'All' && payment.payment_status !== statusFilter) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = [
        payment.id,
        payment.order_number,
        payment.customer_name,
        payment.payment_status,
        payment.ref_num,
        payment.method,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })

    next = next.sort((a, b) => {
      if (sortBy === 'oldest') {
        return Number(a.id) - Number(b.id)
      }
      if (sortBy === 'amount-high') {
        return Number(b.amount || 0) - Number(a.amount || 0)
      }
      if (sortBy === 'amount-low') {
        return Number(a.amount || 0) - Number(b.amount || 0)
      }
      return Number(b.id) - Number(a.id)
    })

    return next
  }, [payments, searchTerm, statusFilter, sortBy])

  if (!user?.is_staff) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Admin access only.</main>
  }

  if (loading) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Loading admin payments...</main>
  }

  return (
    <AdminShell user={user} title="Payments" subtitle="Review payment proofs, filter by status, and keep records clean.">
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Search
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Payment ID, order #, customer"
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
          Showing {filteredPayments.length} of {payments.length} payment records
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-semibold text-slate-900">#{payment.id}</TableCell>
                <TableCell className="font-semibold text-slate-700">#{payment.order_number || 'N/A'}</TableCell>
                <TableCell>{payment.customer_name || 'N/A'}</TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusClass(payment.payment_status)}`}>
                    {payment.payment_status}
                  </span>
                </TableCell>
                <TableCell className="font-semibold text-slate-800">{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{payment.ref_num || 'N/A'}</TableCell>
                <TableCell>{payment.method || 'N/A'}</TableCell>
                <TableCell>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Button
                      size="sm"
                      className="h-8 w-full bg-emerald-600 px-2 text-[11px] uppercase tracking-[0.06em] text-white hover:bg-emerald-700"
                      disabled={payment.payment_status === 'Paid'}
                      onClick={() => handleConfirm(payment.id)}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 w-full bg-red-600 px-2 text-[11px] uppercase tracking-[0.06em] text-white hover:bg-red-700"
                      onClick={() => handleDelete(payment.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!filteredPayments.length ? (
          <p className="py-6 text-center text-sm text-slate-500">No payment records matched your current filters.</p>
        ) : null}
      </div>
    </AdminShell>
  )
}
