import { useState, ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '../ui/scroll-area'

// NOTE: This is a placeholder for permissions. A real implementation would fetch this from the backend.
const mockPermissions = [
  'service_orders:create',
  'service_orders:read:own',
  'service_orders:read:all',
  'service_orders:update:own',
  'service_orders:update:all',
  'service_orders:delete:own',
  'service_orders:delete:all',
  'service_orders:approve_discounts',
  'customers:create',
  'customers:read',
  'customers:update',
  'customers:delete',
  'users:manage',
  'roles:manage',
]

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  description: z.string().optional(),
  permissions: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: 'Você deve selecionar pelo menos uma permissão.',
    }),
})

type Role = {
  id: string
  name: string
  description: string
  permissions: string[]
}

type RoleDialogProps = {
  children: ReactNode
  role?: Role
}

export const RoleDialog = ({ children, role }: RoleDialogProps) => {
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      permissions: role?.permissions || [],
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values) // Placeholder for API call
    setOpen(false)
    form.reset()
  }

  const title = role ? 'Editar Função' : 'Adicionar Nova Função'
  const description = role
    ? 'Edite os detalhes e permissões desta função.'
    : 'Preencha os detalhes para criar uma nova função.'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Função</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Vendedor Sênior" {...field} />
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
                      placeholder="Descreva o propósito desta função"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <FormLabel>Permissões</FormLabel>
                  <ScrollArea className="h-64 rounded-md border p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {mockPermissions.map((permission) => (
                        <FormField
                          key={permission}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          permission,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== permission,
                                          ),
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {permission}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
