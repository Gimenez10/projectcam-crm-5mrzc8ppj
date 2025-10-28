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
import { useToast } from '@/components/ui/use-toast'
import { CustomerPassword } from '@/types'
import { updateCustomerPassword } from '@/services/customers'

const formSchema = z.object({
  username: z.string().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
})

interface EditPasswordDialogProps {
  password: CustomerPassword
  onPasswordUpdated: () => void
  children: ReactNode
}

export const EditPasswordDialog = ({
  password,
  onPasswordUpdated,
  children,
}: EditPasswordDialogProps) => {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: password.username || '',
      question: password.question || '',
      answer: password.answer || '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        username: password.username || '',
        question: password.question || '',
        answer: password.answer || '',
      })
    }
  }, [open, password, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!password.id) {
      toast({
        title: 'Erro',
        description: 'ID da senha não encontrado.',
        variant: 'destructive',
      })
      return
    }
    setIsSaving(true)
    const { error } = await updateCustomerPassword(password.id, values)
    setIsSaving(false)

    if (error) {
      toast({
        title: 'Erro ao atualizar senha',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Senha atualizada!',
        description: 'A entrada de senha foi atualizada com sucesso.',
      })
      onPasswordUpdated()
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Senha / Contra-Senha</DialogTitle>
          <DialogDescription>
            Faça alterações nos detalhes abaixo e clique em salvar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Input placeholder="Usuário associado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pergunta</FormLabel>
                  <FormControl>
                    <Input placeholder="Pergunta secreta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resposta</FormLabel>
                  <FormControl>
                    <Input placeholder="Resposta secreta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
