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
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  getCustomerById,
  createCustomer,
  updateCustomer,
} from '@/services/customers'
import { Skeleton } from '@/components/ui/skeleton'
import { Customer, DayOfWeek } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

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

const passwordSchema = z.object({
  question: z.string().optional(),
  answer: z.string().optional(),
  username: z.string().optional(),
})

const operatingHoursSchema = z.object({
  day_of_week: z.string(),
  is_active: z.boolean(),
  morning_open: z.string().optional().nullable(),
  morning_close: z.string().optional().nullable(),
  afternoon_open: z.string().optional().nullable(),
  afternoon_close: z.string().optional().nullable(),
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
  property_observations: z.string().optional(),
  property_type: z.string().optional(),
  property_local_key: z.string().optional(),
  property_animals: z.string().optional(),
  passwords: z.array(passwordSchema).optional(),
  operating_hours: z.array(operatingHoursSchema).optional(),
  system_time_entry: z.string().optional(),
  system_time_exit: z.string().optional(),
  system_time_test: z.string().optional(),
  system_time_interval: z.string().optional(),
  system_time_auto_arm: z.string().optional(),
  system_time_siren: z.string().optional(),
  equipment_central: z.string().optional(),
  equipment_version: z.string().optional(),
  equipment_model: z.string().optional(),
  equipment_purchase_lease: z.string().optional(),
  equipment_keyboard: z.string().optional(),
  equipment_siren: z.string().optional(),
  equipment_infra: z.string().optional(),
  equipment_magnet: z.string().optional(),
  equipment_central_phone: z.string().optional(),
  equipment_communication_ways: z.string().optional(),
  installation_team: z.string().optional(),
  responsible_name: z.string().optional(),
})

const weekDays: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
]

const defaultOperatingHours = weekDays.map((day) => ({
  day_of_week: day.key,
  is_active: false,
  morning_open: '',
  morning_close: '',
  afternoon_open: '',
  afternoon_close: '',
}))

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
      operating_hours: defaultOperatingHours,
      local_contacts: [],
      emergency_contacts: [],
      passwords: [],
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
  const {
    fields: passwordFields,
    append: appendPassword,
    remove: removePassword,
  } = useFieldArray({ control: form.control, name: 'passwords' })
  const { fields: operatingHoursFields } = useFieldArray({
    control: form.control,
    name: 'operating_hours',
  })

  useEffect(() => {
    if (id) {
      getCustomerById(id).then((customer) => {
        if (customer) {
          const existingHours = customer.operating_hours || []
          const fullOperatingHours = defaultOperatingHours.map((defaultDay) => {
            const foundDay = existingHours.find(
              (d) => d.day_of_week === defaultDay.day_of_week,
            )
            return foundDay || defaultDay
          })
          form.reset({ ...customer, operating_hours: fullOperatingHours })
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
                  <div className="flex items-center">
                    <Button type="button" variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLocal(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
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
                  <div className="flex items-center">
                    <Button type="button" variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEmergency(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {emergencyFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum contato de emergência adicionado.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>INFORMAÇÕES SOBRE O IMÓVEL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="property_observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações sobre o imóvel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="property_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Imóvel</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Residencial, Comercial..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="property_local_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave Local</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Com porteiro, na caixa de correio..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="property_animals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Animais</FormLabel>
                      <FormControl>
                        <Input placeholder="Sim, 1 cachorro dócil" {...field} />
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
                <CardTitle>SENHA CONTRA-SENHA</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendPassword({ question: '', answer: '', username: '' })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Senha
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4">
                  <FormField
                    control={form.control}
                    name={`passwords.${index}.question`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Pergunta</FormLabel>
                        <FormControl>
                          <Input placeholder="Pergunta secreta" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`passwords.${index}.answer`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Resposta</FormLabel>
                        <FormControl>
                          <Input placeholder="Resposta secreta" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`passwords.${index}.username`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Usuário</FormLabel>
                        <FormControl>
                          <Input placeholder="Usuário associado" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePassword(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {passwordFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma senha adicionada.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Horários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {operatingHoursFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`operating_hours.${index}.is_active`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormLabel className="w-20">
                        {weekDays[index].label}
                      </FormLabel>
                    </div>
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`operating_hours.${index}.morning_open`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                value={field.value ?? ''}
                                disabled={
                                  !form.watch(
                                    `operating_hours.${index}.is_active`,
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`operating_hours.${index}.afternoon_close`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                value={field.value ?? ''}
                                disabled={
                                  !form.watch(
                                    `operating_hours.${index}.is_active`,
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>TEMPO SISTEMA</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="system_time_entry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entrada</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="system_time_exit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saida</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="system_time_test"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teste</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="system_time_interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interv.</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="system_time_auto_arm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auto Arme</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="system_time_siren"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sirene</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Equipamento</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="equipment_central"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Central</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipment_version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Versão</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipment_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipment_purchase_lease"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compra / Locação</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipment_keyboard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teclado</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipment_siren"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sirene</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipment_infra"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Infra</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipment_magnet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Magnet.</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipment_central_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone da Central</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="equipment_communication_ways"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vias de comunicação</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Telefone, GPRS, Rádio"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="installation_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipe de Instalação</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da equipe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="mt-6 flex items-center justify-end gap-4">
            <FormField
              control={form.control}
              name="responsible_name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Nome do Responsavel</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 self-end">
              <Button variant="outline" asChild>
                <Link to="/clientes">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Cliente'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
