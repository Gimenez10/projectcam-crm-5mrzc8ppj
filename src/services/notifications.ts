import { supabase } from '@/lib/supabase/client'
import { NotificationSetting } from '@/types'
import { createAuditLog } from './audit'

export const getNotificationSettings = async (): Promise<
  NotificationSetting[]
> => {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .order('event_type')

  if (error) {
    console.error('Error fetching notification settings:', error)
    return []
  }
  return data as NotificationSetting[]
}

export const updateNotificationSettings = async (
  settings: Omit<NotificationSetting, 'created_at' | 'updated_at'>[],
  actor: { id: string; name: string },
) => {
  const { data, error } = await supabase
    .from('notification_settings')
    .upsert(settings)
    .select()

  if (!error) {
    await createAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      action: 'notification_settings:update',
      details: { settings_updated: settings.length },
    })
  } else {
    console.error('Error updating notification settings:', error)
  }

  return { data, error }
}
