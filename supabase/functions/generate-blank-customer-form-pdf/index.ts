import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import puppeteer from 'puppeteer'
import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/admin-client.ts'

function getBlankHtmlTemplate(): string {
  const renderSection = (title: string, content: string) => `
    <div class="section">
      <h2>${title}</h2>
      ${content}
    </div>
  `

  const renderGrid = (items: { label: string }[], columns = 3) => `
    <div class="grid grid-cols-${columns}">
      ${items
        .map(
          (item) => `
        <div class="grid-item">
          <span class="label">${item.label}</span>
          <div class="value-line"></div>
        </div>
      `,
        )
        .join('')}
    </div>
  `

  const renderTextarea = (label: string) => `
    <div class="textarea-item">
      <span class="label">${label}</span>
      <div class="textarea-box"></div>
    </div>
  `

  const renderTable = (headers: string[], rowCount: number, title: string) => `
    <div class="section">
      <h2>${title}</h2>
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${Array.from(
            { length: rowCount },
            () => `
            <tr>${headers.map(() => `<td><div class="value-line-short"></div></td>`).join('')}</tr>
          `,
          ).join('')}
        </tbody>
      </table>
    </div>
  `

  const renderOperatingHoursTable = () => {
    const days = [
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
      'Domingo',
    ]
    return `
      <div class="section">
        <h2>Horário de Funcionamento</h2>
        <table>
          <thead>
            <tr>
              <th>Dia da Semana</th>
              <th>Ativo</th>
              <th>Manhã (Abertura)</th>
              <th>Manhã (Fechamento)</th>
              <th>Tarde (Abertura)</th>
              <th>Tarde (Fechamento)</th>
            </tr>
          </thead>
          <tbody>
            ${days
              .map(
                (day) => `
              <tr>
                <td>${day}</td>
                <td><div class="checkbox"></div></td>
                <td><div class="value-line-short"></div></td>
                <td><div class="value-line-short"></div></td>
                <td><div class="value-line-short"></div></td>
                <td><div class="value-line-short"></div></td>
              </tr>
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
        body { font-family: 'Inter', sans-serif; color: #333; font-size: 9px; }
        .page { padding: 15mm; }
        h1 { font-size: 22px; text-align: center; margin-bottom: 20px; color: #007bff; }
        h2 { font-size: 13px; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-top: 15px; margin-bottom: 8px; color: #343a40; font-weight: 600; }
        .section { margin-bottom: 12px; page-break-inside: avoid; }
        .grid { display: grid; gap: 8px; }
        .grid-cols-1 { grid-template-columns: 1fr; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        .grid-item { display: flex; flex-direction: column; }
        .label { font-weight: 600; color: #6c757d; margin-bottom: 3px; font-size: 8px; }
        .value-line { border-bottom: 1px solid #ccc; height: 12px; }
        .value-line-short { border-bottom: 1px solid #ccc; height: 12px; margin-top: 4px; }
        .textarea-item { margin-top: 8px; }
        .textarea-box { border: 1px solid #ccc; height: 40px; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #dee2e6; padding: 5px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: 600; }
        .checkbox { width: 12px; height: 12px; border: 1px solid #ccc; margin: auto; }
      </style>
    </head>
    <body>
      <div class="page">
        <h1>Formulário de Cadastro de Cliente</h1>
        
        ${renderSection(
          'Dados Principais',
          renderGrid([
            { label: 'Nome Completo / Razão Social' },
            { label: 'Nome Fantasia' },
            { label: 'CPF/CNPJ' },
            { label: 'IE/RG' },
            { label: 'E-mail' },
            { label: 'Telefone' },
            { label: 'Nome do Responsável' },
            { label: 'Ramo de Atividade' },
          ]),
        )}

        ${renderSection(
          'Endereço',
          renderGrid(
            [
              { label: 'Endereço (Rua, Número, Bairro)' },
              { label: 'Cidade' },
              { label: 'Estado' },
              { label: 'CEP' },
            ],
            4,
          ),
        )}

        ${renderSection(
          'Informações da Propriedade',
          renderGrid([
            { label: 'Tipo de Propriedade' },
            { label: 'Animais na Propriedade' },
            { label: 'Chave do Local' },
          ]) + renderTextarea('Observações da Propriedade'),
        )}

        ${renderTable(['Nome', 'Telefone', 'Função'], 3, 'Contatos Locais')}
        ${renderTable(
          ['Nome', 'Telefone', 'Parentesco'],
          3,
          'Contatos de Emergência',
        )}
        ${renderTable(
          ['Usuário', 'Pergunta de Segurança', 'Resposta'],
          3,
          'Senhas do Cliente',
        )}

        ${renderOperatingHoursTable()}

        ${renderSection(
          'Informações do Equipamento',
          renderGrid(
            [
              { label: 'Modelo do Equipamento' },
              { label: 'Versão do Equipamento' },
              { label: 'Central do Equipamento' },
              { label: 'Telefone da Central' },
              { label: 'Teclado' },
              { label: 'Sirene' },
              { label: 'Ímã' },
              { label: 'Meios de Comunicação' },
              { label: 'Infraestrutura' },
              { label: 'Compra/Locação' },
            ],
            2,
          ),
        )}

        ${renderSection(
          'Tempos do Sistema',
          renderGrid(
            [
              { label: 'Tempo de Entrada' },
              { label: 'Tempo de Saída' },
              { label: 'Tempo da Sirene' },
              { label: 'Tempo de Arme Automático' },
              { label: 'Intervalo de Tempo' },
              { label: 'Tempo de Teste' },
            ],
            3,
          ),
        )}

        ${renderSection(
          'Equipe de Instalação',
          renderGrid([{ label: 'Equipe de Instalação' }], 1),
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
    const supabaseAdmin = getSupabaseAdmin()
    const html = getBlankHtmlTemplate()

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()

    const pdfPath = `blank-forms/customer-form-${new Date().toISOString()}.pdf`
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
