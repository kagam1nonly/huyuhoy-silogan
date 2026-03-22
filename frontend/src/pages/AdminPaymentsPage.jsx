import { useEffect, useState } from 'react'
import { adminConfirmPayment, adminDeletePayment, adminFetchPayments } from '../api/client'

export default function AdminPaymentsPage({ user }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

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

  if (!user?.is_staff) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Admin access only.</main>
  }

  if (loading) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Loading admin payments...</main>
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Admin · Payments</h1>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}

      <div className="mt-6 space-y-4">
        {payments.map((payment) => (
          <article key={payment.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Payment #{payment.id} · Order #{payment.order_number || 'N/A'}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{payment.payment_status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-700">Customer: {payment.customer_name || 'N/A'}</p>
            <p className="text-sm text-slate-700">Amount: ₱{payment.amount || '0.00'} · Method: {payment.method || 'N/A'}</p>
            <p className="text-sm text-slate-700">Reference: {payment.ref_num || 'N/A'}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => handleConfirm(payment.id)} className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">Confirm</button>
              <button onClick={() => handleDelete(payment.id)} className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
