import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { RoleDialog } from '@/components/settings/RoleDialog'
import { DeleteRoleDialog } from '@/components/settings/DeleteRoleDialog'
import { getRoles } from '@/services/roles'
import { Role } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export const RolesTab = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    const data = await getRoles()
    setRoles(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const renderSkeleton = () => (
    <TableRow>
      <TableCell colSpan={4}>
        <Skeleton className="h-4 w-full" />
      </TableCell>
    </TableRow>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h2">Gerenciamento de Funções</CardTitle>
        <CardDescription>
          Crie e gerencie as funções de usuário e suas permissões.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <RoleDialog onRoleSaved={fetchRoles}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Função
            </Button>
          </RoleDialog>
        </div>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Função</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Descrição
                  </TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => renderSkeleton())
                  : roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{role.name}</span>
                            {role.is_predefined && (
                              <Badge variant="outline">Padrão</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[200px] truncate">
                          {role.description}
                        </TableCell>
                        <TableCell>{role.permissions.length}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <RoleDialog role={role} onRoleSaved={fetchRoles}>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />{' '}
                                  {role.is_predefined ? 'Visualizar' : 'Editar'}
                                </DropdownMenuItem>
                              </RoleDialog>
                              {!role.is_predefined && (
                                <DeleteRoleDialog
                                  roleToDelete={role}
                                  onRoleDeleted={fetchRoles}
                                >
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                  </DropdownMenuItem>
                                </DeleteRoleDialog>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
