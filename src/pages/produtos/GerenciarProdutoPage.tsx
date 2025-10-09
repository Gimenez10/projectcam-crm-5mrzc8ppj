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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  getProductById,
  createProduct,
  updateProduct,
} from '@/services/products'
import { Skeleton } from '@/components/ui/skeleton'
import { Camera } from 'lucide-react'

const productFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome do produto deve ter pelo menos 3 caracteres.' }),
  description: z.string().optional(),
  product_code: z.string().optional(),
  barcode: z.string().optional(),
  internal_code: z.coerce
    .number({ invalid_type_error: 'Deve ser um número.' })
    .int({ message: 'Deve ser um número inteiro.' })
    .min(0, { message: 'O código interno não pode ser negativo.' })
    .max(999, { message: 'O código interno não pode ser maior que 999.' })
    .nullable(),
  serial_number: z.string().optional(),
})

export default function GerenciarProdutoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(!!id)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      product_code: '',
      barcode: '',
      internal_code: null,
      serial_number: '',
    },
  })

  useEffect(() => {
    if (id) {
      getProductById(id).then((product) => {
        if (product) {
          form.reset(product)
        } else {
          toast({
            title: 'Produto não encontrado',
            variant: 'destructive',
          })
          navigate('/produtos')
        }
        setIsLoading(false)
      })
    }
  }, [id, form, navigate, toast])

  const onSubmit = async (values: z.infer<typeof productFormSchema>) => {
    if (!user) return
    setIsSaving(true)
    const result = id
      ? await updateProduct(id, values)
      : await createProduct(values, user.id)
    setIsSaving(false)

    if (result.error) {
      toast({
        title: 'Erro ao salvar produto',
        description: result.error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: `Produto ${id ? 'atualizado' : 'criado'} com sucesso!`,
      })
      navigate('/produtos')
    }
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <div className="animate-fade-in-up">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{id ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
              <CardDescription>
                Preencha os detalhes do produto abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Câmera de Segurança" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalhes sobre o produto"
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
                  name="product_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Produto</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Barra</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder="1234567890123" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            toast({
                              title: 'Funcionalidade em desenvolvimento',
                            })
                          }
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="internal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Interno</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0-999"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serial_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Série</FormLabel>
                      <FormControl>
                        <Input placeholder="SN-ABC-123" {...field} />
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
              <Link to="/produtos">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
