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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockQuotes } from '@/lib/mock-data'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, X } from 'lucide-react'

const pendingApprovals = mockQuotes.filter(
  (q) => q.approvalStatus === 'Pendente',
)

export default function AprovacoesPage() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      <h1 className="text-2xl font-bold">Aprovações Pendentes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Desconto</CardTitle>
          <CardDescription>
            Revise e aprove ou rejeite os descontos solicitados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Orçamento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Desconto (%)</TableHead>
                <TableHead>Data da Solicitação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovals.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.id}</TableCell>
                  <TableCell>{quote.customer.name}</TableCell>
                  <TableCell>{quote.salesperson.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {quote.globalDiscount.toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {quote.requestedAt
                      ? formatDistanceToNow(quote.requestedAt, {
                          addSuffix: true,
                          locale: ptBR,
                        })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-success/10 text-success hover:bg-success/20 border-success/20"
                      >
                        <Check className="mr-2 h-4 w-4" /> Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
                      >
                        <X className="mr-2 h-4 w-4" /> Rejeitar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pendingApprovals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma aprovação pendente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
