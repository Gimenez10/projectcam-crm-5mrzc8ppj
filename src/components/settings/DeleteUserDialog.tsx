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
import { deleteUser } from '@/services/users'
import { createAuditLog } from '@/services/audit'
import { useAuth } from '@/hooks/use-auth'
import { Profile } from '@/types'

interface DeleteUserDialogProps {
  userToDelete: Profile & { email?: string }
  onUserDeleted: () => void
  children: ReactNode
}

export const DeleteUserDialog = ({
  userToDelete,
  onUserDeleted,
  children,
}: DeleteUserDialogProps) => {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const { user: adminUser, profile: adminProfile } = useAuth()

  const handleDelete = async () => {
    if (!adminUser || !adminProfile) {
      toast({ title: 'Erro de autenticação', variant: 'destructive' })
      return
    }

    setIsDeleting(true)
    const { error } = await deleteUser(userToDelete.id)
    setIsDeleting(false)

    if (error) {
      toast({
        title: 'Erro ao excluir usuário',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Usuário excluído!',
        description: `${userToDelete.full_name} foi removido do sistema.`,
      })
      await createAuditLog({
        actorId: adminUser.id,
        actorName: adminProfile.full_name ?? 'Admin',
        action: 'user:delete',
        targetUserId: userToDelete.id,
        targetUserName: userToDelete.full_name ?? '',
      })
      onUserDeleted()
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
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o
            usuário <strong>{userToDelete.full_name}</strong> e removerá seus
            dados de nossos servidores.
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
