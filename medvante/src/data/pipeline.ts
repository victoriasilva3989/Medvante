import type { PipelineCard } from '../types'

export const mockPipeline: PipelineCard[] = [
  { id: '1', paciente: 'Maria da Silva', valor: 350, diasAtraso: 45, procedimento: 'Consulta', etapa: 'nao-contatado' },
  { id: '2', paciente: 'João Santos', valor: 180, diasAtraso: 30, procedimento: 'Eletrocardiograma', etapa: 'nao-contatado' },
  { id: '3', paciente: 'Fernanda Rocha', valor: 350, diasAtraso: 25, procedimento: 'Consulta', etapa: 'contatado' },
  { id: '4', paciente: 'Rafael Torres', valor: 300, diasAtraso: 60, procedimento: 'Consulta', etapa: 'contatado' },
  { id: '5', paciente: 'Roberto Lima', valor: 420, diasAtraso: 15, procedimento: 'Exame', etapa: 'negociacao' },
  { id: '6', paciente: 'Amanda Souza', valor: 1200, diasAtraso: 90, procedimento: 'Procedimento', etapa: 'negociacao' },
  { id: '7', paciente: 'Paulo Ricardo', valor: 250, diasAtraso: 10, procedimento: 'Teleconsulta', etapa: 'acordo' },
  { id: '8', paciente: 'Juliana Martins', valor: 800, diasAtraso: 5, procedimento: 'Exame', etapa: 'acordo' },
  { id: '9', paciente: 'Lucas Pereira', valor: 150, diasAtraso: 3, procedimento: 'Retorno', etapa: 'recuperado' },
  { id: '10', paciente: 'Carla Nunes', valor: 600, diasAtraso: 1, procedimento: 'Consulta', etapa: 'recuperado' },
]
