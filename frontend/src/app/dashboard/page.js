'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import api from '@/lib/api'

export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [balance, setBalance] = useState(null)
  const [txns, setTxns]       = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    Promise.all([
      api.get('/admin/stats'),
      api.get('/balance'),
      api.get('/transactions/history'),
    ]).then(([s, b, t]) => {
      setStats(s.data)
      setBalance(b.data.balance)
      setTxns(t.data.transactions?.slice(0, 5) || [])
    }).finally(() => setLoading(false))
  }, [router])

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </main>
    </div>
  )

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-white">
        <h1 className="text-xl font-semibold text-slate-800 mb-6">Overview</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Your balance',  value: `₹${balance?.toLocaleString()}`, color: 'text-blue-600'  },
            { label: 'Total users',   value: stats?.total_users,              color: 'text-slate-800' },
            { label: 'Transactions',  value: stats?.total_transactions,       color: 'text-slate-800' },
            { label: 'Flagged',       value: stats?.flagged_transactions,     color: 'text-red-500'   },
          ].map((m) => (
            <div key={m.label} className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{m.label}</p>
              <p className={`text-2xl font-semibold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <p className="text-sm font-medium text-slate-700">Recent activity</p>
          </div>
          {txns.length === 0 ? (
            <p className="text-sm text-slate-400 p-4">No transactions yet</p>
          ) : (
            txns.map((t) => {
              const isSender = t.sender_id === user.id
              return (
                <div key={t.id} className="flex justify-between items-center px-4 py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {isSender
                        ? `To: ${t.receiver_username}`
                        : `From: ${t.sender_username}`}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(t.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.flagged && (
                      <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Flagged</span>
                    )}
                    <span className={`text-sm font-semibold ${isSender ? 'text-red-500' : 'text-green-600'}`}>
                      {isSender ? '-' : '+'}₹{t.amount}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
