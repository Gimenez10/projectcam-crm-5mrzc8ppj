import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { File, MoreHorizontal, PlusCircle, Search, Printer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getServiceOrders } from '@/services/serviceOrders'
import { ServiceOrder, ServiceOrderStatus } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTablePagination } from '@/components/DataTablePagination'

const statusVariant: { [key in ServiceOrderStatus]: string } = {
  Rascunho: 'bg-gray-500/20 text-gray-500',
  Pendente: 'bg-yellow-500/20 text-yellow-500',
  Aprovado: 'bg-blue-500/20 text-blue-500',
  Rejeitado: 'bg-red-500/20 text-red-500',
  Fechado: 'bg-green-500/20 text-green-500',
}

export default function OrdensServicoListPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    const { data, count } = await getServiceOrders({
      page,
      perPage,
      filters: { status: activeTab, searchTerm: debouncedSearchTerm },
    })
    setOrders(data)
    setTotal(count)
    setIsLoading(false)
  }, [page, perPage, activeTab, debouncedSearchTerm])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handlePrint = () => {
    window.print()
  }

  const renderSkeleton = () => (
    <TableRow>
      <TableCell colSpan={7}>
        <Skeleton className="h-8 w-full" />
      </TableCell>
    </TableRow>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center print:hidden">
        <div className="flex-1">
          <h1 className="text-h1">Ordens de Serviço</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe todas as suas ordens de serviço.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exportar
            </span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={handlePrint}
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Imprimir
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1" asChild>
            <Link to="/ordens-de-servico/nova">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Nova O.S.
              </span>
            </Link>
          </Button>
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="print:hidden"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="Pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="Aprovado">Aprovadas</TabsTrigger>
            <TabsTrigger value="Fechado">Fechadas</TabsTrigger>
          </TabsList>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por cliente, nº ou vendedor..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <TabsContent value={activeTab} className="mt-4">
          <Card className="print:shadow-none print:border-none">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: perPage }).map((_, i) =>
                        renderSkeleton(),
                      )
                    : orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.order_number}
                          </TableCell>
                          <TableCell>{order.customer?.name}</TableCell>
                          <TableCell>{order.salesperson?.full_name}</TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                'border-transparent',
                                statusVariant[order.status],
                              )}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(order.total_value)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.created_at), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/ordens-de-servico/editar/${order.id}`}
                                  >
                                    Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </CardContent>
            <div className="p-4 border-t print:hidden">
              <DataTablePagination
                page={page}
                total={total}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
