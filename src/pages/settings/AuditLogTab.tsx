import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { Profile } from '@/types'
import { getAllProfiles } from '@/services/profiles'
import { Skeleton } from '@/components/ui/skeleton'

// NOTE: Audit log data would be fetched from a dedicated 'audit_logs' table.
// This is a placeholder UI.
const mockAuditLogs: any[] = []

export const AuditLogTab = () => {
  const [users, setUsers] = useState<Profile[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const profiles = await getAllProfiles()
      setUsers(profiles)
    }
    fetchUsers()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log de Auditoria</CardTitle>
        <CardDescription>
          Rastreie as atividades dos usuários no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Select>
            <SelectTrigger className="md:w-[200px]">
              <SelectValue placeholder="Filtrar por usuário" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="md:w-[200px]">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              {/* Actions would be populated dynamically */}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full md:w-[240px] justify-start text-left font-normal',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Selecione um período</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="range" numberOfMonths={2} />
            </PopoverContent>
          </Popover>
          <Button>
            <Search className="mr-2 h-4 w-4" /> Filtrar
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Data e Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAuditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum registro de auditoria encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                <></> /* Map over logs here */
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
