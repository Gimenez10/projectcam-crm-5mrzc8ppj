import { useState, useCallback } from 'react'

type ViaCepResponse = {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

type Address = {
  street: string
  city: string
  state: string
}

export const useCep = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAddress = useCallback(
    async (cep: string): Promise<Address | null> => {
      const cleanedCep = cep.replace(/\D/g, '')
      if (cleanedCep.length !== 8) {
        setError('CEP inválido. Deve conter 8 dígitos.')
        return null
      }

      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanedCep}/json/`,
        )
        if (!response.ok) {
          throw new Error('Não foi possível buscar o CEP.')
        }
        const data: ViaCepResponse = await response.json()

        if (data.erro) {
          throw new Error('CEP não encontrado.')
        }

        return {
          street: data.logradouro,
          city: data.localidade,
          state: data.uf,
        }
      } catch (e: any) {
        setError(e.message || 'Ocorreu um erro ao buscar o CEP.')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  return { fetchAddress, isLoading, error }
}
