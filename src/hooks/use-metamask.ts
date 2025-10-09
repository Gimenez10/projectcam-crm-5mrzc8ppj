import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface EthereumProvider {
  isMetaMask?: boolean
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, handler: (...args: any[]) => void) => void
  removeListener: (event: string, handler: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

export const useMetamask = () => {
  const [account, setAccount] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAccountsChanged = useCallback(
    (accounts: string[]) => {
      if (accounts.length === 0) {
        toast({
          title: 'Wallet Disconnected',
          description: 'Please connect to MetaMask.',
          variant: 'destructive',
        })
        setAccount(null)
        setIsActive(false)
      } else if (accounts[0] !== account) {
        setAccount(accounts[0])
        setIsActive(true)
        toast({
          title: 'Account Switched',
          description: `Connected to ${accounts[0].substring(
            0,
            6,
          )}...${accounts[0].substring(accounts[0].length - 4)}`,
        })
      }
    },
    [account, toast],
  )

  useEffect(() => {
    const { ethereum } = window
    if (ethereum?.isMetaMask) {
      ethereum.on('accountsChanged', handleAccountsChanged)
    }

    return () => {
      if (ethereum?.isMetaMask) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [handleAccountsChanged])

  const connect = async () => {
    setIsLoading(true)
    const { ethereum } = window

    if (!ethereum?.isMetaMask) {
      toast({
        title: 'MetaMask Not Found',
        description:
          'Please install the MetaMask extension to connect your wallet.',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      handleAccountsChanged(accounts)
      toast({
        title: 'Wallet Connected!',
        description: 'You have successfully connected to MetaMask.',
      })
    } catch (error: any) {
      if (error.code === 4001) {
        toast({
          title: 'Connection Rejected',
          description: 'You rejected the connection request in MetaMask.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Connection Failed',
          description: error.message || 'An unknown error occurred.',
          variant: 'destructive',
        })
      }
      setAccount(null)
      setIsActive(false)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setIsActive(false)
    toast({
      title: 'Wallet Disconnected',
      description: 'You have disconnected your wallet.',
    })
  }

  return { account, isActive, isLoading, connect, disconnect }
}
