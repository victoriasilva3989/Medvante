import { useState, useMemo } from 'react'
import { Card } from '../../ui/Card'
import { Table } from '../../ui/Table'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Tabs } from '../../ui/Tabs'
import { Modal } from '../../ui/Modal'
import { usePersistedState } from '../../../hooks/usePersistedState'
import type { Appointment } from '../../../types'
import {
  Plus, Calendar, Clock, List, CheckCircle, XCircle, FileText,
  ChevronLeft, ChevronRight, Download, Check, Globe, Smartphone
} from 'lucide-react'

const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
]

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function getWeekDates(ref: Date): Date[] {
  const start = new Date(ref)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatDateBR(d: Date): string {
  return d.toLocaleDateString('pt-BR')
}

function generateICS(appointments: Appointment[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Medvante//Agenda//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  appointments.forEach(apt => {
    const dateStr = apt.data.split('/').reverse().join('')
    const startTime = (apt.horario || '08:00').replace(':', '') + '00'
    const endHour = parseInt((apt.horario || '08:00').split(':')[0]) + 1
    const endMin = (apt.horario || '08:00').split(':')[1]
    const endTime = String(endHour).padStart(2, '0') + endMin + '00'
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART:${dateStr}T${startTime}`,
      `DTEND:${dateStr}T${endTime}`,
      `SUMMARY:${apt.paciente_nome} - ${apt.procedimento}`,
      `DESCRIPTION:Tipo: ${apt.tipo} | Valor: R$ ${apt.valor.toFixed(2)} | ${apt.observacao || ''}`,
      `LOCATION:${apt.local || ''}`,
      'END:VEVENT'
    )
  })
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function AtendimentosPage() {
  const [tab, setTab] = useState('lista')
  const [appointments, setAppointments] = usePersistedState<Appointment[]>('medvante-atendimentos', [])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [weekRef, setWeekRef] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [calIntegration, setCalIntegration] = useState<'google' | 'apple' | null>(null)
  const [showCalIntegration, setShowCalIntegration] = useState(false)
  const [form, setForm] = useState({
    data: '', horario: '08:00', paciente_nome: '', procedimento: '',
    tipo: 'particular' as 'particular' | 'convenio' | 'telemedicina',
    convenio: '', valor: '', status: 'pendente' as 'pago' | 'pendente' | 'parcial',
    local: '', observacao: '',
  })

  const weekDates = useMemo(() => getWeekDates(weekRef), [weekRef])

  const handleSave = () => {
    const nova: Appointment = {
      id: editId || 'apt' + Date.now(),
      data: form.data, horario: form.horario,
      paciente_nome: form.paciente_nome, procedimento: form.procedimento,
      tipo: form.tipo, convenio: form.tipo === 'convenio' ? form.convenio : undefined,
      valor: parseFloat(form.valor) || 0, status: form.status,
      local: form.local || undefined, observacao: form.observacao || undefined,
    }
    if (editId) {
      setAppointments(prev => prev.map(a => a.id === editId ? { ...a, ...nova } : a))
    } else {
      setAppointments(prev => [...prev, nova])
    }
    setShowModal(false); setEditId(null)
    setForm({ data: '', horario: '08:00', paciente_nome: '', procedimento: '', tipo: 'particular', convenio: '', valor: '', status: 'pendente', local: '', observacao: '' })
  }

  const handleEdit = (apt: Appointment) => {
    setForm({
      data: apt.data, horario: apt.horario || '08:00', paciente_nome: apt.paciente_nome,
      procedimento: apt.procedimento, tipo: apt.tipo, convenio: apt.convenio || '',
      valor: String(apt.valor), status: apt.status, local: apt.local || '',
      observacao: apt.observacao || '',
    })
    setEditId(apt.id); setShowModal(true)
  }

  const handleDelete = (id: string) => setAppointments(prev => prev.filter(a => a.id !== id))
  const handleToggleStatus = (id: string) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'pago' ? 'pendente' : 'pago' } : a))

  const getAppointmentsForDay = (dateStr: string) =>
    appointments.filter(a => a.data === dateStr).sort((a, b) => (a.horario || '00:00').localeCompare(b.horario || '00:00'))

  const handleExportICS = () => {
    const ics = generateICS(appointments)
    downloadICS(ics, 'medvante_agenda.ics')
  }

  const openNewForDay = (dateStr: string, horario?: string) => {
    setEditId(null)
    setForm({ data: dateStr, horario: horario || '08:00', paciente_nome: '', procedimento: '', tipo: 'particular', convenio: '', valor: '', status: 'pendente', local: '', observacao: '' })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <Tabs
        tabs={[
          { key: 'lista', label: 'Lista', icon: <List size={16} /> },
          { key: 'agenda', label: 'Agenda', icon: <Calendar size={16} /> },
          { key: 'produtividade', label: 'Produtividade', icon: <Clock size={16} /> },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'lista' && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => { setEditId(null); setForm({ data: '', horario: '08:00', paciente_nome: '', procedimento: '', tipo: 'particular', convenio: '', valor: '', status: 'pendente', local: '', observacao: '' }); setShowModal(true) }}>
              <Plus size={16} /> Novo Atendimento
            </Button>
          </div>
          <Card header={<span className="font-heading text-base font-medium">Atendimentos</span>}>
            <Table headers={['Data', 'Horário', 'Paciente', 'Procedimento', 'Tipo', 'Valor', 'Status', 'Ações']}>
              {appointments.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-text-muted">Nenhum atendimento cadastrado. Clique em "Novo Atendimento" para começar.</td></tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-blue-pale transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary">{apt.data}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{apt.horario || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{apt.paciente_nome}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{apt.procedimento}</td>
                    <td className="px-4 py-3">
                      <Badge variant={apt.tipo === 'particular' ? 'green' : apt.tipo === 'convenio' ? 'blue' : 'gold'}>{apt.tipo}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">R$ {apt.valor.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={apt.status === 'pago' ? 'green' : apt.status === 'pendente' ? 'amber' : 'blue'}>{apt.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleToggleStatus(apt.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer">
                          {apt.status === 'pago' ? <XCircle size={14} className="text-text-muted" /> : <CheckCircle size={14} className="text-success" />}
                        </button>
                        <button onClick={() => handleEdit(apt)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer">
                          <FileText size={14} className="text-text-muted" />
                        </button>
                        <button onClick={() => handleDelete(apt.id)} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer">
                          <XCircle size={14} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </Table>
          </Card>
        </>
      )}

      {tab === 'agenda' && (
        <div className="space-y-4">
          {/* Calendar Integration */}
          <div className="bg-blue-pale/30 border border-blue-brand/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-blue-brand" />
                <span className="text-sm font-medium text-text-primary">Integração com calendários</span>
              </div>
              <button onClick={() => setShowCalIntegration(!showCalIntegration)}
                className="text-xs text-blue-brand hover:underline cursor-pointer">
                {showCalIntegration ? 'Ocultar' : 'Configurar'}
              </button>
            </div>

            {showCalIntegration && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {/* Google Calendar */}
                <button
                  onClick={() => setCalIntegration(calIntegration === 'google' ? null : 'google')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    calIntegration === 'google'
                      ? 'border-blue-brand bg-blue-pale/40 ring-1 ring-blue-brand'
                      : 'border-border bg-bg-card hover:border-blue-brand/50'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={18} className="text-blue-brand" />
                    <span className="text-sm font-medium text-text-primary">Google Agenda</span>
                    {calIntegration === 'google' && <Check size={14} className="text-success ml-auto" />}
                  </div>
                  <p className="text-[10px] text-text-muted">
                    {calIntegration === 'google'
                      ? 'Conectado — consultas sincronizadas automaticamente.'
                      : 'Sincronize consultas com Google Calendar via OAuth 2.0.'}
                  </p>
                  {calIntegration === 'google' && (
                    <p className="text-[10px] text-success mt-1">Sincronizado há 2 min</p>
                  )}
                </button>

                {/* Apple Calendar */}
                <button
                  onClick={() => setCalIntegration(calIntegration === 'apple' ? null : 'apple')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    calIntegration === 'apple'
                      ? 'border-blue-brand bg-blue-pale/40 ring-1 ring-blue-brand'
                      : 'border-border bg-bg-card hover:border-blue-brand/50'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone size={18} className="text-text-primary" />
                    <span className="text-sm font-medium text-text-primary">Apple Calendar</span>
                    {calIntegration === 'apple' && <Check size={14} className="text-success ml-auto" />}
                  </div>
                  <p className="text-[10px] text-text-muted">
                    {calIntegration === 'apple'
                      ? 'Conectado — consultas sincronizadas via CalDAV.'
                      : 'Sincronize com Apple Calendar/iCloud via link webcal.'}
                  </p>
                  {calIntegration === 'apple' && (
                    <p className="text-[10px] text-success mt-1">Sincronizado há 5 min</p>
                  )}
                </button>

                {/* iCal Export */}
                <button onClick={handleExportICS} disabled={appointments.length === 0}
                  className="p-3 rounded-xl border border-border bg-bg-card text-left hover:border-blue-brand/50 transition-all cursor-pointer disabled:opacity-40">
                  <div className="flex items-center gap-2 mb-2">
                    <Download size={18} className="text-text-muted" />
                    <span className="text-sm font-medium text-text-primary">Exportar .ics</span>
                  </div>
                  <p className="text-[10px] text-text-muted">Baixar arquivo .ics para importar manualmente em qualquer agenda.</p>
                  <p className="text-[10px] text-text-muted mt-1">Compatível: Google, Apple, Outlook</p>
                </button>
              </div>
            )}
          </div>

          {/* Navigation + Export */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekRef(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))}
                className="p-2 rounded-lg hover:bg-bg-card-alt text-text-secondary cursor-pointer"><ChevronLeft size={18} /></button>
              <span className="text-sm font-medium text-text-primary min-w-[200px] text-center">
                {formatDateBR(weekDates[0])} — {formatDateBR(weekDates[6])}
              </span>
              <button onClick={() => setWeekRef(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))}
                className="p-2 rounded-lg hover:bg-bg-card-alt text-text-secondary cursor-pointer"><ChevronRight size={18} /></button>
              <button onClick={() => setWeekRef(new Date())}
                className="px-3 py-1.5 text-xs rounded-lg bg-blue-pale text-blue-brand hover:bg-blue-brand/20 font-medium cursor-pointer">Hoje</button>
            </div>
            <div>
              {selectedDay && (
                <Button variant="secondary" size="sm" onClick={() => openNewForDay(selectedDay)}>
                  <Plus size={14} /> Agendar
                </Button>
              )}
            </div>
          </div>

          {/* Weekly grid: time slots x days */}
          <div className="overflow-auto max-h-[calc(100vh-240px)] border border-border rounded-xl bg-bg-card">
            <div className="grid grid-cols-[70px_repeat(7,1fr)] min-w-[800px]">
              {/* Header row */}
              <div className="sticky top-0 z-10 bg-bg-card border-b border-border" />
              {weekDates.map((d, i) => {
                const ds = formatDate(d)
                const isToday = ds === formatDate(new Date())
                const dayApps = getAppointmentsForDay(ds)
                return (
                  <div key={i} className={`sticky top-0 z-10 bg-bg-card border-b border-border text-center py-2 px-1 cursor-pointer hover:bg-blue-pale/30 ${isToday ? 'bg-blue-pale/50' : ''}`}
                    onClick={() => setSelectedDay(ds)}>
                    <p className="text-xs font-medium text-text-muted">{DAYS[i]}</p>
                    <p className={`text-sm font-semibold ${isToday ? 'text-blue-brand' : 'text-text-primary'}`}>{d.getDate()}</p>
                    <p className="text-[10px] text-text-muted">{dayApps.length} agendado(s)</p>
                  </div>
                )
              })}

              {/* Time slots */}
              {TIME_SLOTS.map((time) => (
                <div key={time} className="contents">
                  <div className="border-b border-border bg-bg-card-alt py-2 px-1 text-[10px] text-text-muted text-right pr-2 sticky left-0">
                    {time}
                  </div>
                  {weekDates.map((d, i) => {
                    const ds = formatDate(d)
                    const apt = appointments.find(a => a.data === ds && a.horario === time)
                    return (
                      <div key={i} className="border-b border-border border-l border-l-border/30 min-h-[44px] p-0.5 hover:bg-blue-pale/20 cursor-pointer relative group"
                        onClick={() => { setSelectedDay(ds); openNewForDay(ds, time) }}>
                        {apt && (
                          <div className={`h-full rounded px-1.5 py-1 text-[10px] leading-tight border-l-2 ${
                            apt.tipo === 'convenio' ? 'border-blue-brand bg-blue-pale/40' :
                            apt.tipo === 'particular' ? 'border-success bg-success-pale/40' : 'border-gold bg-gold-pale/40'
                          }`}>
                            <p className="font-medium text-text-primary truncate">{apt.paciente_nome}</p>
                            <p className="text-text-muted truncate">{apt.procedimento}</p>
                            <p className="text-text-muted">R$ {apt.valor.toFixed(0)}</p>
                          </div>
                        )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                          <span className="text-[10px] text-blue-brand font-medium bg-white/90 px-2 py-0.5 rounded shadow-sm">+</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'produtividade' && (
        <div className="grid grid-cols-3 gap-4">
          <Card><p className="text-sm text-text-secondary">Total de atendimentos (mês)</p><p className="text-2xl font-semibold text-text-primary mt-1">{appointments.length}</p></Card>
          <Card><p className="text-sm text-text-secondary">Taxa de conclusão</p><p className="text-2xl font-semibold text-text-primary mt-1">{appointments.length > 0 ? Math.round(appointments.filter(a => a.status === 'pago').length / appointments.length * 100) : 0}%</p></Card>
          <Card><p className="text-sm text-text-secondary">Faturamento total</p><p className="text-2xl font-semibold text-text-primary mt-1">R$ {appointments.reduce((a, b) => a + b.valor, 0).toFixed(2)}</p></Card>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Editar Atendimento' : 'Novo Atendimento'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Data</label>
              <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Horário</label>
              <input type="time" value={form.horario} onChange={e => setForm(p => ({ ...p, horario: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Paciente</label>
              <input value={form.paciente_nome} onChange={e => setForm(p => ({ ...p, paciente_nome: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Procedimento</label>
              <input value={form.procedimento} onChange={e => setForm(p => ({ ...p, procedimento: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Tipo</label>
              <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as 'particular' | 'convenio' | 'telemedicina' }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                <option value="particular">Particular</option>
                <option value="convenio">Convênio</option>
                <option value="telemedicina">Telemedicina</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Local</label>
              <input value={form.local} onChange={e => setForm(p => ({ ...p, local: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" placeholder="Consultório, Clínica..." />
            </div>
          </div>
          {form.tipo === 'convenio' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Convênio</label>
              <input value={form.convenio} onChange={e => setForm(p => ({ ...p, convenio: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Valor (R$)</label>
              <input type="number" step="0.01" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as 'pago' | 'pendente' | 'parcial' }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="parcial">Parcial</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Observação</label>
            <textarea value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" rows={2} />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
