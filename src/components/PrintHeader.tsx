import { Camera } from 'lucide-react'

export const PrintHeader = () => {
  return (
    <div className="hidden print:block mb-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Camera className="h-12 w-12 text-primary" />
          <span className="text-3xl font-bold">PROJECAM</span>
        </div>
        <div className="text-right text-sm">
          <p>
            <strong>CNPJ:</strong> 37.229.840/0001-30
          </p>
          <p>
            <strong>Telefone:</strong> (16) 99343-7901
          </p>
          <p>
            <strong>Email:</strong> projecamseguranca@gmail.com
          </p>
        </div>
      </div>
    </div>
  )
}
