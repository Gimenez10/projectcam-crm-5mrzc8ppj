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
import { getProducts } from '@/services/products'
import { Product } from '@/types'
import { DeleteProductDialog } from '@/components/produtos/DeleteProductDialog'
import { useDebounce } from '@/hooks/use-debounce'
import { DataTablePagination } from '@/components/DataTablePagination'

export default function ProdutosListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    const { data, count } = await getProducts({
      page,
      perPage,
      searchTerm: debouncedSearchTerm,
    })
    setProducts(data)
    setTotal(count)
    setIsLoading(false)
  }, [page, perPage, debouncedSearchTerm])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const renderSkeleton = () => (
    <TableRow>
      <TableCell colSpan={5}>
        <Skeleton className="h-6 w-full" />
      </TableCell>
    </TableRow>
  )

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-h2">Produtos</CardTitle>
            <CardDescription>
              Gerencie seu catálogo de produtos.
            </CardDescription>
          </div>
          <Button asChild>
            <Link to="/produtos/novo">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto
            </Link>
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, código do produto ou de barras..."
            className="pl-8 w-full sm:w-1/2 md:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Cód. Produto
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Cód. Barra
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  Cód. Interno
                </TableHead>
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
                : products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {product.product_code || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.barcode || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.internal_code ?? 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/produtos/editar/${product.id}`}>
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DeleteProductDialog
                              product={product}
                              onProductDeleted={fetchProducts}
                            >
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DeleteProductDialog>
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
