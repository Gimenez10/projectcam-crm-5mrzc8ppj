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

  const renderGridItem = (label: string) => `
    <div class="grid-item">
      <span class="label">${label}</span>
      <div class="value-line"></div>
    </div>
  `

  const renderGrid = (items: string[], columns = 3) => `
    <div class="grid grid-cols-${columns}">
      ${items.map(renderGridItem).join('')}
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
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
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
              <th class="text-center">Ativo</th>
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
                <td class="text-center"><div class="checkbox"></div></td>
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
        body { font-family: sans-serif; color: #333; font-size: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page { padding: 20mm; }
        h1 { font-size: 24px; text-align: center; margin-bottom: 20px; color: #007bff; }
        h2 { font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; margin-bottom: 10px; color: #343a40; font-weight: 600; }
        .section { margin-bottom: 15px; page-break-inside: avoid; }
        .grid { display: grid; gap: 12px 10px; }
        .grid-cols-1 { grid-template-columns: 1fr; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        .grid-item { display: flex; flex-direction: column; }
        .label { font-weight: 600; color: #6c757d; margin-bottom: 4px; font-size: 9px; text-transform: uppercase; }
        .value-line { border-bottom: 1px solid #ccc; height: 18px; }
        .value-line-short { border-bottom: 1px solid #ccc; height: 18px; }
        .textarea-item { margin-top: 10px; }
        .textarea-box { border: 1px solid #ccc; height: 45px; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #dee2e6; padding: 6px; text-align: left; }
        th { background-color: #f8f9fa !important; font-weight: 600; }
        .checkbox { width: 14px; height: 14px; border: 1px solid #ccc; margin: auto; }
        .text-center { text-align: center; }
      </style>
    </head>
    <body>
      <div class="page">
        <h1>Formulário de Cadastro de Cliente</h1>
        
        ${renderSection(
          'Dados Principais',
          renderGrid(
            [
              'Nome Completo / Razão Social',
              'Nome Fantasia',
              'CPF/CNPJ',
              'IE/RG',
              'E-mail',
              'Telefone',
              'Nome do Responsável',
              'Ramo de Atividade',
            ],
            2,
          ),
        )}

        ${renderSection(
          'Endereço',
          renderGrid(
            ['Endereço (Rua, Número, Bairro)', 'Cidade', 'Estado', 'CEP'],
            2,
          ),
        )}

        ${renderSection(
          'Informações da Propriedade',
          renderGrid(
            ['Tipo de Imóvel', 'Animais na Propriedade', 'Chave do Local'],
            3,
          ) + renderTextarea('Observações da Propriedade'),
        )}

        ${renderTable(['Nome', 'Telefone', 'Função'], 3, 'Contatos Locais')}
        
        ${renderTable(['Nome', 'Telefone', 'Parentesco'], 3, 'Contatos de Emergência')}
        
        ${renderTable(
          ['Usuário / Descrição', 'Pergunta', 'Resposta'],
          3,
          'Senhas e Contra-Senhas',
        )}

        ${renderOperatingHoursTable()}

        ${renderSection(
          'Informações do Equipamento',
          renderGrid(
            [
              'Modelo do Equipamento',
              'Versão do Equipamento',
              'Central do Equipamento',
              'Telefone da Central',
              'Teclado do Equipamento',
              'Sirene do Equipamento',
              'Magnético do Equipamento',
              'Meios de Comunicação do Equipamento',
              'Infraestrutura do Equipamento',
              'Compra/Locação do Equipamento',
            ],
            2,
          ),
        )}

        ${renderSection(
          'Tempos do Sistema',
          renderGrid(
            [
              'Tempo de Entrada',
              'Tempo de Saída',
              'Tempo de Sirene',
              'Arme Automático',
              'Intervalo',
              'Tempo de Teste',
            ],
            3,
          ),
        )}

        ${renderSection(
          'Equipe de Instalação',
          renderGrid(['Equipe de Instalação'], 1),
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

    const pdfPath = `blank-forms/customer-form-${Date.now()}.pdf`
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
    console.error('Error generating blank customer form PDF:', error)
    return new Response(
      JSON.stringify({ error: `Falha ao gerar PDF: ${error.message}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
