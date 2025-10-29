import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileTab } from './ProfileTab'
import { UsersTab } from './UsersTab'
import { RolesTab } from './RolesTab'
import { AuditLogTab } from './AuditLogTab'
import { NotificationsTab } from './NotificationsTab'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <div>
        <h1 className="text-h1">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta, perfil e usuários.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="grid w-full grid-cols-5 min-w-[600px]">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="roles">Funções</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="audit">Log de Auditoria</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <TabsContent value="profile" className="mt-6">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <UsersTab />
        </TabsContent>
        <TabsContent value="roles" className="mt-6">
          <RolesTab />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="audit" className="mt-6">
          <AuditLogTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
