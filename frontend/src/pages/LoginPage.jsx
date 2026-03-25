import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/client'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'

export default function LoginPage({ onLoggedIn }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
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
      const user = await login(form)
      onLoggedIn(user)
      navigate('/')
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Continue to your account to place and track orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Noobmaster69"
                type="text"
                value={form.username}
                onChange={(e) => updateField('username', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="********"
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-between">
          <p className="text-sm text-slate-600">No account yet?</p>
          <Button asChild variant="secondary">
            <Link to="/signup">Create account</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
