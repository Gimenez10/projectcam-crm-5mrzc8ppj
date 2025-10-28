import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
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
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  getCustomerById,
  createCustomer,
  updateCustomer,
} from '@/services/customers'
import { Skeleton } from '@/components/ui/skeleton'
import { Customer } from '@/types'

const customerFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
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
      name: '',
      cpf_cnpj: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
    },
  })

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
    <div className="animate-fade-in-up">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{id ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
              <CardDescription>
                Preencha os detalhes do cliente abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome / Razão Social</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome completo do cliente"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
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
              </div>
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
