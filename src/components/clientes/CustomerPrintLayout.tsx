import { Customer } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CustomerPrintLayoutProps {
  customer: Customer | null
}

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="mb-6 break-inside-avoid">
    <h2 className="text-lg font-semibold border-b pb-2 mb-3">{title}</h2>
    {children}
  </div>
)

const InfoGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
    {children}
  </div>
)

const InfoItem = ({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) => (
  <div>
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="text-sm">{value || 'N/A'}</p>
  </div>
)

export const CustomerPrintLayout = ({ customer }: CustomerPrintLayoutProps) => {
  if (!customer) return null

  const weekDaysMap: { [key: string]: string } = {
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo',
  }

  return (
    <div className="p-4 bg-white text-black">
      <h1 className="text-2xl font-bold text-center mb-8">
        Relatório do Cliente: {customer.name}
      </h1>

      <Section title="Dados Principais">
        <InfoGrid>
          <InfoItem label="Razão Social" value={customer.name} />
          <InfoItem label="Nome Fantasia" value={customer.trade_name} />
          <InfoItem label="CPF/CNPJ" value={customer.cpf_cnpj} />
          <InfoItem label="IE/RG" value={customer.ie_rg} />
          <InfoItem label="Email" value={customer.email} />
          <InfoItem label="Telefone" value={customer.phone} />
          <InfoItem label="Ramo" value={customer.line_of_business} />
          <InfoItem label="Responsável" value={customer.responsible_name} />
          <InfoItem
            label="Data Cadastro"
            value={format(new Date(customer.created_at), 'dd/MM/yyyy', {
              locale: ptBR,
            })}
          />
        </InfoGrid>
      </Section>

      <Section title="Endereço">
        <InfoGrid>
          <InfoItem label="Logradouro" value={customer.address} />
          <InfoItem label="Cidade" value={customer.city} />
          <InfoItem label="Estado" value={customer.state} />
          <InfoItem label="CEP" value={customer.zip_code} />
        </InfoGrid>
      </Section>

      <Section title="Contatos Locais">
        {customer.local_contacts?.length ? (
          customer.local_contacts.map((c, i) => (
            <InfoGrid key={i}>
              <InfoItem label="Nome" value={c.name} />
              <InfoItem label="Telefone" value={c.phone} />
              <InfoItem label="Função" value={c.role} />
            </InfoGrid>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum registro.</p>
        )}
      </Section>

      <Section title="Contatos de Emergência">
        {customer.emergency_contacts?.length ? (
          customer.emergency_contacts.map((c, i) => (
            <InfoGrid key={i}>
              <InfoItem label="Nome" value={c.name} />
              <InfoItem label="Telefone" value={c.phone} />
              <InfoItem label="Relação" value={c.relationship} />
            </InfoGrid>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum registro.</p>
        )}
      </Section>

      <Section title="Senhas e Contra-Senhas">
        {customer.passwords?.length ? (
          customer.passwords.map((p, i) => (
            <InfoGrid key={i}>
              <InfoItem label="Usuário" value={p.username} />
              <InfoItem label="Pergunta" value={p.question} />
              <InfoItem label="Resposta" value={p.answer} />
            </InfoGrid>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum registro.</p>
        )}
      </Section>

      <Section title="Informações do Imóvel">
        <InfoGrid>
          <InfoItem label="Tipo" value={customer.property_type} />
          <InfoItem label="Chave Local" value={customer.property_local_key} />
          <InfoItem label="Animais" value={customer.property_animals} />
          <InfoItem
            label="Observações"
            value={customer.property_observations}
          />
        </InfoGrid>
      </Section>

      <Section title="Horário de Funcionamento">
        {customer.operating_hours?.filter((h) => h.is_active).length ? (
          customer.operating_hours
            .filter((h) => h.is_active)
            .map((h, i) => (
              <div key={i} className="mb-2">
                <strong>{weekDaysMap[h.day_of_week]}:</strong> Manhã (
                {h.morning_open?.substring(0, 5) || '--:--'} -{' '}
                {h.morning_close?.substring(0, 5) || '--:--'}), Tarde (
                {h.afternoon_open?.substring(0, 5) || '--:--'} -{' '}
                {h.afternoon_close?.substring(0, 5) || '--:--'})
              </div>
            ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum registro.</p>
        )}
      </Section>

      <Section title="Equipamento">
        <InfoGrid>
          <InfoItem label="Central" value={customer.equipment_central} />
          <InfoItem label="Modelo" value={customer.equipment_model} />
          <InfoItem label="Versão" value={customer.equipment_version} />
          <InfoItem
            label="Compra/Locação"
            value={customer.equipment_purchase_lease}
          />
          <InfoItem label="Teclado" value={customer.equipment_keyboard} />
          <InfoItem label="Sirene" value={customer.equipment_siren} />
          <InfoItem label="Infra" value={customer.equipment_infra} />
          <InfoItem label="Magnético" value={customer.equipment_magnet} />
          <InfoItem
            label="Tel. Central"
            value={customer.equipment_central_phone}
          />
          <InfoItem
            label="Comunicação"
            value={customer.equipment_communication_ways}
          />
        </InfoGrid>
      </Section>

      <Section title="Tempo do Sistema">
        <InfoGrid>
          <InfoItem label="Entrada" value={customer.system_time_entry} />
          <InfoItem label="Saída" value={customer.system_time_exit} />
          <InfoItem label="Sirene" value={customer.system_time_siren} />
          <InfoItem label="Auto Arme" value={customer.system_time_auto_arm} />
          <InfoItem label="Intervalo" value={customer.system_time_interval} />
          <InfoItem label="Teste" value={customer.system_time_test} />
        </InfoGrid>
      </Section>
    </div>
  )
}
