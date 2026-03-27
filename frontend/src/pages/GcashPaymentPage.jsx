import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { processGcashPayment } from '../api/client'
import ImageWithFallback from '../components/ImageWithFallback'
import { Button } from '../components/ui/button'

export default function GcashPaymentPage({ user }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [referenceNumber, setReferenceNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const orderNumber = searchParams.get('order') || ''
  const amount = searchParams.get('amount') || '0.00'
  const itemCount = Number(searchParams.get('items') || 0)

  const amountValue = useMemo(() => Number(amount || 0).toFixed(2), [amount])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const refValue = referenceNumber.trim()
    if (!/^\d{12,13}$/.test(refValue)) {
      setError('Reference number must be 13 digits.')
      return
    }

    try {
      setSubmitting(true)
      await processGcashPayment(orderNumber, {
        amount: amountValue,
        ref_num: refValue,
      })

      toast.success('GCash reference submitted.', {
        description: `Order #${orderNumber} is awaiting payment confirmation.`,
      })

      navigate('/order-success', {
        state: {
          orderNumber,
          total: amountValue,
          itemCount,
        },
      })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return <main className="mx-auto w-full max-w-3xl px-4 py-10 text-slate-700">Please login to submit GCash payment.</main>
  }

  if (!orderNumber) {
    return <main className="mx-auto w-full max-w-3xl px-4 py-10 text-slate-700">Missing order details for GCash payment.</main>
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-6 md:py-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">GCash Payment</h1>
        <p className="mt-2 text-sm text-slate-600">
          Order #{orderNumber} · Total ₱{amountValue}
        </p>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <ImageWithFallback
            src="/gcash.jpg"
            alt="GCash QR or payment instructions"
            wrapperClassName="max-h-[42vh] w-full bg-white"
            className="max-h-[42vh] w-full object-contain bg-white"
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Reference Number
            <input
              type="text"
              value={referenceNumber}
              onChange={(event) => setReferenceNumber(event.target.value.replace(/\D/g, '').slice(0, 13))}
              placeholder="Enter 13 digit reference number"
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400"
            />
          </label>

          <p className="text-xs text-slate-500">Reference number must be 12 to 13 digits.</p>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Reference'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/my-orders')}>
              Back to Orders
            </Button>
          </div>
        </form>
      </section>
    </main>
  )
}
