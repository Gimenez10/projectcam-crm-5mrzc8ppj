import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  File,
  PlusCircle,
  Search,
  MoreHorizontal,
  Trash2,
  Copy,
  FileText,
  Pencil,
} from 'lucide-react'
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { mockServiceOrders } from '@/lib/mock-data'
import { ServiceOrder, ServiceOrderStatus } from '@/types'
import { cn } from '@/lib/utils'

const getStatusVariant = (
  status: ServiceOrderStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'Aprovado':
    case 'Fechado':
      return 'default'
    case 'Pendente':
      return 'secondary'
    case 'Rejeitado':
      return 'destructive'
    case 'Rascunho':
    default:
      return 'outline'
  }
}

export default function OrdensServicoListPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(mockServiceOrders.length / itemsPerPage)
  const currentServiceOrders = mockServiceOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lista de Ordens de Serviço</h1>
        <Button asChild>
          <Link to="/ordens-de-servico/nova">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Ordem de Serviço
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço</CardTitle>
          <CardDescription>
            Gerencie, visualize e edite suas ordens de serviço.
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por cliente ou ID..."
              className="w-full pl-8 md:w-1/3"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentServiceOrders.map((serviceOrder: ServiceOrder) => (
                <TableRow key={serviceOrder.id}>
                  <TableCell className="font-medium">
                    {serviceOrder.id}
                  </TableCell>
                  <TableCell>{serviceOrder.customer.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(serviceOrder.status)}
                      className={cn(
                        serviceOrder.status === 'Aprovado' &&
                          'bg-success text-success-foreground',
                        serviceOrder.status === 'Pendente' &&
                          'bg-warning text-warning-foreground',
                      )}
                    >
                      {serviceOrder.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{serviceOrder.salesperson.name}</TableCell>
                  <TableCell className="text-right">
                    {serviceOrder.totalValue.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
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
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/ordens-de-servico/editar/${serviceOrder.id}`}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Ver/Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" /> Gerar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" /> Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {mockServiceOrders.length === 0 && (
            <div className="text-center py-10">
              <File className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                Nenhuma ordem de serviço encontrada
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Comece criando uma nova ordem de serviço.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }}
              className={cn(
                currentPage === 1 && 'pointer-events-none opacity-50',
              )}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-4 text-sm">
              Página {currentPage} de {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }}
              className={cn(
                currentPage === totalPages && 'pointer-events-none opacity-50',
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
