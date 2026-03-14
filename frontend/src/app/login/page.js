'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import api from '@/lib/api'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', {
          email: form.email,
          password: form.password,
        })
        login(res.data.user, res.data.token)
        router.push('/dashboard')
      } else {
        const res = await api.post('/auth/register', {
          username: form.username,
          email: form.email,
          password: form.password,
        })
        const loginRes = await api.post('/auth/login', {
          email: form.email,
          password: form.password,
        })
        login(loginRes.data.user, loginRes.data.token)
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-800">PayFlow</h1>
          <p className="text-slate-500 mt-1">Payment Processing Platform</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handle} className="flex flex-col gap-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-slate-600 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="e.g. rahul_k"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-600 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Password</label>
              <input
                type="password"
                placeholder="minimum 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
