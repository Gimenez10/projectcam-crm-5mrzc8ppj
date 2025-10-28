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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Profile, Role } from '@/types'
import { useToast } from '../ui/use-toast'
import { updateUserProfile } from '@/services/users'
import { createAuditLog } from '@/services/audit'
import { useAuth } from '@/hooks/use-auth'
import { getRoles } from '@/services/roles'

const formSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  role_id: z.string(),
})

type EditUserDialogProps = {
  children: ReactNode
  user: Profile & { email?: string }
  onUserUpdated: () => void
}

export const EditUserDialog = ({
  children,
  user,
  onUserUpdated,
}: EditUserDialogProps) => {
  const [open, setOpen] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const { toast } = useToast()
  const { user: adminUser, profile: adminProfile } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user.full_name ?? '',
      email: user.email ?? '',
      avatar_url: user.avatar_url ?? '',
      role_id: user.role_id ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      getRoles().then(setRoles)
      form.reset({
        full_name: user.full_name ?? '',
        email: user.email ?? '',
        avatar_url: user.avatar_url ?? '',
        role_id: user.role_id ?? '',
      })
    }
  }, [user, form, open])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!adminUser || !adminProfile) {
      toast({ title: 'Erro de autenticação', variant: 'destructive' })
      return
    }

    const changes: Record<string, { before: any; after: any }> = {}
    if (values.full_name !== user.full_name)
      changes.full_name = { before: user.full_name, after: values.full_name }
    if (values.avatar_url !== user.avatar_url)
      changes.avatar_url = { before: user.avatar_url, after: values.avatar_url }
    if (values.role_id !== user.role_id) {
      const oldRole = roles.find((r) => r.id === user.role_id)?.name
      const newRole = roles.find((r) => r.id === values.role_id)?.name
      changes.role = { before: oldRole, after: newRole }
    }

    const { error } = await updateUserProfile(user.id, values)

    if (error) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Usuário atualizado!',
        description: `O perfil de ${values.full_name} foi atualizado.`,
      })
      if (Object.keys(changes).length > 0) {
        await createAuditLog({
          actorId: adminUser.id,
          actorName: adminProfile.full_name ?? 'Admin',
          action: 'user:update',
          targetUserId: user.id,
          targetUserName: values.full_name,
          details: changes,
        })
      }
      onUserUpdated()
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-h2">Editar Usuário</DialogTitle>
          <DialogDescription>
            Faça alterações no perfil do usuário aqui. Clique em salvar quando
            terminar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                      placeholder="john.doe@example.com"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Avatar</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/avatar.png"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
