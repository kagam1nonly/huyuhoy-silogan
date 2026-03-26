import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../api/client'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'

const INITIAL_STATE = {
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
}

export default function SignupPage({ onSignedUp }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_STATE)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(key, value) {
    setForm({ ...form, [key]: value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setSubmitting(true)
      const user = await signup(form)
      onSignedUp(user)
      navigate('/')
    } catch (signupError) {
      setError(signupError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Set up your account to speed up checkout and track orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Username</label>
              <input value={form.username} onChange={(e) => updateField('username', e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">First name</label>
              <input value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Last name</label>
              <input value={form.last_name} onChange={(e) => updateField('last_name', e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Address</label>
              <input value={form.address} onChange={(e) => updateField('address', e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" required minLength={8} />
            </div>
            {error && <p className="text-sm text-rose-600 md:col-span-2">{error}</p>}
            <Button type="submit" className="md:col-span-2" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-between">
          <p className="text-sm text-slate-600">Already have an account?</p>
          <Button asChild variant="secondary">
            <Link to="/login">Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
