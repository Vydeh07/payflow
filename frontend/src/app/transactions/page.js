'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import api from '@/lib/api'

export default function TransactionsPage() {
  const [txns, setTxns]       = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    api.get('/transactions/history')
      .then((r) => setTxns(r.data.transactions || []))
      .finally(() => setLoading(false))
  }, [router])

  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {}

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-white">
        <h1 className="text-xl font-semibold text-slate-800 mb-6">Transactions</h1>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-medium">
            <span>ID</span>
            <span>From → To</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Time</span>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400 p-4">Loading...</p>
          ) : txns.length === 0 ? (
            <p className="text-sm text-slate-400 p-4">No transactions yet</p>
          ) : (
            txns.map((t) => {
              const isSender = t.sender_id === user.id
              return (
                <div key={t.id} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-slate-100 last:border-0 text-sm items-center">
                  <span className="text-slate-400 font-mono text-xs">{t.id.slice(0, 8)}...</span>
                  <span className="text-slate-600 text-xs">
                    {t.sender_username} → {t.receiver_username}
                  </span>
                  <span className={`font-semibold ${isSender ? 'text-red-500' : 'text-green-600'}`}>
                    {isSender ? '-' : '+'}₹{t.amount}
                  </span>
                  <span>
                    {t.flagged ? (
                      <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full">Flagged</span>
                    ) : (
                      <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full">{t.status}</span>
                    )}
                  </span>
                  <span className="text-slate-400 text-xs">{new Date(t.created_at).toLocaleString()}</span>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
