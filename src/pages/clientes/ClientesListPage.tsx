import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomers } from '@/services/customers'
import { Customer } from '@/types'
import { DeleteCustomerDialog } from '@/components/clientes/DeleteCustomerDialog'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTablePagination } from '@/components/DataTablePagination'

export default function ClientesListPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true)
    const { data, count } = await getCustomers({
      page,
      perPage,
      searchTerm: debouncedSearchTerm,
    })
    setCustomers(data)
    setTotal(count)
    setIsLoading(false)
  }, [page, perPage, debouncedSearchTerm])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const renderSkeleton = () => (
    <TableRow>
      <TableCell colSpan={4}>
        <Skeleton className="h-6 w-full" />
      </TableCell>
    </TableRow>
  )

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              Gerencie seus clientes e visualize seus detalhes.
            </CardDescription>
          </div>
          <Button asChild>
            <Link to="/clientes/novo">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
            </Link>
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, CPF/CNPJ ou email..."
            className="pl-8 sm:w-1/2 md:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Telefone</TableHead>
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
                : customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>{customer.cpf_cnpj || 'N/A'}</TableCell>
                      <TableCell>{customer.phone || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/clientes/editar/${customer.id}`}>
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DeleteCustomerDialog
                              customer={customer}
                              onCustomerDeleted={fetchCustomers}
                            >
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DeleteCustomerDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <DataTablePagination
          page={page}
          total={total}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      </CardFooter>
    </Card>
  )
}
