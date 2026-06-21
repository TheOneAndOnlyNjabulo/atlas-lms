'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, ShieldCheck, LogOut, GraduationCap, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/types'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
]

const adminItems = [
  { href: '/admin', label: 'Admin', icon: ShieldCheck },
]

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
        active
          ? 'bg-[#1a2035] text-white'
          : 'text-[#8b92a5] hover:text-white hover:bg-[#151c2c]'
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-indigo-400' : '')} />
      {label}
      {active && <ChevronRight className="h-3 w-3 ml-auto text-indigo-400" />}
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const roleColors: Record<number, string> = {
    0: 'bg-violet-500',
    1: 'bg-teal-500',
    2: 'bg-indigo-500',
  }

  return (
    <aside className="flex flex-col w-64 shrink-0 bg-[#0e1117] border-r border-[#1e2330] min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#1e2330]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <span className="font-display text-white font-700 text-lg tracking-tight" style={{ fontFamily: 'var(--font-syne)', fontWeight: 700 }}>
          Atlas
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#3d4557]">
          Navigation
        </p>
        {navItems.map(item => (
          <NavLink key={item.href} {...item} active={pathname === item.href || pathname.startsWith(item.href + '/')} />
        ))}

        {user.role === 0 && (
          <>
            <p className="px-3 mt-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#3d4557]">
              Management
            </p>
            {adminItems.map(item => (
              <NavLink key={item.href} {...item} active={pathname === item.href} />
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[#1e2330]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1">
          <div className={cn('flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold shrink-0', roleColors[user.role])}>
            {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
            <p className="text-xs text-[#8b92a5] truncate">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#8b92a5] hover:text-white hover:bg-[#151c2c] transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
