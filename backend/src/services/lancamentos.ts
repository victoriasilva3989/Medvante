import { query } from '../config/database.js'

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
    itens.push({
      codigo: det.match(/<cProd>([^<]+)<\/cProd>/)?.[1] || '',
      descricao: det.match(/<xProd>([^<]+)<\/xProd>/)?.[1] || '',
      ncm: det.match(/<NCM>([^<]+)<\/NCM>/)?.[1] || '',
      cfop: det.match(/<CFOP>([^<]+)<\/CFOP>/)?.[1] || '',
      unidade: det.match(/<uCom>([^<]+)<\/uCom>/)?.[1] || 'UN',
      quantidade: parseFloat(det.match(/<qCom>([^<]+)<\/qCom>/)?.[1] || '1'),
      valor_unitario: parseFloat(det.match(/<vUnCom>([^<]+)<\/vUnCom>/)?.[1] || '0'),
      valor_total: parseFloat(det.match(/<vProd>([^<]+)<\/vProd>/)?.[1] || '0'),
    })
  }

  return itens
}

export async function lancamentoAutomatico(
  nfeId: string,
  tipo: 'entrada' | 'saida'
): Promise<void> {
  const sql = tipo === 'entrada'
    ? 'SELECT id, empresa_id, chave_acesso, cnpj_emitente, nome_emitente, cnpj_destinatario, nome_destinatario, valor_total, xml_completo FROM nfe_entrada WHERE id = $1'
    : 'SELECT id, empresa_id, chave_acesso, cnpj_emitente, nome_emitente, cnpj_destinatario, nome_destinatario, valor_total, xml_completo FROM nfe_saida WHERE id = $1'

  const nfe = await query(sql, [nfeId])

  if (nfe.rows.length === 0) return

  const row = nfe.rows[0]
  const empresaId = row.empresa_id
  const chaveAcesso = row.chave_acesso
  const fornecedor = row.nome_emitente || row.nome_destinatario || ''
  const cnpjFornecedor = row.cnpj_emitente || row.cnpj_destinatario || ''
  const valorTotal = parseFloat(row.valor_total) || 0
  const xml: string = row.xml_completo || ''

  if (tipo === 'entrada') {
    // Já processada
    const check = await query(
      'SELECT id FROM nfe_entrada WHERE id = $1 AND lancado_estoque = true AND lancado_contas_pagar = true',
      [nfeId]
    )
    if (check.rows.length > 0) return
  }

  const itens = extrairItensDoXml(xml)

  for (const item of itens) {
    // Save item to nfe_entrada_itens
    if (tipo === 'entrada') {
      const existente = await query(
        'SELECT id FROM nfe_entrada_itens WHERE nfe_entrada_id = $1 AND numero_item = $2',
        [nfeId, item.codigo]
      )
      if (existente.rows.length === 0) {
        const { rowCount: itemNum } = await query(
          'SELECT COUNT(*) as cnt FROM nfe_entrada_itens WHERE nfe_entrada_id = $1',
          [nfeId]
        )
        const numItem = (itemNum || 0) + 1
        await query(
          `INSERT INTO nfe_entrada_itens
             (nfe_entrada_id, numero_item, codigo_produto, descricao, ncm, cfop, unidade,
              quantidade, valor_unitario, valor_total)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [nfeId, numItem, item.codigo, item.descricao, item.ncm, item.cfop,
           item.unidade, item.quantidade, item.valor_unitario, item.valor_total]
        )
      }
    }

    // Update inventory
    if (tipo === 'entrada') {
      // Entrada: increase inventory, weighted average cost
      const existente = await query(
        `SELECT id, quantidade, custo_medio FROM estoque
         WHERE empresa_id = $1 AND codigo = $2`,
        [empresaId, item.codigo]
      )

      if (existente.rows.length > 0) {
        const atual = existente.rows[0]
        const qtdAtual = parseFloat(atual.quantidade) || 0
        const custoAtual = parseFloat(atual.custo_medio) || 0
        const novaQtd = qtdAtual + item.quantidade
        const novoCusto = (qtdAtual * custoAtual + item.valor_total) / novaQtd

        await query(
          `UPDATE estoque SET quantidade = $1, custo_medio = $2, atualizado_em = NOW()
           WHERE id = $3`,
          [novaQtd, novoCusto.toFixed(4), atual.id]
        )
      } else {
        await query(
          `INSERT INTO estoque
             (empresa_id, codigo, descricao, ncm, unidade, quantidade, custo_medio)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [empresaId, item.codigo, item.descricao, item.ncm,
           item.unidade, item.quantidade, item.valor_unitario]
        )
      }

      // Register movement
      await query(
        `INSERT INTO estoque_movimentacoes
           (estoque_id, empresa_id, tipo, quantidade, custo_unitario, origem, origem_id)
         VALUES ((SELECT id FROM estoque WHERE empresa_id = $1 AND codigo = $2), $3, 'entrada', $4, $5, 'nfe', $6)`,
        [empresaId, item.codigo, empresaId, item.quantidade, item.valor_unitario, nfeId]
      )
    } else {
      // Saida: decrease inventory
      const existente = await query(
        `SELECT id, quantidade FROM estoque
         WHERE empresa_id = $1 AND codigo = $2`,
        [empresaId, item.codigo]
      )

      if (existente.rows.length > 0) {
        const atual = existente.rows[0]
        const novaQtd = Math.max(0, (parseFloat(atual.quantidade) || 0) - item.quantidade)

        await query(
          `UPDATE estoque SET quantidade = $1, atualizado_em = NOW() WHERE id = $2`,
          [novaQtd, atual.id]
        )

        await query(
          `INSERT INTO estoque_movimentacoes
             (estoque_id, empresa_id, tipo, quantidade, custo_unitario, origem, origem_id)
           VALUES ($1, $2, 'saida', $3, $4, 'nfse', $5)`,
          [atual.id, empresaId, item.quantidade, item.valor_unitario, nfeId]
        )
      }
    }
  }

  // Create financial entry
  const vencimento = new Date()
  vencimento.setDate(vencimento.getDate() + 30)

  if (tipo === 'entrada') {
    await query(
      `INSERT INTO contas_pagar
         (empresa_id, fornecedor, cnpj_fornecedor, descricao, valor,
          data_vencimento, status, origem, origem_id, nfe_duplicata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        empresaId, fornecedor, cnpjFornecedor,
        `NF-e ${chaveAcesso} - ${fornecedor}`,
        valorTotal, vencimento.toISOString().split('T')[0],
        'pendente', 'nfe_entrada', nfeId, chaveAcesso.slice(-9),
      ]
    )

    await query(
      `UPDATE nfe_entrada SET lancado_estoque = true, lancado_contas_pagar = true WHERE id = $1`,
      [nfeId]
    )
  } else {
    await query(
      `INSERT INTO contas_receber
         (empresa_id, cliente, cnpj_cliente, descricao, valor,
          data_vencimento, status, origem, origem_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        empresaId, fornecedor, cnpjFornecedor,
        `NF-e ${chaveAcesso} - ${fornecedor}`,
        valorTotal, vencimento.toISOString().split('T')[0],
        'pendente', 'nfe_saida', nfeId,
      ]
    )
  }
}
