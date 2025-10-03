import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar'

export default function Layout() {
  const { isCollapsed } = useSidebarStore()

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <Sidebar />
      <div
        className={cn(
          'flex flex-col transition-[margin-left] duration-300 ease-in-out',
        )}
      >
        <Header />
        <main className="flex-1 bg-background p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
