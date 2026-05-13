import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RegimeTributario = 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei'
export type NotaStatus = 'autorizada' | 'pendente' | 'cancelada' | 'rejeitada'
export type Ambiente = 'producao' | 'homologacao'

export interface NotaFiscalServico {
  id: string
  numero: string
  data: string
  tomador: string
  cpfCnpj: string
  servico: string
  valor: number
  status: NotaStatus
  ambiente: Ambiente
}

export interface NotaFiscalProduto {
  id: string
  numero: string
  data: string
  tomador: string
  cpfCnpj: string
  produto: string
  quantidade: number
  valor: number
  status: NotaStatus
  ambiente: Ambiente
}

const ALIQUOTAS_PADRAO: Record<RegimeTributario, number> = {
  simples_nacional: 8.5,
  lucro_presumido: 11.33,
  lucro_real: 16.5,
  mei: 0,
}

interface FaturamentoState {
  notasServico: NotaFiscalServico[]
  notasProduto: NotaFiscalProduto[]
  aliquota: number
  regimeTributario: RegimeTributario
  ambienteProducao: boolean

  addNotaServico: (nota: NotaFiscalServico) => void
  addNotaProduto: (nota: NotaFiscalProduto) => void
  updateNotaStatus: (id: string, status: NotaStatus, tipo: 'servico' | 'produto') => void
  removeNota: (id: string, tipo: 'servico' | 'produto') => void
  setAliquota: (aliquota: number) => void
  setRegimeTributario: (regime: RegimeTributario) => void
  setAmbienteProducao: (value: boolean) => void

  getNotasServicoMes: (ano: number, mes: number) => NotaFiscalServico[]
  getNotasProdutoMes: (ano: number, mes: number) => NotaFiscalProduto[]
  getFaturamentoBrutoMes: (ano: number, mes: number) => number
  getImpostoRetidoMes: (ano: number, mes: number) => number
  getFaturamentoLiquidoMes: (ano: number, mes: number) => number
  getTotalNotasMes: (ano: number, mes: number) => number
  getFaturamentoPorMes: (meses: number) => { mes: string; bruto: number; liquido: number; imposto: number }[]
}

function isMesAtual(data: string, ano: number, mes: number): boolean {
  const d = new Date(data)
  return d.getFullYear() === ano && d.getMonth() + 1 === mes
}

function getNotasAutorizadas(notas: (NotaFiscalServico | NotaFiscalProduto)[]): (NotaFiscalServico | NotaFiscalProduto)[] {
  return notas.filter(n => n.status === 'autorizada')
}

export const useFaturamentoStore = create<FaturamentoState>()(
  persist(
    (set, get) => ({
      notasServico: [],
      notasProduto: [],
      aliquota: 11.33,
      regimeTributario: 'lucro_presumido',
      ambienteProducao: true,

      addNotaServico: (nota) => set(s => ({ notasServico: [...s.notasServico, nota] })),
      addNotaProduto: (nota) => set(s => ({ notasProduto: [...s.notasProduto, nota] })),

      updateNotaStatus: (id, status, tipo) => set(s => {
        if (tipo === 'servico') {
          return { notasServico: s.notasServico.map(n => n.id === id ? { ...n, status } : n) }
        }
        return { notasProduto: s.notasProduto.map(n => n.id === id ? { ...n, status } : n) }
      }),

      removeNota: (id, tipo) => set(s => {
        if (tipo === 'servico') {
          return { notasServico: s.notasServico.filter(n => n.id !== id) }
        }
        return { notasProduto: s.notasProduto.filter(n => n.id !== id) }
      }),

      setAliquota: (aliquota) => set({ aliquota }),
      setRegimeTributario: (regime) => set({
        regimeTributario: regime,
        aliquota: ALIQUOTAS_PADRAO[regime],
      }),
      setAmbienteProducao: (value) => set({ ambienteProducao: value }),

      getNotasServicoMes: (ano, mes) => {
        return get().notasServico.filter(n => isMesAtual(n.data, ano, mes))
      },
      getNotasProdutoMes: (ano, mes) => {
        return get().notasProduto.filter(n => isMesAtual(n.data, ano, mes))
      },
      getFaturamentoBrutoMes: (ano, mes) => {
        const servico = getNotasAutorizadas(get().getNotasServicoMes(ano, mes))
        const produto = getNotasAutorizadas(get().getNotasProdutoMes(ano, mes))
        const totalServico = servico.reduce((a, b) => a + b.valor, 0)
        const totalProduto = produto.reduce((a, b) => a + b.valor, 0)
        return totalServico + totalProduto
      },
      getImpostoRetidoMes: (ano, mes) => {
        const bruto = get().getFaturamentoBrutoMes(ano, mes)
        return bruto * (get().aliquota / 100)
      },
      getFaturamentoLiquidoMes: (ano, mes) => {
        return get().getFaturamentoBrutoMes(ano, mes) - get().getImpostoRetidoMes(ano, mes)
      },
      getTotalNotasMes: (ano, mes) => {
        return get().getNotasServicoMes(ano, mes).length + get().getNotasProdutoMes(ano, mes).length
      },
      getFaturamentoPorMes: (meses) => {
        const hoje = new Date()
        const resultado: { mes: string; bruto: number; liquido: number; imposto: number }[] = []
        for (let i = meses - 1; i >= 0; i--) {
          const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
          const ano = d.getFullYear()
          const mes = d.getMonth() + 1
          const bruto = get().getFaturamentoBrutoMes(ano, mes)
          const imposto = get().getImpostoRetidoMes(ano, mes)
          const liquido = bruto - imposto
          const nome = d.toLocaleDateString('pt-BR', { month: 'short' })
          resultado.push({ mes: nome, bruto, liquido, imposto })
        }
        return resultado
      },
    }),
    {
      name: 'medvante-faturamento',
    }
  )
)
