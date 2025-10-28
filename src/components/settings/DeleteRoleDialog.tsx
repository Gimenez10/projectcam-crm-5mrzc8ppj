import { useState, ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { deleteRole } from '@/services/roles'
import { useAuth } from '@/hooks/use-auth'
import { Role } from '@/types'

interface DeleteRoleDialogProps {
  roleToDelete: Role
  onRoleDeleted: () => void
  children: ReactNode
}

export const DeleteRoleDialog = ({
  roleToDelete,
  onRoleDeleted,
  children,
}: DeleteRoleDialogProps) => {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const { user: adminUser, profile: adminProfile } = useAuth()

  const handleDelete = async () => {
    if (!adminUser || !adminProfile) {
      toast({ title: 'Erro de autenticação', variant: 'destructive' })
      return
    }

    if (roleToDelete.is_predefined) {
      toast({
        title: 'Ação não permitida',
        description: 'Funções predefinidas não podem ser excluídas.',
        variant: 'destructive',
      })
      return
    }

    setIsDeleting(true)
    const { error } = await deleteRole(roleToDelete, {
      id: adminUser.id,
      name: adminProfile.full_name ?? 'Admin',
    })
    setIsDeleting(false)

    if (error) {
      toast({
        title: 'Erro ao excluir função',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Função excluída!',
        description: `A função ${roleToDelete.name} foi removida do sistema.`,
      })
      onRoleDeleted()
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-h2">Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a
            função <strong>{roleToDelete.name}</strong>. Os usuários com esta
            função precisarão ter uma nova função atribuída.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
