'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import api from '@/lib/api'

export default function SendPage() {
  const [form, setForm]       = useState({ receiver_username: '', amount: '', note: '' })
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.post('/transactions/send', {
        receiver_username: form.receiver_username,
        amount: parseFloat(form.amount),
        note: form.note,
      })
      setResult(res.data.transaction)
      setForm({ receiver_username: '', amount: '', note: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-white">
        <h1 className="text-xl font-semibold text-slate-800 mb-6">Send money</h1>

        <div className="max-w-md">
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <p className="text-sm font-medium text-slate-700">New transfer</p>
            </div>
            <form onSubmit={handle} className="p-4 flex flex-col gap-4">
              {result && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-lg">
                  ✓ ₹{result.amount} sent successfully
                  {result.flagged && <span className="ml-2 text-amber-600">· Flagged for review</span>}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm text-slate-600 mb-1">Recipient username</label>
                <input
                  type="text"
                  placeholder="e.g. amit_s"
                  value={form.receiver_username}
                  onChange={(e) => setForm({ ...form, receiver_username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Note (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dinner split"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                {loading ? 'Processing...' : 'Send money'}
              </button>
            </form>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <p className="text-sm font-medium text-slate-700">Fraud rules active</p>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {[
                { rule: 'Amount exceeds ₹50,000',         action: 'Block',            red: true  },
                { rule: '5+ transactions in 60 seconds',  action: 'Block + rate limit', red: true  },
                { rule: 'Insufficient balance',           action: 'Reject',           red: true  },
                { rule: 'Amount between ₹10k–₹50k',      action: 'Flag for review',  red: false },
              ].map((r) => (
                <div key={r.rule} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{r.rule}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.red ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                  }`}>{r.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
