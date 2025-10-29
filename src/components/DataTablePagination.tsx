import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTablePaginationProps {
  page: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export function DataTablePagination({
  page,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
}: DataTablePaginationProps) {
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 sm:gap-8 w-full">
      <div className="text-sm text-muted-foreground flex-shrink-0">
        {total} item(s) no total.
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 w-full sm:w-auto justify-center">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">
            Itens por página
          </p>
          <Select
            value={`${perPage}`}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={perPage} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[120px] items-center justify-center text-sm font-medium whitespace-nowrap">
          Página {page} de {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <span className="sr-only">Primeira página</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <span className="sr-only">Página anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            <span className="sr-only">Próxima página</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
          >
            <span className="sr-only">Última página</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
