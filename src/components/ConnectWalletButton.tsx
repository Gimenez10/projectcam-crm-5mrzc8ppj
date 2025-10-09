import { useMetamask } from '@/hooks/use-metamask'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export const ConnectWalletButton = () => {
  const { account, isActive, isLoading, connect } = useMetamask()

  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4,
    )}`
  }

  if (isActive && account) {
    return (
      <Button variant="outline" disabled>
        <Wallet className="mr-2 h-4 w-4" />
        {truncateAddress(account)}
      </Button>
    )
  }

  return (
    <Button onClick={connect} disabled={isLoading}>
      {isLoading ? (
        'Connecting...'
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}
