import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { ServiceOrder } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function AprovacoesPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchPendingOrders = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('service_orders')
      .select(
        `
        id, order_number, status, total_value, created_at,
        customer:customers(id, name),
        salesperson:profiles(id, full_name)
      `,
      )
      .eq('status', 'Pendente')

    if (error) {
      toast({
        title: 'Erro ao buscar aprovações',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setOrders(
        data.map((order: any) => ({
          ...order,
          customer: order.customer,
          salesperson: order.salesperson,
        })) as ServiceOrder[],
      )
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPendingOrders()
  }, [])

  const handleApproval = async (
    orderId: string,
    newStatus: 'Aprovado' | 'Rejeitado',
  ) => {
    const { error } = await supabase
      .from('service_orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      toast({
        title: `Erro ao ${newStatus === 'Aprovado' ? 'aprovar' : 'rejeitar'}`,
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso!',
        description: `Ordem de serviço ${newStatus.toLowerCase()}a.`,
      })
      fetchPendingOrders()
    }
  }

  const renderSkeleton = () => (
    <TableRow>
      <TableCell colSpan={6}>
        <Skeleton className="h-4 w-full" />
      </TableCell>
    </TableRow>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h2">Aprovações Pendentes</CardTitle>
        <CardDescription>
          Revise e aprove ou rejeite as ordens de serviço pendentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => renderSkeleton())
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.order_number}
                  </TableCell>
                  <TableCell>{order.customer?.name}</TableCell>
                  <TableCell>{order.salesperson?.full_name}</TableCell>
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
                  <TableCell className="text-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-500 hover:text-green-600"
                      onClick={() => handleApproval(order.id, 'Aprovado')}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleApproval(order.id, 'Rejeitado')}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button asChild size="sm" variant="link">
                      <Link to={`/ordens-de-servico/editar/${order.id}`}>
                        Detalhes
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma ordem de serviço pendente de aprovação.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
