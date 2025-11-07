import { useState, ReactNode, useEffect } from 'react'
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
import { Permission, Role } from '@/types'
import { getPermissions, createRole, updateRole } from '@/services/roles'
import { useToast } from '../ui/use-toast'
import { useAuth } from '@/hooks/use-auth'

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  description: z.string().optional(),
  permissionIds: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: 'Você deve selecionar pelo menos uma permissão.',
    }),
})

const salesPermissions = [
  'service_orders:create',
  'service_orders:read:own',
  'service_orders:update:own',
  'customers:create',
  'customers:read',
  'customers:update',
  'products:create',
  'products:read',
  'products:update',
]

type RoleDialogProps = {
  children: ReactNode
  role?: Role
  onRoleSaved: () => void
}

export const RoleDialog = ({
  children,
  role,
  onRoleSaved,
}: RoleDialogProps) => {
  const [open, setOpen] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user: adminUser, profile: adminProfile } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      permissionIds: [],
    },
  })

  useEffect(() => {
    const fetchPerms = async () => {
      const perms = await getPermissions()
      setPermissions(perms)
    }
    if (open) {
      fetchPerms()
      form.reset({
        name: role?.name || '',
        description: role?.description || '',
        permissionIds: role?.permissions || [],
      })
    }
  }, [open, role, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!adminUser || !adminProfile) {
      toast({ title: 'Erro de autenticação', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    const actor = { id: adminUser.id, name: adminProfile.full_name ?? 'Admin' }

    const result = role
      ? await updateRole(role.id, values, actor)
      : await createRole(values, actor)

    setIsLoading(false)
    if (result.error) {
      toast({
        title: `Erro ao salvar função`,
        description: result.error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: `Função ${role ? 'atualizada' : 'criada'} com sucesso!` })
      onRoleSaved()
      setOpen(false)
    }
  }

  const handleSelectAll = () => {
    const allPermissionIds = permissions.map((p) => p.id)
    form.setValue('permissionIds', allPermissionIds, { shouldValidate: true })
  }

  const handleSelectSales = () => {
    const salesPermissionIds = permissions
      .filter((p) => salesPermissions.includes(p.name))
      .map((p) => p.id)
    form.setValue('permissionIds', salesPermissionIds, { shouldValidate: true })
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
          <DialogTitle className="text-h2">{title}</DialogTitle>
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
                    <Input
                      placeholder="Ex: Vendedor Sênior"
                      {...field}
                      disabled={role?.is_predefined}
                    />
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
                      disabled={role?.is_predefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissionIds"
              render={() => (
                <FormItem>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <FormLabel>Permissões</FormLabel>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        disabled={role?.is_predefined}
                      >
                        Selecionar Todas
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectSales}
                        disabled={role?.is_predefined}
                      >
                        Selecionar Funções de Vendas
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-64 rounded-md border p-4 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {permissions.map((permission) => (
                        <FormField
                          key={permission.id}
                          control={form.control}
                          name="permissionIds"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission.id)}
                                  disabled={role?.is_predefined}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          permission.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== permission.id,
                                          ),
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {permission.name}
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
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || role?.is_predefined}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
