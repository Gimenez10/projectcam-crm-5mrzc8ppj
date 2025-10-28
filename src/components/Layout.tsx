import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { MobileNav } from './MobileNav'

export default function Layout() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr] print:block">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <MobileNav />
        <main className="flex-1 bg-background p-4 md:p-6 lg:p-8 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
