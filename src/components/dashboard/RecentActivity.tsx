import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RecentActivity as RecentActivityType } from '@/types'
import { getInitials } from '@/lib/utils'

type RecentActivityProps = {
  activities: RecentActivityType[]
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Atividade Recente</CardTitle>
        <CardDescription>
          Últimas Atualizações nas Ordens de Serviço.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={activity.salesperson?.avatar_url || undefined}
                alt={activity.salesperson?.full_name ?? 'Avatar'}
              />
              <AvatarFallback>
                {getInitials(activity.salesperson?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                <Link
                  to={`/ordens-de-servico/editar/${activity.serviceOrderId}`}
                  className="hover:underline"
                >
                  {activity.description}
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                {activity.timestamp} por{' '}
                <strong>{activity.salesperson?.full_name || 'Sistema'}</strong>
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
