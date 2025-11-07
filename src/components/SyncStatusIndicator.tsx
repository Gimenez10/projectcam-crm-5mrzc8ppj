import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useSync } from '@/context/SyncContext'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export const SyncStatusIndicator = () => {
  const { isOffline, syncStatus, queue, forceSync } = useSync()

  const getStatusInfo = () => {
    if (isOffline) {
      return {
        icon: <WifiOff className="h-4 w-4 text-destructive" />,
        text: `Offline (${queue.length} na fila)`,
        tooltip:
          'Você está offline. As alterações estão sendo salvas localmente.',
        className: 'text-destructive',
      }
    }
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin text-primary" />,
          text: 'Sincronizando...',
          tooltip: 'Sincronizando dados com o servidor.',
          className: 'text-primary',
        }
      case 'success':
        return {
          icon: <CheckCircle className="h-4 w-4 text-success" />,
          text: 'Sincronizado',
          tooltip: 'Todos os dados estão sincronizados.',
          className: 'text-success',
        }
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-destructive" />,
          text: `Erro (${queue.length} na fila)`,
          tooltip: 'Ocorreu um erro na sincronização.',
          className: 'text-destructive',
        }
      default:
        return {
          icon: <Wifi className="h-4 w-4 text-success" />,
          text: 'Online',
          tooltip: 'Conectado e sincronizado.',
          className: 'text-success',
        }
    }
  }

  const { icon, text, tooltip, className } = getStatusInfo()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('flex items-center gap-2', className)}
            onClick={forceSync}
            disabled={syncStatus === 'syncing' || isOffline}
          >
            {icon}
            <span className="hidden sm:inline">{text}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
