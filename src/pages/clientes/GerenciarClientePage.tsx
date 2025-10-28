import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  getCustomerById,
  createCustomer,
  updateCustomer,
} from '@/services/customers'
import { Skeleton } from '@/components/ui/skeleton'
import { Customer } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PlusCircle, Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const localContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
})

const emergencyContactSchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  phone: z.string().optional(),
})

const customerFormSchema = z.object({
  created_at: z.string().optional(),
  trade_name: z.string().optional(),
  name: z
    .string()
    .min(3, { message: 'A razão social deve ter pelo menos 3 caracteres.' }),
  ie_rg: z.string().optional(),
  line_of_business: z.string().optional(),
  cpf_cnpj: z.string().optional(),
  email: z
    .string()
    .email({ message: 'Email inválido.' })
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  local_contacts: z.array(localContactSchema).max(3).optional(),
  emergency_contacts: z.array(emergencyContactSchema).max(3).optional(),
})

export default function GerenciarClientePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(!!id)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      trade_name: '',
      name: '',
      ie_rg: '',
      line_of_business: '',
      cpf_cnpj: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      local_contacts: [],
      emergency_contacts: [],
    },
  })

  const {
    fields: localFields,
    append: appendLocal,
    remove: removeLocal,
  } = useFieldArray({ control: form.control, name: 'local_contacts' })
  const {
    fields: emergencyFields,
    append: appendEmergency,
    remove: removeEmergency,
  } = useFieldArray({ control: form.control, name: 'emergency_contacts' })

  useEffect(() => {
    if (id) {
      getCustomerById(id).then((customer) => {
        if (customer) {
          form.reset(customer)
        } else {
          toast({ title: 'Cliente não encontrado', variant: 'destructive' })
          navigate('/clientes')
        }
        setIsLoading(false)
      })
    }
  }, [id, form, navigate, toast])

  const onSubmit = async (values: z.infer<typeof customerFormSchema>) => {
    if (!user) return
    setIsSaving(true)
    const result = id
      ? await updateCustomer(id, values as Partial<Customer>)
      : await createCustomer(values as Customer, user.id)
    setIsSaving(false)

    if (result.error) {
      toast({
        title: 'Erro ao salvar cliente',
        description: result.error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: `Cliente ${id ? 'atualizado' : 'criado'} com sucesso!` })
      navigate('/clientes')
    }
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />

  return (
    <div className="animate-fade-in-up space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    {id ? 'Editar Cliente' : 'Novo Cliente'}
                  </CardTitle>
                  <CardDescription>
                    Preencha os detalhes do cliente abaixo.
                  </CardDescription>
                </div>
                {id && form.getValues('created_at') && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold">Data do cadastro:</span>{' '}
                    {format(
                      new Date(form.getValues('created_at')!),
                      'dd/MM/yyyy HH:mm',
                      { locale: ptBR },
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="trade_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome fantasia do cliente"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Razão social do cliente"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ie_rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I.E / RG</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Inscrição Estadual ou RG"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="line_of_business"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ramo de Atividade</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Comércio, Indústria"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="cpf_cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF / CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 90000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contato@cliente.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, Número, Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Sua cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="SP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>LOCAL</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendLocal({ name: '', phone: '', role: '' })}
                  disabled={localFields.length >= 3}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Contato
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {localFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4">
                  <FormField
                    control={form.control}
                    name={`local_contacts.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do contato" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`local_contacts.${index}.phone`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="Telefone" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`local_contacts.${index}.role`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Função</FormLabel>
                        <FormControl>
                          <Input placeholder="Função" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLocal(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {localFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum contato local adicionado.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>EMERGÊNCIA</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendEmergency({ name: '', phone: '', relationship: '' })
                  }
                  disabled={emergencyFields.length >= 3}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Contato
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {emergencyFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4">
                  <FormField
                    control={form.control}
                    name={`emergency_contacts.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do contato" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`emergency_contacts.${index}.relationship`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Relação</FormLabel>
                        <FormControl>
                          <Input placeholder="Relação/Parentesco" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`emergency_contacts.${index}.phone`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="Telefone" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEmergency(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {emergencyFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum contato de emergência adicionado.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link to="/clientes">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
