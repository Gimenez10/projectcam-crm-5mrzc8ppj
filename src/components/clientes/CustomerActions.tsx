import { useState } from 'react'
import {
  Printer,
  FileDown,
  Share2,
  Loader2,
  Mail,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { generateCustomerPdf } from '@/services/pdf'
import { Customer } from '@/types'

interface CustomerActionsProps {
  customer: Customer
}

export const CustomerActions = ({ customer }: CustomerActionsProps) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handlePrint = () => {
    window.print()
  }

  const handleGeneratePdf = async (
    action: 'download' | 'whatsapp' | 'email',
  ) => {
    setIsGenerating(true)
    const { signedUrl, error } = await generateCustomerPdf(customer.id)
    setIsGenerating(false)

    if (error || !signedUrl) {
      toast({
        title: 'Erro ao gerar PDF',
        description:
          'Não foi possível gerar o documento. Tente novamente mais tarde.',
        variant: 'destructive',
      })
      return
    }

    const customerName = encodeURIComponent(customer.name)
    const encodedUrl = encodeURIComponent(signedUrl)

    switch (action) {
      case 'download':
        window.open(signedUrl, '_blank')
        break
      case 'whatsapp': {
        const text = encodeURIComponent(
          `Dados do Cliente ${customer.name}: ${signedUrl}`,
        )
        window.open(`https://wa.me/?text=${text}`, '_blank')
        break
      }
      case 'email': {
        const subject = `Dados do Cliente ${customerName}`
        const body = `Em anexo, os dados completos do cliente ${customerName}.\n\nLink para download: ${signedUrl}`
        window.open(
          `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`,
        )
        break
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrint}
        disabled={isGenerating}
      >
        <Printer className="h-4 w-4" />
        <span className="sr-only">Imprimir</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleGeneratePdf('download')}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        <span className="sr-only">Exportar para PDF</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={isGenerating}>
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Compartilhar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleGeneratePdf('whatsapp')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>WhatsApp</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleGeneratePdf('email')}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Email</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
