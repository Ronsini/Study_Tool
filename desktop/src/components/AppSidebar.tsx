import { useState } from 'react'
import { Home, Plus, Clock, Settings, ChevronRight, ChevronLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export type NavTab = 'home' | 'new-session' | 'history' | 'settings' | 'profile'

const NAV_ITEMS: {
  id: NavTab
  label: string
  Icon: React.ComponentType<{ size?: number }>
}[] = [
  { id: 'home',        label: 'Home',        Icon: Home },
  { id: 'new-session', label: 'New Session', Icon: Plus },
  { id: 'history',     label: 'History',     Icon: Clock },
  { id: 'settings',    label: 'Settings',    Icon: Settings },
]

interface Props {
  active: NavTab
  onChange: (tab: NavTab) => void
}

export default function AppSidebar({ active, onChange }: Props) {
  const [collapsed, setCollapsed] = useState(true)
  const { user } = useAuth()

  const initials = user?.name
    ? user.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email
      ? user.email[0].toUpperCase()
      : '?'

  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex flex-col h-full transition-all duration-300 ease-in-out border-r',
          'bg-[#0a0a0a] border-[#1e1e1e]',
          collapsed ? 'w-[80px]' : 'w-[240px]'
        )}
      >

        {/* ── Lettermark section ─────────────────────────────────────────── */}
        <div className={cn(
          'flex items-center h-20 border-b border-[#1e1e1e] shrink-0 px-4 gap-3',
          collapsed ? 'justify-center' : 'justify-start'
        )}>
          <div className="w-11 h-11 rounded-xl bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center shrink-0">
            <span className="text-[16px] font-bold text-white/85 leading-none">
              {initials.slice(0, 1)}
            </span>
          </div>
          {!collapsed && (
            <span className="flex-1 text-[15px] font-semibold text-[#f0f0f0] whitespace-nowrap overflow-hidden">
              Study Tool
            </span>
          )}
        </div>

        {/* ── Toggle row — both borders = "2 borders" ──────────────────── */}
        <div className="border-b border-[#1e1e1e] shrink-0">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(false)}
                  className="w-full h-12 flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-150 cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => setCollapsed(true)}
              className="w-full h-12 flex items-center gap-2 px-5 text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-150 cursor-pointer"
            >
              <ChevronLeft size={18} />
              <span className="text-[13px] font-medium">Collapse</span>
            </button>
          )}
        </div>

        {/* ── Nav items ────────────────────────────────────────────────── */}
        <nav className="flex-1 py-3">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = active === id

            const btn = (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={cn(
                  'w-full h-12 flex items-center transition-all duration-150 cursor-pointer',
                  collapsed ? 'justify-center px-0' : 'justify-start px-5 gap-3.5',
                  isActive && !collapsed && 'bg-[#1e1e1e]',
                )}
              >
                <div className={cn(
                  'flex items-center justify-center transition-all duration-150',
                  isActive && collapsed && 'bg-[#1e1e1e] rounded-xl p-2.5',
                )}>
                  <Icon size={22} className={isActive ? 'text-[#f0f0f0]' : 'text-white/35'} />
                </div>
                {!collapsed && (
                  <span className={cn(
                    'text-[14px] transition-colors duration-150',
                    isActive ? 'text-white font-semibold' : 'text-white/45 font-medium'
                  )}>
                    {label}
                  </span>
                )}
              </button>
            )

            if (!collapsed) return btn

            return (
              <Tooltip key={id}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>

        {/* ── Profile footer ───────────────────────────────────────────── */}
        <div className={cn(
          'border-t border-[#1e1e1e] shrink-0',
          collapsed ? 'flex justify-center p-4' : 'p-4'
        )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onChange('profile')}
                  className={cn(
                    'rounded-full transition-all duration-150 cursor-pointer',
                    active === 'profile' && 'ring-2 ring-[#22c55e]/40'
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-[#1c1c1c] border border-[#2e2e2e] text-white/70 text-[12px] font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => onChange('profile')}
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-150 cursor-pointer',
                active === 'profile' ? 'bg-[#1e1e1e]' : 'hover:bg-white/[0.04]'
              )}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={undefined} />
                <AvatarFallback className="bg-[#1c1c1c] border border-[#2e2e2e] text-white/70 text-[12px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[13px] font-semibold text-[#f0f0f0] truncate leading-tight">
                  {user?.name ?? 'Profile'}
                </span>
                <span className="text-[11px] text-white/35 truncate leading-tight mt-0.5">
                  {user?.email ?? ''}
                </span>
              </div>
            </button>
          )}
        </div>

      </div>
    </TooltipProvider>
  )
}
