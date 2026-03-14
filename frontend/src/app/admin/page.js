'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import api from '@/lib/api'

export default function AdminPage() {
  const [users, setUsers]     = useState([])
  const [flagged, setFlagged] = useState([])
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/flagged'),
      api.get('/admin/stats'),
    ]).then(([u, f, s]) => {
      setUsers(u.data.users || [])
      setFlagged(f.data.flagged_transactions || [])
      setStats(s.data)
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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-white">
        <h1 className="text-xl font-semibold text-slate-800 mb-6">Admin panel</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total users',    value: stats?.total_users,            color: 'text-blue-600'  },
            { label: 'Transactions',   value: stats?.total_transactions,     color: 'text-slate-800' },
            { label: 'Flagged',        value: stats?.flagged_transactions,   color: 'text-red-500'   },
            { label: 'Total volume',   value: `₹${stats?.total_volume?.toLocaleString()}`, color: 'text-green-600' },
          ].map((m) => (
            <div key={m.label} className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{m.label}</p>
              <p className={`text-2xl font-semibold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <p className="text-sm font-medium text-slate-700">All users</p>
          </div>
          <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-medium">
            <span>Username</span><span>Email</span><span>Balance</span><span>Transactions</span>
          </div>
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-slate-100 last:border-0 text-sm items-center">
              <span className="font-medium text-slate-700">{u.username}</span>
              <span className="text-slate-500 truncate">{u.email}</span>
              <span className="font-semibold text-slate-800">₹{u.balance?.toLocaleString()}</span>
              <span className="text-slate-500">{u.transaction_count}</span>
            </div>
          ))}
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <p className="text-sm font-medium text-slate-700">Flagged transactions</p>
            {flagged.length > 0 && (
              <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full">{flagged.length} alerts</span>
            )}
          </div>
          {flagged.length === 0 ? (
            <p className="text-sm text-slate-400 p-4">No flagged transactions</p>
          ) : (
            flagged.map((t) => (
              <div key={t.id} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-slate-100 last:border-0 text-sm items-center">
                <span className="font-mono text-xs text-slate-400">{t.id.slice(0,8)}...</span>
                <span className="text-red-500 font-semibold">₹{t.amount}</span>
                <span className="text-slate-500 text-xs">{t.flag_reason}</span>
                <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full w-fit">{t.status}</span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
