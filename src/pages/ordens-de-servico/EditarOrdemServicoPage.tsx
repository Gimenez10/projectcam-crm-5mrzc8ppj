import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { getServiceOrderById } from '@/services/serviceOrders'
import { ServiceOrder } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PrintHeader } from '@/components/PrintHeader'

export default function EditarOrdemServicoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      navigate('/ordens-de-servico')
      return
    }
    const fetchOrder = async () => {
      setIsLoading(true)
      const data = await getServiceOrderById(id)
      if (data) {
        setOrder(data)
      } else {
        toast({
          title: 'Erro',
          description: 'Ordem de serviço não encontrada.',
          variant: 'destructive',
        })
        navigate('/ordens-de-servico')
      }
      setIsLoading(false)
    }
    fetchOrder()
  }, [id, navigate, toast])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <PrintHeader />
      <h1 className="text-h1 print:hidden">
        Editar Ordem de Serviço #{order?.order_number}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-h3">Detalhes do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-name">Nome do Cliente</Label>
                <Input
                  id="customer-name"
                  defaultValue={order?.customer?.name ?? ''}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-h3">
                Itens da Ordem de Serviço
              </CardTitle>
              {order?.created_at && (
                <CardDescription>
                  Data de Criação:{' '}
                  {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', {
                    locale: ptBR,
                  })}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Qtd.</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order?.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(item.quantity * item.unit_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-h3">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex justify-between text-lg font-bold">
                <span>
                  <span className="print:hidden">Total Geral</span>
                  <span className="hidden print:inline">Valor Total</span>
                </span>
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(order?.total_value ?? 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/95 py-4 border-t flex flex-col sm:flex-row justify-end gap-2 print:hidden">
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link to="/ordens-de-servico">Cancelar</Link>
        </Button>
        <Button className="w-full sm:w-auto">Salvar Alterações</Button>
      </div>
    </div>
  )
}
