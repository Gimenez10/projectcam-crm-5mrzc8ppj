import { Link } from 'react-router-dom'
import { Bell, Menu, Package2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SidebarNav } from '@/components/Sidebar'
import { mockUser, mockUsers } from '@/lib/mock-data'
import { ThemeToggle } from './ThemeToggle'

export const Header = () => {
  const pendingUsersCount = mockUsers.filter(
    (u) => u.status === 'Pending Approval',
  ).length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-lg md:px-6">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6 text-primary" />
          <span className="hidden text-lg font-bold md:inline-block">
            PROJECAM
          </span>
        </Link>
      </div>

      <div className="flex w-full items-center justify-center">
        <h1 className="text-xl font-semibold text-foreground">
          Sistema de Orçamentos
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar orçamentos..."
            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
          />
        </div>
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {pendingUsersCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {pendingUsersCount}
            </span>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <img
                src={mockUser.avatarUrl}
                alt="Avatar do usuário"
                className="h-8 w-8 rounded-full"
              />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Configurações</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="p-4 border-b">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <Package2 className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">PROJECAM</span>
                </Link>
              </div>
              <SidebarNav isMobile={true} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
