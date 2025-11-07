import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Customer } from '@/types'

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

interface SyncContextType {
  isOffline: boolean
  syncStatus: SyncStatus
  queue: Customer[]
  addToQueue: (customer: Customer) => Promise<void>
  forceSync: () => Promise<void>
}

const SyncContext = createContext<SyncContextType | undefined>(undefined)

export const useSync = () => {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider')
  }
  return context
}

const OFFLINE_QUEUE_KEY = 'offline-customer-queue'

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const isOnline = useOnlineStatus()
  const [isOffline, setIsOffline] = useState(!isOnline)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [queue, setQueue] = useState<Customer[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setIsOffline(!isOnline)
    const storedQueue = localStorage.getItem(OFFLINE_QUEUE_KEY)
    if (storedQueue) {
      setQueue(JSON.parse(storedQueue))
    }
  }, [isOnline])

  const processQueue = useCallback(async () => {
    if (queue.length === 0 || !isOnline) return

    setSyncStatus('syncing')
    toast({
      title: 'Sincronizando dados...',
      description: `${queue.length} cliente(s) na fila para sincronizar.`,
    })

    const syncPromises = queue.map(async (customer) => {
      const { id, created_at, created_by, ...upsertData } = customer
      // Simple last-write-wins: if ID exists, update; otherwise, insert.
      const { error } = await supabase.from('customers').upsert(upsertData)
      if (error) {
        console.error('Sync error for customer:', customer.name, error)
        return { customer, error }
      }
      return { customer, error: null }
    })

    const results = await Promise.all(syncPromises)
    const failedSyncs = results.filter((r) => r.error)
    const successfulSyncs = results.filter((r) => !r.error)

    if (failedSyncs.length > 0) {
      setSyncStatus('error')
      toast({
        title: 'Falha na sincronização',
        description: `${failedSyncs.length} cliente(s) não puderam ser sincronizados. Eles permanecerão na fila.`,
        variant: 'destructive',
      })
      const remainingQueue = failedSyncs.map((f) => f.customer)
      setQueue(remainingQueue)
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue))
    } else {
      setSyncStatus('success')
      toast({
        title: 'Sincronização Concluída!',
        description: `${successfulSyncs.length} cliente(s) foram sincronizados com sucesso.`,
      })
      setQueue([])
      localStorage.removeItem(OFFLINE_QUEUE_KEY)
    }
  }, [queue, isOnline, toast])

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue()
    }
  }, [isOnline, queue.length, processQueue])

  const addToQueue = async (customer: Customer) => {
    const newQueue = [...queue, customer]
    setQueue(newQueue)
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue))
    toast({
      title: 'Operando Offline',
      description:
        'O cliente foi salvo localmente e será sincronizado quando a conexão for restaurada.',
    })
  }

  const forceSync = async () => {
    if (isOnline) {
      await processQueue()
    } else {
      toast({
        title: 'Você está offline',
        description: 'Não é possível forçar a sincronização sem conexão.',
        variant: 'destructive',
      })
    }
  }

  const value = {
    isOffline,
    syncStatus,
    queue,
    addToQueue,
    forceSync,
  }

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}
