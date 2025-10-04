import { NavLink } from 'react-router-dom'
import {
  Home,
  FileText,
  PlusCircle,
  CheckSquare,
  Users,
  Package,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSidebarStore } from '@/stores/sidebar'

export const navItems = [
  {
    to: '/',
    icon: Home,
    label: 'Dashboard',
    shortLabel: 'Dashboard',
    color: 'text-sky-500',
  },
  {
    to: '/ordens-de-servico',
    icon: FileText,
    label: 'Ordens de Serviço',
    shortLabel: 'OS',
    color: 'text-orange-500',
  },
  {
    to: '/ordens-de-servico/nova',
    icon: PlusCircle,
    label: 'Nova Ordem de Serviço',
    shortLabel: 'Nova',
    color: 'text-green-500',
  },
  {
    to: '/aprovacoes',
    icon: CheckSquare,
    label: 'Aprovações',
    shortLabel: 'Aprovar',
    color: 'text-yellow-500',
  },
  {
    to: '/clientes',
    icon: Users,
    label: 'Clientes',
    shortLabel: 'Clientes',
    disabled: true,
    color: 'text-purple-500',
  },
  {
    to: '/produtos',
    icon: Package,
    label: 'Produtos',
    shortLabel: 'Produtos',
    disabled: true,
    color: 'text-pink-500',
  },
  {
    to: '/settings',
    icon: Settings,
    label: 'Configurações',
    shortLabel: 'Ajustes',
    color: 'text-gray-500',
  },
]

type SidebarNavProps = {
  isMobile?: boolean
}

export const SidebarNav = ({ isMobile = false }: SidebarNavProps) => {
  const { isExpanded } = useSidebarStore()
  const showLabels = isExpanded || isMobile

  return (
    <nav className={cn('flex flex-col gap-2 px-2 sm:py-4', isMobile && 'mt-4')}>
      {navItems.map((item) => (
        <Tooltip key={item.label} delayDuration={0}>
          <TooltipTrigger asChild>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive && 'bg-accent text-primary',
                  item.disabled && 'cursor-not-allowed opacity-50',
                  !showLabels && 'justify-center',
                )
              }
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <item.icon className={cn('h-5 w-5', item.color)} />
              {showLabels && <span>{item.label}</span>}
            </NavLink>
          </TooltipTrigger>
          {!showLabels && (
            <TooltipContent side="right">{item.label}</TooltipContent>
          )}
        </Tooltip>
      ))}
    </nav>
  )
}

export const Sidebar = () => {
  const { isExpanded, setIsExpanded } = useSidebarStore()

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col border-r bg-card transition-all duration-300 ease-in-out',
        isExpanded ? 'w-64' : 'w-20',
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex-1">
        <SidebarNav />
      </div>
    </aside>
  )
}
