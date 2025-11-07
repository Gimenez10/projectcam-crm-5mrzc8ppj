import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlusCircle, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PrintHeader } from '@/components/PrintHeader'
import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import { getAllCustomers } from '@/services/customers'
import { Customer } from '@/types'

const serviceOrderItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória.'),
  quantity: z.coerce.number().min(1, 'Qtd. deve ser no mínimo 1.'),
  unit_price: z.coerce.number().min(0, 'Preço não pode ser negativo.'),
  discount: z.coerce
    .number()
    .min(0, 'Desconto não pode ser negativo.')
    .max(100, 'Desconto não pode ser maior que 100%.')
    .optional()
    .default(0),
})

const serviceOrderSchema = z.object({
  customer_id: z.string().min(1, 'Cliente é obrigatório.'),
  items: z.array(serviceOrderItemSchema).min(1, 'Adicione pelo menos um item.'),
  global_discount: z.coerce.number().min(0).max(100).optional().default(0),
  valid_until: z.string().optional(),
  payment_conditions: z.string().optional(),
  observations: z.string().optional(),
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default function NovaOrdemServicoPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [creationDate] = useState(new Date())
  const [customerOptions, setCustomerOptions] = useState<ComboboxOption[]>([])

  const form = useForm<z.infer<typeof serviceOrderSchema>>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unit_price: 0, discount: 0 }],
      global_discount: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  useEffect(() => {
    getAllCustomers().then((data) => {
      setCustomerOptions(data.map((c) => ({ value: c.id, label: c.name })))
    })
  }, [])

  const watchedItems = form.watch('items')
  const watchedGlobalDiscount = form.watch('global_discount')

  const totals = useMemo(() => {
    const subtotal = watchedItems.reduce((acc, item) => {
      const itemTotal =
        (item.quantity || 0) *
        (item.unit_price || 0) *
        (1 - (item.discount || 0) / 100)
      return acc + itemTotal
    }, 0)
    const total = subtotal * (1 - (watchedGlobalDiscount || 0) / 100)
    return { subtotal, total }
  }, [watchedItems, watchedGlobalDiscount])

  const handleSave = async (status: 'Rascunho' | 'Pendente') => {
    if (!user) return

    await form.trigger()
    if (!form.formState.isValid && status === 'Pendente') {
      toast({
        title: 'Formulário Inválido',
        description: 'Por favor, corrija os erros antes de enviar.',
        variant: 'destructive',
      })
      return
    }

    const values = form.getValues()

    const { data: newOrder, error } = await supabase
      .from('service_orders')
      .insert([
        {
          created_by: user.id,
          customer_id: values.customer_id || null,
          status,
          total_value: totals.total,
          global_discount: values.global_discount,
          payment_conditions: values.payment_conditions,
          observations: values.observations,
          valid_until: values.valid_until || null,
        },
      ])
      .select()
      .single()

    if (error || !newOrder) {
      toast({
        title: 'Erro ao salvar',
        description: error?.message || 'Não foi possível salvar a O.S.',
        variant: 'destructive',
      })
      return
    }

    const itemsToInsert = values.items.map((item) => ({
      ...item,
      service_order_id: newOrder.id,
    }))

    const { error: itemsError } = await supabase
      .from('service_order_items')
      .insert(itemsToInsert)

    if (itemsError) {
      await supabase.from('service_orders').delete().eq('id', newOrder.id)
      toast({
        title: 'Erro ao salvar itens',
        description: itemsError.message,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: `O.S. salva como ${status}!`,
      description: 'A ordem de serviço foi salva com sucesso.',
    })
    navigate('/ordens-de-servico')
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <PrintHeader />
      <h1 className="text-h1 print:hidden">Nova Ordem de Serviço</h1>
      <Form {...form}>
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-h3">Detalhes do Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <Combobox
                        options={customerOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione um cliente..."
                        searchPlaceholder="Buscar cliente..."
                        emptyPlaceholder="Nenhum cliente encontrado."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-h3">
                      Itens da Ordem de Serviço
                    </CardTitle>
                    <CardDescription>
                      Data de Criação:{' '}
                      {format(creationDate, 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      append({
                        description: '',
                        quantity: 1,
                        unit_price: 0,
                        discount: 0,
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Descrição</TableHead>
                        <TableHead>Qtd.</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Desc. (%)</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const item = watchedItems[index]
                        const itemTotal =
                          (item.quantity || 0) *
                          (item.unit_price || 0) *
                          (1 - (item.discount || 0) / 100)
                        return (
                          <TableRow key={field.id}>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        className="w-16"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.unit_price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        className="w-24"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.discount`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        className="w-16"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(itemTotal)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
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
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <FormField
                  control={form.control}
                  name="global_discount"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Desconto Global (%)</FormLabel>
                      <FormControl>
                        <Input type="number" className="w-20" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Geral</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-h3">Detalhes Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Validade</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condições de Pagamento</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ex: 30/60 dias" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Notas adicionais" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
      <div className="sticky bottom-0 bg-background/95 py-4 border-t flex flex-col sm:flex-row justify-end gap-2 print:hidden">
        <Button variant="outline" asChild>
          <Link to="/ordens-de-servico">Cancelar</Link>
        </Button>
        <Button variant="secondary" onClick={() => handleSave('Rascunho')}>
          Salvar Rascunho
        </Button>
        <Button onClick={() => handleSave('Pendente')}>
          Enviar para Aprovação
        </Button>
      </div>
    </div>
  )
}
