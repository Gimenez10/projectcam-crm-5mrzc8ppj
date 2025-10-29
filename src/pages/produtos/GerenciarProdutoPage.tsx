import { useEffect, useState, useRef } from 'react'
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
import { scanImageWithOCR } from '@/services/ocr'
import { Skeleton } from '@/components/ui/skeleton'
import { Camera, Loader2 } from 'lucide-react'
import { Product } from '@/types'

const productFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome do produto deve ter pelo menos 3 caracteres.' }),
  description: z.string().optional(),
  product_code: z
    .string()
    .min(1, { message: 'Código do produto é obrigatório.' }),
  barcode: z.string().optional(),
  internal_code: z.string().optional(),
  serial_number: z.string().optional(),
  price: z.coerce
    .number({ invalid_type_error: 'Deve ser um número.' })
    .min(0, { message: 'O preço não pode ser negativo.' })
    .nullable(),
  stock: z.coerce
    .number({ invalid_type_error: 'Deve ser um número.' })
    .int({ message: 'Deve ser um número inteiro.' })
    .min(0, { message: 'O estoque não pode ser negativo.' })
    .nullable(),
})

type ProductFormField = keyof z.infer<typeof productFormSchema>

export default function GerenciarProdutoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(!!id)
  const [isSaving, setIsSaving] = useState(false)
  const [scanningField, setScanningField] = useState<ProductFormField | null>(
    null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      product_code: '',
      barcode: '',
      internal_code: '',
      serial_number: '',
      price: null,
      stock: null,
    },
  })

  useEffect(() => {
    if (id) {
      getProductById(id).then((product) => {
        if (product) {
          form.reset(product as any)
        } else {
          toast({ title: 'Produto não encontrado', variant: 'destructive' })
          navigate('/produtos')
        }
        setIsLoading(false)
      })
    }
  }, [id, form, navigate, toast])

  const handleCameraClick = (field: ProductFormField) => {
    setScanningField(field)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file && scanningField) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const base64Image = reader.result as string
        const { text, error } = await scanImageWithOCR(base64Image)
        if (error) {
          toast({
            title: 'Erro de OCR',
            description: 'Não foi possível ler o texto da imagem.',
            variant: 'destructive',
          })
        } else if (text) {
          form.setValue(scanningField, text)
          toast({ title: 'Campo preenchido via OCR!' })
        }
        setScanningField(null)
      }
      reader.onerror = () => {
        toast({
          title: 'Erro de Leitura',
          description: 'Não foi possível ler o arquivo de imagem.',
          variant: 'destructive',
        })
        setScanningField(null)
      }
    }
    if (event.target) {
      event.target.value = ''
    }
  }

  const onSubmit = async (values: z.infer<typeof productFormSchema>) => {
    if (!user) return
    setIsSaving(true)
    const result = id
      ? await updateProduct(id, values as Partial<Product>)
      : await createProduct(values as Partial<Product>, user.id)
    setIsSaving(false)

    if (result.error) {
      toast({
        title: 'Erro ao salvar produto',
        description: result.error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: `Produto ${id ? 'atualizado' : 'criado'} com sucesso!` })
      navigate('/produtos')
    }
  }

  const renderInputWithCamera = (
    field: any,
    fieldName: ProductFormField,
    placeholder: string,
  ) => (
    <div className="flex items-center gap-2">
      <FormControl>
        <Input placeholder={placeholder} {...field} />
      </FormControl>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => handleCameraClick(fieldName)}
        disabled={scanningField === fieldName}
      >
        {scanningField === fieldName ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>
    </div>
  )

  if (isLoading) return <Skeleton className="h-96 w-full" />

  return (
    <div className="animate-fade-in-up">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-h2">
                {id ? 'Editar Produto' : 'Novo Produto'}
              </CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="product_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Produto</FormLabel>
                      {renderInputWithCamera(
                        field,
                        'product_code',
                        'SKU-12345',
                      )}
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
                      {renderInputWithCamera(field, 'barcode', '1234567890123')}
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
                      {renderInputWithCamera(field, 'internal_code', 'ABC-001')}
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
                      {renderInputWithCamera(
                        field,
                        'serial_number',
                        'SN-ABC-123',
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="199.99"
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
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/produtos">Cancelar</Link>
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
