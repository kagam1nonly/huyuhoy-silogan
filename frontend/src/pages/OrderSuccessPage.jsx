import { Link, Navigate, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card'

export default function OrderSuccessPage({ user }) {
  const location = useLocation()
  const orderNumber = location.state?.orderNumber
  const total = location.state?.total
  const itemCount = location.state?.itemCount

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Order Success</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-700">
          <p className="text-sm">Your order has been placed successfully.</p>
          {orderNumber ? <p className="text-sm">Order Number: <span className="font-semibold text-slate-900">#{orderNumber}</span></p> : null}
          {itemCount ? <p className="text-sm">Items: <span className="font-semibold text-slate-900">{itemCount}</span></p> : null}
          {total ? <p className="text-sm">Total: <span className="font-semibold text-slate-900">₱{total}</span></p> : null}
          <p className="pt-2 text-sm text-slate-600">Track status from My Orders anytime.</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild className="flex-1">
            <Link to="/my-orders">Order Tracker</Link>
          </Button>
          <Button asChild variant="secondary" className="flex-1">
            <Link to="/">Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
