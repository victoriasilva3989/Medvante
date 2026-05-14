import { useState } from 'react'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Tabs } from '../../ui/Tabs'
import { Modal } from '../../ui/Modal'
import { PaywallGate } from '../../trial/PaywallGate'
import { useProntuarioStore } from '../../../store/prontuarioStore'
import { useAuthStore } from '../../../store/authStore'
import type { Patient, MedicalRecord, TreatmentProtocol, TreatmentSession } from '../../../types'
import { Search, Plus, Pencil, User, FileText, Activity, Pill, Calendar, Clock, CheckCircle } from 'lucide-react'

export function ProntuarioPage() {
  const { user } = useAuthStore()
  const { patients, records, protocols, sessions, prescriptions, addPatient, updatePatient, addRecord, signRecord, addProtocol, updateProtocol, addSession, updateSession, addPrescription, signPrescription } = useProntuarioStore()
  const [tab, setTab] = useState('pacientes')
  const [search, setSearch] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showProtocolModal, setShowProtocolModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [editPatientId, setEditPatientId] = useState<string | null>(null)
  const [editProtocolId, setEditProtocolId] = useState<string | null>(null)

  const [patientForm, setPatientForm] = useState({ nome: '', cpf: '', telefone: '', email: '', dataNascimento: '', convenio: '', observacoes: '' })
  const [recordForm, setRecordForm] = useState({ tipo: 'consulta' as MedicalRecord['tipo'], anamnese: '', diagnostico: '', prescricao: '', exames: '', observacoes: '' })
  const [protocolForm, setProtocolForm] = useState({ nome: '', descricao: '', sessoesTotal: '', valorPorSessao: '', observacoes: '' })
  const [sessionForm, setSessionForm] = useState({ data: '', horario: '', procedimento: '', valor: '', observacoes: '', protocoloId: '' })
  const [prescriptionForm, setPrescriptionForm] = useState({ medicamento: '', dosagem: '', quantidade: '', observacao: '' })
  const [prescriptionsList, setPrescriptionsList] = useState<{ nome: string; dosagem: string; quantidade: string; observacao?: string }[]>([])

  const filteredPatients = patients.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.cpf || '').includes(search)
  )

  const selectedPatient = patients.find(p => p.id === selectedPatientId)
  const patientRecords = selectedPatientId ? records.filter(r => r.pacienteId === selectedPatientId) : []
  const patientProtocols = selectedPatientId ? protocols.filter(p => p.pacienteId === selectedPatientId) : []

  const resetPatientForm = () => setPatientForm({ nome: '', cpf: '', telefone: '', email: '', dataNascimento: '', convenio: '', observacoes: '' })

  const handleSavePatient = () => {
    if (!patientForm.nome) return
    const patient: Patient = {
      id: editPatientId || 'pat-' + Date.now(),
      nome: patientForm.nome,
      cpf: patientForm.cpf || undefined,
      telefone: patientForm.telefone || undefined,
      email: patientForm.email || undefined,
      dataNascimento: patientForm.dataNascimento || undefined,
      convenio: patientForm.convenio || undefined,
      observacoes: patientForm.observacoes || undefined,
    }
    if (editPatientId) {
      updatePatient(editPatientId, patient)
    } else {
      addPatient(patient)
    }
    setShowPatientModal(false)
    setEditPatientId(null)
    resetPatientForm()
  }

  const handleEditPatient = (p: Patient) => {
    setPatientForm({ nome: p.nome, cpf: p.cpf || '', telefone: p.telefone || '', email: p.email || '', dataNascimento: p.dataNascimento || '', convenio: p.convenio || '', observacoes: p.observacoes || '' })
    setEditPatientId(p.id)
    setShowPatientModal(true)
  }

  const handleAddRecord = () => {
    if (!selectedPatientId || !recordForm.anamnese) return
    const record: MedicalRecord = {
      id: 'rec-' + Date.now(),
      pacienteId: selectedPatientId,
      pacienteNome: selectedPatient?.nome || '',
      data: new Date().toISOString().split('T')[0],
      tipo: recordForm.tipo,
      anamnese: recordForm.anamnese,
      diagnostico: recordForm.diagnostico || undefined,
      prescricao: recordForm.prescricao || undefined,
      exames: recordForm.exames ? recordForm.exames.split('\n').filter(Boolean) : undefined,
      observacoes: recordForm.observacoes || undefined,
      medicoId: user?.id || '',
      medicoNome: user?.nome || '',
      assinado: false,
      createdAt: new Date().toISOString(),
    }
    addRecord(record)
    setShowRecordModal(false)
    setRecordForm({ tipo: 'consulta', anamnese: '', diagnostico: '', prescricao: '', exames: '', observacoes: '' })
  }

  const handleAddProtocol = () => {
    if (!selectedPatientId || !protocolForm.nome) return
    const protocol: TreatmentProtocol = {
      id: editProtocolId || 'prot-' + Date.now(),
      pacienteId: selectedPatientId,
      pacienteNome: selectedPatient?.nome || '',
      nome: protocolForm.nome,
      descricao: protocolForm.descricao,
      sessoesTotal: parseInt(protocolForm.sessoesTotal) || 0,
      sessoesRealizadas: editProtocolId ? (protocols.find(p => p.id === editProtocolId)?.sessoesRealizadas || 0) : 0,
      valorPorSessao: parseFloat(protocolForm.valorPorSessao) || 0,
      valorTotal: (parseInt(protocolForm.sessoesTotal) || 0) * (parseFloat(protocolForm.valorPorSessao) || 0),
      status: 'ativo',
      dataInicio: new Date().toISOString().split('T')[0],
      observacoes: protocolForm.observacoes || undefined,
    }
    if (editProtocolId) {
      updateProtocol(editProtocolId, protocol)
    } else {
      addProtocol(protocol)
    }
    setShowProtocolModal(false)
    setEditProtocolId(null)
    setProtocolForm({ nome: '', descricao: '', sessoesTotal: '', valorPorSessao: '', observacoes: '' })
  }

  const handleAddSession = () => {
    if (!selectedPatientId || !sessionForm.data) return
    const session: TreatmentSession = {
      id: 'sess-' + Date.now(),
      protocoloId: sessionForm.protocoloId,
      pacienteId: selectedPatientId,
      pacienteNome: selectedPatient?.nome || '',
      data: sessionForm.data,
      horario: sessionForm.horario,
      procedimento: sessionForm.procedimento,
      valor: parseFloat(sessionForm.valor) || 0,
      status: 'agendada',
      observacoes: sessionForm.observacoes || undefined,
    }
    addSession(session)
    if (sessionForm.protocoloId) {
      updateProtocol(sessionForm.protocoloId, { sessoesRealizadas: (protocols.find(p => p.id === sessionForm.protocoloId)?.sessoesRealizadas || 0) + 1 })
    }
    setShowSessionModal(false)
    setSessionForm({ data: '', horario: '', procedimento: '', valor: '', observacoes: '', protocoloId: '' })
  }

  const handleAddPrescription = () => {
    if (!selectedPatientId || prescriptionsList.length === 0) return
    addPrescription({
      id: 'presc-' + Date.now(),
      pacienteId: selectedPatientId,
      paciente: selectedPatient?.nome || '',
      medicamentos: prescriptionsList,
      data: new Date().toISOString().split('T')[0],
      assinada: false,
    })
    setShowPrescriptionModal(false)
    setPrescriptionsList([])
    setPrescriptionForm({ medicamento: '', dosagem: '', quantidade: '', observacao: '' })
  }

  return (
    <PaywallGate feature="pro" description="Prontuário eletrônico completo com evoluções, protocolos, prescrições e sessões.">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar paciente..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" />
          </div>
          <Button variant="primary" onClick={() => { setEditPatientId(null); resetPatientForm(); setShowPatientModal(true) }}>
            <Plus size={16} /> Novo paciente
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><div className="flex items-center gap-3"><User size={20} className="text-blue-brand" /><div><p className="text-sm text-text-secondary">Pacientes</p><p className="text-xl font-semibold text-text-primary mt-1">{patients.length}</p></div></div></Card>
          <Card><div className="flex items-center gap-3"><FileText size={20} className="text-success" /><div><p className="text-sm text-text-secondary">Prontuários</p><p className="text-xl font-semibold text-text-primary mt-1">{records.length}</p></div></div></Card>
          <Card><div className="flex items-center gap-3"><Activity size={20} className="text-blue-brand" /><div><p className="text-sm text-text-secondary">Protocolos</p><p className="text-xl font-semibold text-text-primary mt-1">{protocols.length}</p></div></div></Card>
          <Card><div className="flex items-center gap-3"><Calendar size={20} className="text-warning" /><div><p className="text-sm text-text-secondary">Sessões</p><p className="text-xl font-semibold text-text-primary mt-1">{sessions.length}</p></div></div></Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Patient list */}
          <div className="col-span-1">
            <Card header={<span className="font-heading text-base font-medium">Pacientes</span>}>
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <p className="text-sm text-text-muted py-4 text-center">Nenhum paciente cadastrado</p>
                ) : (
                  filteredPatients.map(p => (
                    <div key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`flex items-center gap-3 py-3 px-2 rounded-lg cursor-pointer transition-colors ${
                        selectedPatientId === p.id ? 'bg-blue-pale border-l-2 border-blue-brand' : 'hover:bg-blue-pale/30'
                      }`}>
                      <div className="w-8 h-8 rounded-full bg-blue-mid/30 flex items-center justify-center text-xs font-medium text-text-primary">
                        {p.nome.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{p.nome}</p>
                        <p className="text-xs text-text-muted truncate">{p.cpf || p.convenio || '—'}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleEditPatient(p) }} className="p-1 hover:bg-bg-card-alt rounded cursor-pointer">
                        <Pencil size={12} className="text-text-muted" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Patient detail panel */}
          <div className="col-span-2">
            {!selectedPatient ? (
              <Card><p className="text-sm text-text-muted text-center py-8">Selecione um paciente para ver os detalhes</p></Card>
            ) : (
              <div className="space-y-4">
                {/* Patient header */}
                <Card className="bg-gradient-to-r from-blue-deep to-blue-mid text-white border-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-medium">
                        {selectedPatient.nome.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-medium">{selectedPatient.nome}</h3>
                        <p className="text-text-on-dark2 text-sm">
                          {[selectedPatient.cpf, selectedPatient.convenio, selectedPatient.telefone].filter(Boolean).join(' · ') || 'Sem dados'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" className="!bg-white/20 !text-white hover:!bg-white/30" onClick={() => setShowRecordModal(true)}>
                        <FileText size={14} /> Novo prontuário
                      </Button>
                      <Button variant="secondary" size="sm" className="!bg-white/20 !text-white hover:!bg-white/30" onClick={() => { setEditProtocolId(null); setProtocolForm({ nome: '', descricao: '', sessoesTotal: '', valorPorSessao: '', observacoes: '' }); setShowProtocolModal(true) }}>
                        <Plus size={14} /> Protocolo
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Tabs within patient */}
                <Tabs
                  tabs={[
                    { key: 'evolucoes', label: 'Evoluções', icon: <FileText size={14} /> },
                    { key: 'protocolos', label: 'Protocolos', icon: <Activity size={14} /> },
                    { key: 'sessoes', label: 'Sessões', icon: <Calendar size={14} /> },
                    { key: 'prescricoes', label: 'Prescrições', icon: <Pill size={14} /> },
                  ]}
                  active={tab}
                  onChange={setTab}
                />

                {/* Evoluções */}
                {tab === 'evolucoes' && (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => setShowRecordModal(true)}>
                        <Plus size={14} /> Nova evolução
                      </Button>
                    </div>
                    {patientRecords.length === 0 ? (
                      <p className="text-sm text-text-muted text-center py-4">Nenhum prontuário registrado</p>
                    ) : (
                      patientRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(r => (
                        <Card key={r.id}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={r.tipo === 'consulta' ? 'blue' : r.tipo === 'retorno' ? 'green' : r.tipo === 'exame' ? 'amber' : 'gold'}>{r.tipo}</Badge>
                              <span className="text-xs text-text-muted">{r.data}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {!r.assinado ? (
                                <Button size="sm" variant="ghost" onClick={() => signRecord(r.id)}>
                                  <CheckCircle size={12} /> Assinar
                                </Button>
                              ) : (
                                <Badge variant="green">Assinado</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-text-muted mb-1">Dr(a). {r.medicoNome}</p>
                          {r.anamnese && <p className="text-sm text-text-primary mb-2"><strong>Anamnese:</strong> {r.anamnese}</p>}
                          {r.diagnostico && <p className="text-sm text-text-primary mb-2"><strong>Diagnóstico:</strong> {r.diagnostico}</p>}
                          {r.prescricao && <p className="text-sm text-text-primary mb-2"><strong>Prescrição:</strong> {r.prescricao}</p>}
                          {r.exames && r.exames.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-text-primary">Exames:</p>
                              <ul className="list-disc list-inside text-sm text-text-secondary">{r.exames.map((e, i) => <li key={i}>{e}</li>)}</ul>
                            </div>
                          )}
                          {r.observacoes && <p className="text-xs text-text-secondary">{r.observacoes}</p>}
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {/* Protocolos */}
                {tab === 'protocolos' && (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => { setEditProtocolId(null); setProtocolForm({ nome: '', descricao: '', sessoesTotal: '', valorPorSessao: '', observacoes: '' }); setShowProtocolModal(true) }}>
                        <Plus size={14} /> Novo protocolo
                      </Button>
                    </div>
                    {patientProtocols.length === 0 ? (
                      <p className="text-sm text-text-muted text-center py-4">Nenhum protocolo ativo</p>
                    ) : (
                      patientProtocols.map(p => (
                        <Card key={p.id}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-heading font-medium text-text-primary">{p.nome}</h4>
                              <p className="text-xs text-text-secondary">{p.descricao}</p>
                            </div>
                            <Badge variant={p.status === 'ativo' ? 'green' : p.status === 'concluido' ? 'blue' : p.status === 'pausado' ? 'amber' : 'red'}>{p.status}</Badge>
                          </div>
                          <div className="flex gap-4 text-sm mt-2">
                            <span className="text-text-primary">Sessões: {p.sessoesRealizadas}/{p.sessoesTotal}</span>
                            <span className="text-text-primary">Valor: R$ {p.valorPorSessao.toFixed(2)}/sessão</span>
                            <span className="text-text-primary">Total: R$ {p.valorTotal.toFixed(2)}</span>
                          </div>
                          <div className="mt-2 bg-bg-card-alt rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-brand h-full rounded-full" style={{ width: `${p.sessoesTotal > 0 ? (p.sessoesRealizadas / p.sessoesTotal * 100) : 0}%` }} />
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Button size="sm" variant="ghost" onClick={() => {
                              setEditProtocolId(p.id)
                              setProtocolForm({ nome: p.nome, descricao: p.descricao, sessoesTotal: String(p.sessoesTotal), valorPorSessao: String(p.valorPorSessao), observacoes: p.observacoes || '' })
                              setShowProtocolModal(true)
                            }}><Pencil size={12} /> Editar</Button>
                            {p.sessoesRealizadas < p.sessoesTotal && (
                              <Button size="sm" variant="ghost" onClick={() => updateProtocol(p.id, { sessoesRealizadas: p.sessoesRealizadas + 1 })}>
                                <CheckCircle size={12} /> +1 sessão
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                )}

                {/* Sessões */}
                {tab === 'sessoes' && (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => { setSessionForm({ data: new Date().toISOString().split('T')[0], horario: '', procedimento: '', valor: '', observacoes: '', protocoloId: '' }); setShowSessionModal(true) }}>
                        <Plus size={14} /> Nova sessão
                      </Button>
                    </div>
                    {sessions.filter(s => s.pacienteId === selectedPatientId).length === 0 ? (
                      <p className="text-sm text-text-muted text-center py-4">Nenhuma sessão registrada</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {sessions.filter(s => s.pacienteId === selectedPatientId).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(s => (
                          <div key={s.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-pale flex items-center justify-center"><Clock size={14} className="text-blue-brand" /></div>
                              <div>
                                <p className="text-sm font-medium text-text-primary">{s.procedimento}</p>
                                <p className="text-xs text-text-secondary">{s.data} {s.horario && `às ${s.horario}`}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-text-primary">R$ {s.valor.toFixed(2)}</span>
                              <select value={s.status} onChange={e => updateSession(s.id, { status: e.target.value as TreatmentSession['status'] })}
                                className="text-xs rounded-lg border border-border-strong px-2 py-1 outline-none cursor-pointer">
                                <option value="agendada">Agendada</option>
                                <option value="realizada">Realizada</option>
                                <option value="faltou">Faltou</option>
                                <option value="cancelada">Cancelada</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Prescrições */}
                {tab === 'prescricoes' && (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => { setPrescriptionsList([]); setPrescriptionForm({ medicamento: '', dosagem: '', quantidade: '', observacao: '' }); setShowPrescriptionModal(true) }}>
                        <Pill size={14} /> Nova prescrição
                      </Button>
                    </div>
                    {prescriptions.filter(p => p.pacienteId === selectedPatient.id).length === 0 ? (
                      <p className="text-sm text-text-muted text-center py-4">Nenhuma prescrição</p>
                    ) : (
                      prescriptions.filter(p => p.pacienteId === selectedPatient.id).map(p => (
                        <Card key={p.id}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-text-muted">{p.data}</p>
                            {!p.assinada ? (
                              <Button size="sm" variant="ghost" onClick={() => signPrescription(p.id)}><CheckCircle size={12} /> Assinar</Button>
                            ) : (
                              <Badge variant="green">Assinada</Badge>
                            )}
                          </div>
                          <table className="w-full text-sm">
                            <thead><tr className="bg-bg-card-alt"><th className="px-3 py-2 text-left text-xs text-text-muted">Medicamento</th><th className="px-3 py-2 text-left text-xs text-text-muted">Dosagem</th><th className="px-3 py-2 text-left text-xs text-text-muted">Qtd</th></tr></thead>
                            <tbody className="divide-y divide-border">
                              {p.medicamentos.map((m, i) => (
                                <tr key={i}><td className="px-3 py-2 text-text-primary">{m.nome}</td><td className="px-3 py-2 text-text-secondary">{m.dosagem}</td><td className="px-3 py-2 text-text-secondary">{m.quantidade}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Modal */}
      <Modal open={showPatientModal} onClose={() => { setShowPatientModal(false); setEditPatientId(null); resetPatientForm() }}
        title={editPatientId ? 'Editar paciente' : 'Novo paciente'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-text-primary mb-1">Nome *</label>
              <input value={patientForm.nome} onChange={e => setPatientForm(p => ({ ...p, nome: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">CPF</label>
              <input value={patientForm.cpf} onChange={e => setPatientForm(p => ({ ...p, cpf: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-text-primary mb-1">Telefone</label>
              <input value={patientForm.telefone} onChange={e => setPatientForm(p => ({ ...p, telefone: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">Email</label>
              <input type="email" value={patientForm.email} onChange={e => setPatientForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-text-primary mb-1">Data de nascimento</label>
              <input type="date" value={patientForm.dataNascimento} onChange={e => setPatientForm(p => ({ ...p, dataNascimento: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">Convênio</label>
              <select value={patientForm.convenio} onChange={e => setPatientForm(p => ({ ...p, convenio: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                <option value="">Particular</option>
                <option value="UNIMED">UNIMED</option>
                <option value="SulAmérica">SulAmérica</option>
                <option value="Bradesco Saúde">Bradesco Saúde</option>
                <option value="Amil">Amil</option>
                <option value="NotreDame">NotreDame</option>
              </select></div>
          </div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Observações</label>
            <textarea value={patientForm.observacoes} onChange={e => setPatientForm(p => ({ ...p, observacoes: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowPatientModal(false); setEditPatientId(null); resetPatientForm() }}>Cancelar</Button>
            <Button className="flex-1" disabled={!patientForm.nome} onClick={handleSavePatient}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Record Modal */}
      <Modal open={showRecordModal} onClose={() => setShowRecordModal(false)} title="Novo prontuário">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-text-primary mb-1">Tipo</label>
            <select value={recordForm.tipo} onChange={e => setRecordForm(p => ({ ...p, tipo: e.target.value as MedicalRecord['tipo'] }))}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
              <option value="consulta">Consulta</option>
              <option value="retorno">Retorno</option>
              <option value="exame">Exame</option>
              <option value="procedimento">Procedimento</option>
            </select></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Anamnese *</label>
            <textarea value={recordForm.anamnese} onChange={e => setRecordForm(p => ({ ...p, anamnese: e.target.value }))}
              rows={4} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Diagnóstico</label>
            <textarea value={recordForm.diagnostico} onChange={e => setRecordForm(p => ({ ...p, diagnostico: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Prescrição</label>
            <textarea value={recordForm.prescricao} onChange={e => setRecordForm(p => ({ ...p, prescricao: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Exames (um por linha)</label>
            <textarea value={recordForm.exames} onChange={e => setRecordForm(p => ({ ...p, exames: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Observações</label>
            <textarea value={recordForm.observacoes} onChange={e => setRecordForm(p => ({ ...p, observacoes: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowRecordModal(false)}>Cancelar</Button>
            <Button className="flex-1" disabled={!recordForm.anamnese} onClick={handleAddRecord}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Protocol Modal */}
      <Modal open={showProtocolModal} onClose={() => setShowProtocolModal(false)} title={editProtocolId ? 'Editar protocolo' : 'Novo protocolo'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-text-primary mb-1">Nome *</label>
            <input value={protocolForm.nome} onChange={e => setProtocolForm(p => ({ ...p, nome: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Descrição</label>
            <textarea value={protocolForm.descricao} onChange={e => setProtocolForm(p => ({ ...p, descricao: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-text-primary mb-1">Total de sessões</label>
              <input type="number" min="1" value={protocolForm.sessoesTotal} onChange={e => setProtocolForm(p => ({ ...p, sessoesTotal: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">Valor por sessão (R$)</label>
              <input type="number" step="0.01" min="0" value={protocolForm.valorPorSessao} onChange={e => setProtocolForm(p => ({ ...p, valorPorSessao: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          </div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Observações</label>
            <textarea value={protocolForm.observacoes} onChange={e => setProtocolForm(p => ({ ...p, observacoes: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowProtocolModal(false)}>Cancelar</Button>
            <Button className="flex-1" disabled={!protocolForm.nome} onClick={handleAddProtocol}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Session Modal */}
      <Modal open={showSessionModal} onClose={() => setShowSessionModal(false)} title="Nova sessão">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-text-primary mb-1">Data *</label>
              <input type="date" value={sessionForm.data} onChange={e => setSessionForm(p => ({ ...p, data: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">Horário</label>
              <input type="time" value={sessionForm.horario} onChange={e => setSessionForm(p => ({ ...p, horario: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-text-primary mb-1">Procedimento</label>
              <input value={sessionForm.procedimento} onChange={e => setSessionForm(p => ({ ...p, procedimento: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
            <div><label className="block text-sm font-medium text-text-primary mb-1">Valor (R$)</label>
              <input type="number" step="0.01" min="0" value={sessionForm.valor} onChange={e => setSessionForm(p => ({ ...p, valor: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          </div>
          {selectedPatientId && patientProtocols.length > 0 && (
            <div><label className="block text-sm font-medium text-text-primary mb-1">Protocolo</label>
              <select value={sessionForm.protocoloId} onChange={e => setSessionForm(p => ({ ...p, protocoloId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand">
                <option value="">Sem vínculo</option>
                {patientProtocols.filter(p => p.status === 'ativo').map(p => (
                  <option key={p.id} value={p.id}>{p.nome} ({p.sessoesRealizadas}/{p.sessoesTotal})</option>
                ))}
              </select>
            </div>
          )}
          <div><label className="block text-sm font-medium text-text-primary mb-1">Observações</label>
            <textarea value={sessionForm.observacoes} onChange={e => setSessionForm(p => ({ ...p, observacoes: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand" /></div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowSessionModal(false)}>Cancelar</Button>
            <Button className="flex-1" disabled={!sessionForm.data} onClick={handleAddSession}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Prescription Modal */}
      <Modal open={showPrescriptionModal} onClose={() => setShowPrescriptionModal(false)} title="Nova prescrição">
        <div className="space-y-4">
          <div className="border rounded-lg p-4 border-border">
            <p className="text-sm font-medium text-text-primary mb-2">Medicamentos</p>
            <div className="grid grid-cols-4 gap-2 mb-2">
              <input value={prescriptionForm.medicamento} onChange={e => setPrescriptionForm(p => ({ ...p, medicamento: e.target.value }))}
                placeholder="Medicamento" className="px-2 py-1.5 rounded border border-border-strong text-xs outline-none focus:border-blue-brand" />
              <input value={prescriptionForm.dosagem} onChange={e => setPrescriptionForm(p => ({ ...p, dosagem: e.target.value }))}
                placeholder="Dosagem" className="px-2 py-1.5 rounded border border-border-strong text-xs outline-none focus:border-blue-brand" />
              <input value={prescriptionForm.quantidade} onChange={e => setPrescriptionForm(p => ({ ...p, quantidade: e.target.value }))}
                placeholder="Quantidade" className="px-2 py-1.5 rounded border border-border-strong text-xs outline-none focus:border-blue-brand" />
              <Button size="sm" onClick={() => {
                if (prescriptionForm.medicamento) {
                  setPrescriptionsList([...prescriptionsList, { nome: prescriptionForm.medicamento, dosagem: prescriptionForm.dosagem, quantidade: prescriptionForm.quantidade, observacao: prescriptionForm.observacao || undefined }])
                  setPrescriptionForm({ medicamento: '', dosagem: '', quantidade: '', observacao: '' })
                }
              }}>Adicionar</Button>
            </div>
            {prescriptionsList.length > 0 && (
              <div className="space-y-1">
                {prescriptionsList.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-text-primary bg-bg-card-alt rounded px-2 py-1">
                    <span>{m.nome} - {m.dosagem} - {m.quantidade}</span>
                    <button onClick={() => setPrescriptionsList(p => p.filter((_, idx) => idx !== i))} className="text-danger hover:underline cursor-pointer">remover</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowPrescriptionModal(false)}>Cancelar</Button>
            <Button className="flex-1" disabled={prescriptionsList.length === 0} onClick={handleAddPrescription}>Salvar prescrição</Button>
          </div>
        </div>
      </Modal>
    </PaywallGate>
  )
}