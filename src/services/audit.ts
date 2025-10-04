import { supabase } from '@/lib/supabase/client'

type AuditLogPayload = {
  actorId: string
  actorName: string
  action: string
  targetUserId?: string
  targetUserName?: string
  details?: Record<string, any>
}

export const createAuditLog = async (payload: AuditLogPayload) => {
  const { error } = await supabase.from('audit_logs').insert({
    actor_id: payload.actorId,
    actor_name: payload.actorName,
    action: payload.action,
    target_user_id: payload.targetUserId,
    target_user_name: payload.targetUserName,
    details: payload.details,
  })

  if (error) {
    console.error('Error creating audit log:', error)
  }

  return { error }
}
