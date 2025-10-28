import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { PlusCircle, Trash2, Upload } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PrintHeader } from '@/components/PrintHeader'

export default function NovaOrdemServicoPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [creationDate, setCreationDate] = useState(new Date())

  useEffect(() => {
    // Update the date every minute to keep it current
    const timer = setInterval(() => setCreationDate(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // NOTE: This is a simplified version. A real implementation would use a form library
  // like react-hook-form, manage items state, calculate totals, and handle customer selection.

  const handleSave = async () => {
    if (!user) return

    // Placeholder data
    const newOrder = {
      created_by: user.id,
      status: 'Rascunho',
      total_value: 0,
      // ... other fields
    }

    const { error } = await supabase.from('service_orders').insert(newOrder)

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Rascunho salvo!',
        description: 'A ordem de serviço foi salva como rascunho.',
      })
      navigate('/ordens-de-servico')
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <PrintHeader />
      <h1 className="text-2xl font-bold print:hidden">Nova Ordem de Serviço</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Cliente</CardTitle>
              <CardDescription>
                Busque por um cliente existente ou adicione um novo.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-name">Nome do Cliente</Label>
                <Input id="customer-name" placeholder="Digite para buscar..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer-cpf">CPF/CNPJ</Label>
                  <Input id="customer-cpf" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer-email">Email</Label>
                  <Input id="customer-email" type="email" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Itens da Ordem de Serviço</CardTitle>
                  <CardDescription>
                    Data de Criação:{' '}
                    {format(creationDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </CardDescription>
                </div>
                <div className="flex justify-end gap-2 print:hidden">
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Upload via OCR
                  </Button>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                  </Button>
                </div>
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
                    <TableHead className="print:hidden">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Input placeholder="Descrição do item" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" defaultValue="1" className="w-16" />
                    </TableCell>
                    <TableCell>
                      <Input placeholder="R$ 0,00" className="w-24" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" defaultValue="0" className="w-16" />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ 0,00
                    </TableCell>
                    <TableCell className="print:hidden">
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Ordem de Serviço</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ 0,00</span>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="global-discount">Desconto Global (%)</Label>
                <Input
                  id="global-discount"
                  type="number"
                  defaultValue="0"
                  className="w-20"
                />
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>
                  <span className="print:hidden">Total Geral</span>
                  <span className="hidden print:inline">Valor Total</span>
                </span>
                <span>R$ 0,00</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detalhes Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="valid-until">Data de Validade</Label>
                <Input id="valid-until" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment-conditions">
                  Condições de Pagamento
                </Label>
                <Textarea
                  id="payment-conditions"
                  placeholder="Ex: 30/60 dias"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea id="observations" placeholder="Notas adicionais" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/95 py-4 border-t flex justify-end gap-2 print:hidden">
        <Button variant="outline" asChild>
          <Link to="/ordens-de-servico">Cancelar</Link>
        </Button>
        <Button variant="secondary" onClick={handleSave}>
          Salvar Rascunho
        </Button>
        <Button>Enviar para Aprovação</Button>
      </div>
    </div>
  )
}
