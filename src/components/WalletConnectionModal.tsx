import { useEffect, useState } from 'react'
import { useConnect, useAccount } from '@starknet-react/core'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useGSAP } from '@/hooks/useGSAP'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'

interface WalletConnectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WalletConnectionModal = ({ isOpen, onClose }: WalletConnectionModalProps) => {
  const { connect, connectors } = useConnect()
  const { isConnected } = useAccount()
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)
  const { animatePageEnter } = useGSAP()

  useEffect(() => {
    if (isConnected) {
      onClose()
      setConnectingWallet(null)
    }
  }, [isConnected, onClose])

  const handleConnect = async (connector: any) => {
    try {
      setConnectingWallet(connector.id)
      await connect({ connector })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setConnectingWallet(null)
    }
  }

  const getWalletIcon = (walletName: string) => {
    // Simple wallet identification
    if (walletName.toLowerCase().includes('argent')) {
      return '🦊' // Using emoji as placeholder
    }
    if (walletName.toLowerCase().includes('braavos')) {
      return '🛡️' // Using emoji as placeholder  
    }
    return '👛'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-center text-muted-foreground text-sm">
            Choose a wallet to connect to AInest
          </p>
          
          <div className="space-y-3">
            {connectors.map((connector) => {
              const isConnecting = connectingWallet === connector.id
              
              return (
                <Button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={isConnecting || connectingWallet !== null}
                  className="w-full h-16 flex items-center justify-between px-6 bg-background border border-border hover:bg-accent transition-all duration-200"
                  variant="outline"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 flex items-center justify-center text-2xl">
                      {getWalletIcon(connector.name)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-foreground">
                        {connector.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isConnecting ? 'Connecting...' : 'Available'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {isConnecting ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
          
          {connectors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No wallets detected. Please install ArgentX or Braavos wallet extension.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}