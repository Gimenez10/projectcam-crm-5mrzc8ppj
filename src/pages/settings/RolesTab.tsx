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

// NOTE: Role management is complex and requires a dedicated backend implementation.
// This component is a placeholder for the UI.
const mockRoles = [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Acesso total a todas as funcionalidades do sistema.',
    permissions: 19,
  },
  {
    id: 'role-manager',
    name: 'Gerente de Vendas',
    description: 'Visualiza todas as ordens de serviço e aprova descontos.',
    permissions: 5,
  },
  {
    id: 'role-seller',
    name: 'Vendedor',
    description: 'Cria e gerencia suas próprias ordens de serviço.',
    permissions: 6,
  },
]

export const RolesTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Funções</CardTitle>
        <CardDescription>
          Crie e gerencie as funções de usuário e suas permissões.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <RoleDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Função
            </Button>
          </RoleDialog>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {role.description}
                  </TableCell>
                  <TableCell>{role.permissions}</TableCell>
                  <TableCell className="text-right">
                    {/* <RoleDialog role={role}> */}
                    <Button size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {/* </RoleDialog> */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <RoleDialog role={role}> */}
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        {/* </RoleDialog> */}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
