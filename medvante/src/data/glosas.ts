import type { Glosa } from '../types'

export const mockGlosas: Glosa[] = [
  { id: '1', paciente: 'João Santos', convenio: 'UNIMED', procedimento: 'Eletrocardiograma', valorOriginal: 180, valorGlosado: 45, motivo: 'Cobertura não autorizada', data: '15/03/2024', status: 'aberta', prazoRecurso: '15/04/2024' },
  { id: '2', paciente: 'Roberto Lima', convenio: 'Amil', procedimento: 'Exame de Sangue', valorOriginal: 420, valorGlosado: 120, motivo: 'Prazo de solicitação vencido', data: '10/03/2024', status: 'contestada', prazoRecurso: '10/05/2024' },
  { id: '3', paciente: 'Carla Souza', convenio: 'SulAmérica', procedimento: 'Ressonância', valorOriginal: 1200, valorGlosado: 300, motivo: 'Guia sem autorização', data: '05/03/2024', status: 'reembolsada' },
  { id: '4', paciente: 'Marcos Oliveira', convenio: 'Bradesco Saúde', procedimento: 'Consulta', valorOriginal: 300, valorGlosado: 75, motivo: 'Código de procedimento inválido', data: '01/03/2024', status: 'aberta', prazoRecurso: '01/05/2024' },
  { id: '5', paciente: 'Patrícia Gomes', convenio: 'UNIMED', procedimento: 'Cirurgia', valorOriginal: 3500, valorGlosado: 1500, motivo: 'Cobertura parcial', data: '20/02/2024', status: 'perdida' },
]
