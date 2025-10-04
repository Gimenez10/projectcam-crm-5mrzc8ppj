import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { navItems as originalNavItems } from '@/components/Sidebar'

const mobileNavItems = originalNavItems
  .filter((item) => !item.disabled)
  .map((item) => {
    if (item.label === 'Novo Orçamento') {
      return { ...item, label: 'Novo' }
    }
    if (item.label === 'Configurações') {
      return { ...item, label: 'Ajustes' }
    }
    return item
  })

export const MobileNav = () => {
  return (
    <nav className="md:hidden sticky top-16 bg-background border-b z-20">
      <div className="grid grid-cols-5 items-center h-16">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary w-full h-full pt-2 pb-1',
                isActive && 'text-primary font-semibold',
              )
            }
          >
            <item.icon className={cn('h-5 w-5', item.color)} />
            <span className="text-xs truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
