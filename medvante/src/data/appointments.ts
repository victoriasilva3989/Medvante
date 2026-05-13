import type { Appointment } from '../types'

export const mockAppointments: Appointment[] = [
  { id: '1', data: '15/03/2024', paciente_nome: 'Maria da Silva', procedimento: 'Consulta', tipo: 'particular', valor: 350, status: 'pago', local: 'Consultório Centro' },
  { id: '2', data: '15/03/2024', paciente_nome: 'João Santos', procedimento: 'Eletrocardiograma', tipo: 'convenio', convenio: 'UNIMED', valor: 180, status: 'pendente' },
  { id: '3', data: '16/03/2024', paciente_nome: 'Ana Costa', procedimento: 'Retorno', tipo: 'convenio', convenio: 'SulAmérica', valor: 200, status: 'pago' },
  { id: '4', data: '16/03/2024', paciente_nome: 'Pedro Alves', procedimento: 'Consulta', tipo: 'particular', valor: 350, status: 'pago' },
  { id: '5', data: '17/03/2024', paciente_nome: 'Lucia Oliveira', procedimento: 'Teleconsulta', tipo: 'telemedicina', valor: 250, status: 'pago' },
  { id: '6', data: '17/03/2024', paciente_nome: 'Roberto Lima', procedimento: 'Exame', tipo: 'convenio', convenio: 'Amil', valor: 420, status: 'parcial' },
  { id: '7', data: '18/03/2024', paciente_nome: 'Fernanda Rocha', procedimento: 'Consulta', tipo: 'particular', valor: 350, status: 'pendente' },
  { id: '8', data: '18/03/2024', paciente_nome: 'Carlos Eduardo', procedimento: 'Procedimento', tipo: 'convenio', convenio: 'Bradesco Saúde', valor: 850, status: 'pago' },
  { id: '9', data: '19/03/2024', paciente_nome: 'Marina Gomes', procedimento: 'Retorno', tipo: 'particular', valor: 200, status: 'pago' },
  { id: '10', data: '19/03/2024', paciente_nome: 'Rafael Torres', procedimento: 'Consulta', tipo: 'convenio', convenio: 'UNIMED', valor: 300, status: 'pendente' },
]
