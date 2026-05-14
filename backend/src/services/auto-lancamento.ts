import { query } from '../db/connection.js'

interface NfeItem {
  codigo: string
  descricao: string
  ncm: string
  cfop: string
  unidade: string
  quantidade: number
  valor_unitario: number
  valor_total: number
}

function extrairItensDoXml(xml: string): NfeItem[] {
  const itens: NfeItem[] = []
  const detRegex = /<det[^>]*>([\s\S]*?)<\/det>/g
  let match

  while ((match = detRegex.exec(xml)) !== null) {
    const det = match[1]

    const cod = det.match(/<cProd>([^<]+)<\/cProd>/)?.[1] || ''
    const desc = det.match(/<xProd>([^<]+)<\/xProd>/)?.[1] || ''
    const ncm = det.match(/<NCM>([^<]+)<\/NCM>/)?.[1] || ''
    const cfop = det.match(/<CFOP>([^<]+)<\/CFOP>/)?.[1] || ''
    const uCom = det.match(/<uCom>([^<]+)<\/uCom>/)?.[1] || 'UN'
    const qCom = parseFloat(det.match(/<qCom>([^<]+)<\/qCom>/)?.[1] || '1')
    const vUnCom = parseFloat(det.match(/<vUnCom>([^<]+)<\/vUnCom>/)?.[1] || '0')
    const vProd = parseFloat(det.match(/<vProd>([^<]+)<\/vProd>/)?.[1] || '0')

    itens.push({
      codigo: cod,
      descricao: desc,
      ncm: ncm,
      cfop: cfop,
      unidade: uCom,
      quantidade: qCom,
      valor_unitario: vUnCom,
      valor_total: vProd,
    })
  }

  return itens
}

export async function processarAutoLancamento(
  empresaId: string,
  chaveAcesso: string
): Promise<void> {
  const nfe = await query(
    'SELECT id, nome_emitente, valor_total, xml FROM nfe_entrada WHERE chave_acesso = $1 AND processado = FALSE',
    [chaveAcesso]
  )

  if (nfe.rows.length === 0) return

  const row = nfe.rows[0]
  const nfeId = row.id
  const fornecedor = row.nome_emitente
  const valorTotal = parseFloat(row.valor_total) || 0
  const xml: string = row.xml || ''

  // 1. Lanca itens no estoque
  const itens = extrairItensDoXml(xml)

  for (const item of itens) {
    const existente = await query(
      'SELECT id, quantidade, valor_unitario FROM estoque WHERE empresa_id = $1 AND codigo = $2 AND descricao = $3',
      [empresaId, item.codigo, item.descricao]
    )

    if (existente.rows.length > 0) {
      const atual = existente.rows[0]
      const qtdAtual = parseFloat(atual.quantidade) || 0
      const vUnitAtual = parseFloat(atual.valor_unitario) || 0
      const novaQtd = qtdAtual + item.quantidade
      const novoVUnit = (qtdAtual * vUnitAtual + item.valor_total) / novaQtd

      await query(
        `UPDATE estoque SET
           quantidade = $1, valor_unitario = $2, valor_total = quantidade * valor_unitario,
           updated_at = NOW()
         WHERE id = $3`,
        [novaQtd.toFixed(4), novoVUnit.toFixed(4), atual.id]
      )
    } else {
      await query(
        `INSERT INTO estoque
           (empresa_id, codigo, descricao, ncm, unidade, quantidade, valor_unitario, valor_total, nfe_origem_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          empresaId, item.codigo, item.descricao, item.ncm,
          item.unidade, item.quantidade.toFixed(4), item.valor_unitario.toFixed(4),
          item.valor_total.toFixed(2), nfeId,
        ]
      )
    }

    // Salva item na nfe_entrada_itens
    await query(
      `INSERT INTO nfe_entrada_itens
         (nfe_id, codigo, descricao, ncm, cfop, unidade, quantidade, valor_unitario, valor_total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT DO NOTHING`,
      [
        nfeId, item.codigo, item.descricao, item.ncm, item.cfop,
        item.unidade, item.quantidade.toFixed(4), item.valor_unitario.toFixed(4),
        item.valor_total.toFixed(2),
      ]
    )
  }

  // 2. Lanca conta a pagar
  const vencimento = new Date()
  vencimento.setDate(vencimento.getDate() + 30)

  await query(
    `INSERT INTO contas_pagar
       (empresa_id, nfe_origem_id, fornecedor, descricao, valor, data_vencimento, status, categoria)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      empresaId, nfeId, fornecedor,
      'NF-e ' + chaveAcesso.slice(-9) + ' - ' + fornecedor,
      valorTotal.toFixed(2),
      vencimento.toISOString().split('T')[0],
      'pendente',
      itens.length > 0 && itens[0].cfop.startsWith('1') ? 'Insumos' : 'Mercadorias',
    ]
  )

  // 3. Marca como processada
  await query(
    "UPDATE nfe_entrada SET processado = TRUE WHERE id = $1",
    [nfeId]
  )
}
