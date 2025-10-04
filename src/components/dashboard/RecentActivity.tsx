import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RecentActivity as RecentActivityType } from '@/types'

type RecentActivityProps = {
  activities: RecentActivityType[]
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>
          Últimas atualizações nas ordens de serviço.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback>OS</AvatarFallback>
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
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
