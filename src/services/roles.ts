import { supabase } from '@/lib/supabase/client'
import { Role, Permission } from '@/types'
import { createAuditLog } from './audit'
import { useAuth } from '@/hooks/use-auth'

export const getRoles = async (): Promise<Role[]> => {
  const { data, error } = await supabase
    .from('roles')
    .select('*, permissions:role_permissions(permission_id)')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching roles:', error)
    return []
  }
  return data.map((r) => ({
    ...r,
    permissions: r.permissions.map((p: any) => p.permission_id),
  })) as Role[]
}

export const getPermissions = async (): Promise<Permission[]> => {
  const { data, error } = await supabase.from('permissions').select('*')
  if (error) {
    console.error('Error fetching permissions:', error)
    return []
  }
  return data as Permission[]
}

type RolePayload = {
  name: string
  description?: string
  permissionIds: string[]
}

export const createRole = async (
  payload: RolePayload,
  actor: { id: string; name: string },
) => {
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .insert({ name: payload.name, description: payload.description })
    .select()
    .single()

  if (roleError) return { data: null, error: roleError }

  const roleId = roleData.id
  const rolePermissions = payload.permissionIds.map((permissionId) => ({
    role_id: roleId,
    permission_id: permissionId,
  }))

  const { error: permissionsError } = await supabase
    .from('role_permissions')
    .insert(rolePermissions)

  if (permissionsError) {
    await supabase.from('roles').delete().eq('id', roleId)
    return { data: null, error: permissionsError }
  }

  await createAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    action: 'role:create',
    details: { name: payload.name, permissions: payload.permissionIds },
  })

  return { data: roleData, error: null }
}

export const updateRole = async (
  roleId: string,
  payload: RolePayload,
  actor: { id: string; name: string },
) => {
  const { error: roleError } = await supabase
    .from('roles')
    .update({ name: payload.name, description: payload.description })
    .eq('id', roleId)

  if (roleError) return { error: roleError }

  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId)
  if (deleteError) return { error: deleteError }

  const rolePermissions = payload.permissionIds.map((permissionId) => ({
    role_id: roleId,
    permission_id: permissionId,
  }))

  const { error: insertError } = await supabase
    .from('role_permissions')
    .insert(rolePermissions)
  if (insertError) return { error: insertError }

  await createAuditLog({
    actorId: actor.id,
    actorName: actor.name,
    action: 'role:update',
    details: { roleId, name: payload.name, permissions: payload.permissionIds },
  })

  return { error: null }
}

export const deleteRole = async (
  role: Role,
  actor: { id: string; name: string },
) => {
  const { error } = await supabase.from('roles').delete().eq('id', role.id)

  if (!error) {
    await createAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      action: 'role:delete',
      details: { roleId: role.id, name: role.name },
    })
  }

  return { error }
}
