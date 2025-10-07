import { useState, useEffect, useCallback } from 'react'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/services/notifications'
import { getUsersWithEmail } from '@/services/users'
import { getRoles } from '@/services/roles'
import { MultiSelect } from '@/components/ui/multi-select'

const notificationSettingSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  description: z.string(),
  is_enabled: z.boolean(),
  recipients: z.object({
    users: z.array(z.string()),
    roles: z.array(z.string()),
  }),
})

const formSchema = z.object({
  settings: z.array(notificationSettingSchema),
})

type Option = { value: string; label: string }

export const NotificationsTab = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [recipientOptions, setRecipientOptions] = useState<Option[]>([])
  const { toast } = useToast()
  const { user, profile } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { settings: [] },
  })

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'settings',
  })

  const loadInitialData = useCallback(async () => {
    setIsLoading(true)
    const [settings, users, roles] = await Promise.all([
      getNotificationSettings(),
      getUsersWithEmail(),
      getRoles(),
    ])

    const userOptions = users.map((u) => ({
      value: `user:${u.id}`,
      label: `Usuário: ${u.full_name}`,
    }))
    const roleOptions = roles.map((r) => ({
      value: `role:${r.name}`,
      label: `Função: ${r.name}`,
    }))
    setRecipientOptions([...userOptions, ...roleOptions])

    replace(settings)
    setIsLoading(false)
  }, [replace])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user || !profile) return
    setIsSaving(true)
    const settingsToSave = data.settings.map(({ ...rest }) => rest)
    const { error } = await updateNotificationSettings(settingsToSave, {
      id: user.id,
      name: profile.full_name ?? 'Admin',
    })
    setIsSaving(false)

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações de notificação.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Configurações salvas!',
        description: 'Suas preferências de notificação foram atualizadas.',
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Notificação</CardTitle>
            <CardDescription>
              Gerencie quando e para quem as notificações do sistema são
              enviadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {fields.map((field, index) => {
              const currentValues = form.watch(`settings.${index}.recipients`)
              const selectedRecipients = [
                ...(currentValues.users?.map((u) => `user:${u}`) ?? []),
                ...(currentValues.roles?.map((r) => `role:${r}`) ?? []),
              ]

              return (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`settings.${index}.is_enabled`}
                  render={({ field: switchField }) => (
                    <FormItem className="flex flex-col md:flex-row md:items-start md:justify-between rounded-lg border p-4">
                      <div className="space-y-0.5 mb-4 md:mb-0">
                        <FormLabel className="text-base">
                          {field.event_type}
                        </FormLabel>
                        <FormDescription>{field.description}</FormDescription>
                      </div>
                      <div className="flex items-center gap-4 md:w-1/2">
                        <FormControl>
                          <Switch
                            checked={switchField.value}
                            onCheckedChange={switchField.onChange}
                          />
                        </FormControl>
                        {form.watch(`settings.${index}.is_enabled`) && (
                          <Controller
                            control={form.control}
                            name={`settings.${index}.recipients`}
                            render={() => (
                              <MultiSelect
                                options={recipientOptions}
                                selected={selectedRecipients}
                                onChange={(newSelected) => {
                                  const newRecipients = {
                                    users: newSelected
                                      .filter((s) => s.startsWith('user:'))
                                      .map((s) => s.replace('user:', '')),
                                    roles: newSelected
                                      .filter((s) => s.startsWith('role:'))
                                      .map((s) => s.replace('role:', '')),
                                  }
                                  form.setValue(
                                    `settings.${index}.recipients`,
                                    newRecipients,
                                  )
                                }}
                                className="w-full"
                                placeholder="Adicionar destinatários..."
                              />
                            )}
                          />
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              )
            })}
          </CardContent>
        </Card>
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
