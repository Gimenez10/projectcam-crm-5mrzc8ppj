import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import puppeteer from 'puppeteer'
import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/admin-client.ts'

// Helper function to generate the HTML content for the PDF
function getHtmlTemplate(customer: any): string {
  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : 'N/A'
  const formatTime = (timeStr: string | null) =>
    timeStr ? timeStr.substring(0, 5) : '--:--'

  const renderSection = (title: string, content: string) => `
    <div class="section">
      <h2>${title}</h2>
      ${content}
    </div>
  `

  const renderGrid = (items: { label: string; value: any }[]) => `
    <div class="grid">
      ${items
        .map(
          (item) => `
        <div class="grid-item">
          <span class="label">${item.label}</span>
          <span class="value">${item.value || 'N/A'}</span>
        </div>
      `,
        )
        .join('')}
    </div>
  `

  const renderTable = (
    headers: string[],
    rows: (string | null)[][],
    title: string,
  ) => {
    if (rows.length === 0)
      return `<div class="section"><h2>${title}</h2><p>Nenhum registro encontrado.</p></div>`
    return `
      <div class="section">
        <h2>${title}</h2>
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>${row.map((cell) => `<td>${cell || 'N/A'}</td>`).join('')}</tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', sans-serif; color: #333; font-size: 10px; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
        .page { padding: 20mm; }
        h1 { font-size: 24px; text-align: center; margin-bottom: 20px; color: #007bff; }
        h2 { font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; margin-bottom: 10px; color: #343a40; }
        .section { margin-bottom: 15px; page-break-inside: avoid; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .grid-item { display: flex; flex-direction: column; background: #f8f9fa; padding: 8px; border-radius: 4px; }
        .label { font-weight: 600; color: #6c757d; margin-bottom: 4px; }
        .value { color: #212529; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #dee2e6; padding: 6px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="page">
        <h1>Relatório do Cliente: ${customer.name}</h1>
        
        ${renderSection(
          'Dados Principais',
          renderGrid([
            { label: 'Razão Social', value: customer.name },
            { label: 'Nome Fantasia', value: customer.trade_name },
            { label: 'CPF/CNPJ', value: customer.cpf_cnpj },
            { label: 'IE/RG', value: customer.ie_rg },
            { label: 'Email', value: customer.email },
            { label: 'Telefone', value: customer.phone },
            { label: 'Ramo', value: customer.line_of_business },
            { label: 'Responsável', value: customer.responsible_name },
            { label: 'Data Cadastro', value: formatDate(customer.created_at) },
          ]),
        )}

        ${renderSection(
          'Endereço',
          renderGrid([
            { label: 'Logradouro', value: customer.address },
            { label: 'Cidade', value: customer.city },
            { label: 'Estado', value: customer.state },
            { label: 'CEP', value: customer.zip_code },
          ]),
        )}

        ${renderTable(
          ['Nome', 'Telefone', 'Função'],
          customer.local_contacts.map((c: any) => [c.name, c.phone, c.role]),
          'Contatos Locais',
        )}

        ${renderTable(
          ['Nome', 'Telefone', 'Relação'],
          customer.emergency_contacts.map((c: any) => [
            c.name,
            c.phone,
            c.relationship,
          ]),
          'Contatos de Emergência',
        )}

        ${renderTable(
          ['Usuário', 'Pergunta', 'Resposta'],
          customer.passwords.map((p: any) => [
            p.username,
            p.question,
            p.answer,
          ]),
          'Senhas e Contra-Senhas',
        )}

        ${renderSection(
          'Informações do Imóvel',
          renderGrid([
            { label: 'Tipo', value: customer.property_type },
            { label: 'Chave Local', value: customer.property_local_key },
            { label: 'Animais', value: customer.property_animals },
            { label: 'Observações', value: customer.property_observations },
          ]),
        )}

        ${renderTable(
          [
            'Dia',
            'Manhã (Abre)',
            'Manhã (Fecha)',
            'Tarde (Abre)',
            'Tarde (Fecha)',
          ],
          customer.operating_hours
            .filter((h: any) => h.is_active)
            .map((h: any) => [
              h.day_of_week,
              formatTime(h.morning_open),
              formatTime(h.morning_close),
              formatTime(h.afternoon_open),
              formatTime(h.afternoon_close),
            ]),
          'Horário de Funcionamento',
        )}

        ${renderSection(
          'Equipamento',
          renderGrid([
            { label: 'Central', value: customer.equipment_central },
            { label: 'Modelo', value: customer.equipment_model },
            { label: 'Versão', value: customer.equipment_version },
            {
              label: 'Compra/Locação',
              value: customer.equipment_purchase_lease,
            },
            { label: 'Teclado', value: customer.equipment_keyboard },
            { label: 'Sirene', value: customer.equipment_siren },
            { label: 'Infra', value: customer.equipment_infra },
            { label: 'Magnético', value: customer.equipment_magnet },
            { label: 'Tel. Central', value: customer.equipment_central_phone },
            {
              label: 'Comunicação',
              value: customer.equipment_communication_ways,
            },
          ]),
        )}

        ${renderSection(
          'Tempo do Sistema',
          renderGrid([
            { label: 'Entrada', value: customer.system_time_entry },
            { label: 'Saída', value: customer.system_time_exit },
            { label: 'Sirene', value: customer.system_time_siren },
            { label: 'Auto Arme', value: customer.system_time_auto_arm },
            { label: 'Intervalo', value: customer.system_time_interval },
            { label: 'Teste', value: customer.system_time_test },
          ]),
        )}
      </div>
    </body>
    </html>
  `
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { customerId } = await req.json()
    if (!customerId) throw new Error('Customer ID is required.')

    const supabaseAdmin = getSupabaseAdmin()

    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select(
        `*, local_contacts:customer_local_contacts(*), emergency_contacts:customer_emergency_contacts(*), passwords:customer_passwords(*), operating_hours:customer_operating_hours(*)`,
      )
      .eq('id', customerId)
      .single()

    if (error) throw error
    if (!customer) throw new Error('Customer not found.')

    const html = getHtmlTemplate(customer)
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()

    const pdfPath = `${customerId}/${new Date().toISOString()}.pdf`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('customer-pdfs')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('customer-pdfs')
      .createSignedUrl(pdfPath, 300) // 5 minutes validity

    if (urlError) throw urlError

    return new Response(JSON.stringify({ signedUrl: urlData.signedUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
