'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const links = [
  { href: '/dashboard',     label: 'Dashboard'     },
  { href: '/send',          label: 'Send money'    },
  { href: '/transactions',  label: 'Transactions'  },
  { href: '/admin',         label: 'Admin panel'   },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="w-52 min-h-screen bg-slate-50 border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <p className="font-semibold text-slate-800">PayFlow</p>
        <p className="text-xs text-slate-400 mt-0.5">Sandbox environment</p>
      </div>

      <nav className="flex-1 p-2 flex flex-col gap-0.5 mt-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              pathname === link.href
                ? 'bg-white text-slate-800 font-medium shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              pathname === link.href ? 'bg-blue-500' : 'bg-slate-300'
            }`} />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <p className="text-xs font-medium text-slate-700">{user?.username}</p>
        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        <button
          onClick={logout}
          className="mt-2 text-xs text-red-500 hover:text-red-600"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
