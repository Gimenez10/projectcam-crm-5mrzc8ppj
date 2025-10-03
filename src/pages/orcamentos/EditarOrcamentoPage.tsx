import { useParams, Link } from 'react-router-dom'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlusCircle, Trash2, Upload, FileText } from 'lucide-react'
import { mockQuotes } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'

export default function EditarOrcamentoPage() {
  const { id } = useParams()
  const quote = mockQuotes.find((q) => q.id === id)

  if (!quote) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Orçamento não encontrado</h1>
        <p className="text-muted-foreground">
          O orçamento com o ID {id} não foi encontrado.
        </p>
        <Button asChild className="mt-4">
          <Link to="/orcamentos">Voltar para a lista</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Editar Orçamento #{quote.id}</h1>
        <Badge variant="secondary" className="text-base">
          Status: {quote.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-name">Nome do Cliente</Label>
                <Input id="customer-name" defaultValue={quote.customer.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer-cpf">CPF/CNPJ</Label>
                  <Input
                    id="customer-cpf"
                    defaultValue={quote.customer.cpfCnpj}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    defaultValue={quote.customer.email}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itens do Orçamento</CardTitle>
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" /> Upload via OCR
                </Button>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Descrição</TableHead>
                    <TableHead>Qtd.</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                    <TableHead>Desc. (%)</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input defaultValue={item.description} />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          defaultValue={item.quantity}
                          className="w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          defaultValue={item.unitPrice.toFixed(2)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          defaultValue={item.discount}
                          className="w-16"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(
                          item.quantity *
                          item.unitPrice *
                          (1 - item.discount / 100)
                        ).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {quote.items
                    .reduce(
                      (acc, item) =>
                        acc +
                        item.quantity *
                          item.unitPrice *
                          (1 - item.discount / 100),
                      0,
                    )
                    .toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="global-discount">Desconto Global (%)</Label>
                <Input
                  id="global-discount"
                  type="number"
                  defaultValue={quote.globalDiscount}
                  className="w-20"
                />
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total Geral</span>
                <span>
                  {quote.totalValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/95 py-4 border-t flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link to="/orcamentos">Cancelar</Link>
        </Button>
        <Button variant="secondary">Salvar Alterações</Button>
        <Button>
          <FileText className="mr-2 h-4 w-4" /> Gerar PDF
        </Button>
      </div>
    </div>
  )
}
