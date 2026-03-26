import { useEffect, useMemo, useState } from 'react'
import { adminFetchOrders, adminFetchPayments } from '../api/client'
import AdminShell from '../components/admin/AdminShell'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

function formatCurrency(value) {
  return `₱${Number(value || 0).toFixed(2)}`
}

function formatDayLabel(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

export default function AdminDashboardPage({ user }) {
  const [orders, setOrders] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [ordersData, paymentsData] = await Promise.all([adminFetchOrders(), adminFetchPayments()])
        setOrders(ordersData)
        setPayments(paymentsData)
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setLoading(false)
      }
    }

    if (user?.is_staff) {
      load()
    } else {
      setLoading(false)
    }
  }, [user])

  const stats = useMemo(() => {
    const paidOrders = orders.filter((order) => order.payment_status === 'Paid')
    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.bill || 0), 0)
    const pendingOrders = orders.filter((order) => order.status === 'Pending').length
    const processingOrders = orders.filter((order) => order.status === 'Processing').length
    const completedOrders = orders.filter((order) => order.status === 'Completed').length
    const unpaidPayments = payments.filter((payment) => payment.payment_status !== 'Paid').length
    const paidPayments = payments.filter((payment) => payment.payment_status === 'Paid').length

    const latestSevenDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      return date
    })

    const revenueByDay = latestSevenDays.map((day) => {
      const key = day.toISOString().slice(0, 10)
      const dayOrders = paidOrders.filter((order) => {
        const orderDate = new Date(order.date)
        if (Number.isNaN(orderDate.getTime())) {
          return false
        }
        return orderDate.toISOString().slice(0, 10) === key
      })

      return {
        day: day.toLocaleDateString('en-PH', { weekday: 'short' }),
        amount: dayOrders.reduce((sum, order) => sum + Number(order.bill || 0), 0),
      }
    })

    const maxDailyRevenue = Math.max(...revenueByDay.map((entry) => entry.amount), 1)

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4)

    return {
      totalOrders: orders.length,
      totalPayments: payments.length,
      totalRevenue,
      pendingOrders,
      processingOrders,
      completedOrders,
      unpaidPayments,
      paidPayments,
      revenueByDay,
      maxDailyRevenue,
      recentOrders,
    }
  }, [orders, payments])

  if (!user?.is_staff) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 text-slate-700">Admin access only.</main>
  }

  return (
    <AdminShell user={user} title="Dashboard" subtitle="Overview of orders, payments, and revenue.">
      {loading ? <p className="text-sm text-slate-600">Loading admin dashboard...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total Orders</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-black text-slate-900">{stats.totalOrders}</CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total Payments</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-black text-slate-900">{stats.totalPayments}</CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Paid Revenue</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-black text-slate-900">{formatCurrency(stats.totalRevenue)}</CardContent>
            </Card>
            <Card className="border-[#f4c23d]/45 bg-[#f4c23d]/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-[#926500]">Pending / Processing</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-black text-[#926500]">{stats.pendingOrders + stats.processingOrders}</CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700">Unpaid Payments</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-black text-red-700">{stats.unpaidPayments}</CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase tracking-[0.08em] text-slate-800">Paid Revenue Trend (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid h-56 grid-cols-7 items-end gap-2">
                  {stats.revenueByDay.map((entry) => (
                    <div key={entry.day} className="flex h-full flex-col items-center justify-end gap-2">
                      <div
                        className="w-full rounded-t-md bg-[#1f2536]"
                        style={{ height: `${Math.max((entry.amount / stats.maxDailyRevenue) * 100, 8)}%` }}
                        title={`${entry.day}: ${formatCurrency(entry.amount)}`}
                      />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{entry.day}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase tracking-[0.08em] text-slate-800">Order Status Mix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-600">
                    <span>Pending</span>
                    <span>{stats.pendingOrders}</span>
                  </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-[#f4c23d]" style={{ width: `${stats.totalOrders ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-600">
                    <span>Processing</span>
                    <span>{stats.processingOrders}</span>
                  </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-slate-700" style={{ width: `${stats.totalOrders ? (stats.processingOrders / stats.totalOrders) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-600">
                    <span>Completed</span>
                    <span>{stats.completedOrders}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${stats.totalOrders ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <p className="font-semibold text-slate-700">Paid payments: {stats.paidPayments}</p>
                  <p className="text-slate-500">Needs attention: {stats.unpaidPayments}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold uppercase tracking-[0.08em] text-slate-800">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {stats.recentOrders.length ? (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Order #{order.number}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{order.customer_name}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDayLabel(order.date)}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{formatCurrency(order.bill)}</p>
                    <p className="mt-1 text-xs text-slate-500">{order.status} · {order.transaction}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No recent orders yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </AdminShell>
  )
}
