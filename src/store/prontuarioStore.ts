import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  MedicalRecord, TreatmentProtocol, TreatmentSession,
  Prescription, Patient
} from '../types'

interface ProntuarioState {
  patients: Patient[]
  records: MedicalRecord[]
  protocols: TreatmentProtocol[]
  sessions: TreatmentSession[]
  prescriptions: Prescription[]

  addPatient: (p: Patient) => void
  updatePatient: (id: string, data: Partial<Patient>) => void
  addRecord: (r: MedicalRecord) => void
  signRecord: (id: string) => void
  addProtocol: (p: TreatmentProtocol) => void
  updateProtocol: (id: string, data: Partial<TreatmentProtocol>) => void
  addSession: (s: TreatmentSession) => void
  updateSession: (id: string, data: Partial<TreatmentSession>) => void
  addPrescription: (p: Prescription) => void
  signPrescription: (id: string) => void
  getRecordsByPatient: (pacienteId: string) => MedicalRecord[]
  getProtocolsByPatient: (pacienteId: string) => TreatmentProtocol[]
}

export const useProntuarioStore = create<ProntuarioState>()(
  persist(
    (set, get) => ({
      patients: [],
      records: [],
      protocols: [],
      sessions: [],
      prescriptions: [],

      addPatient: (p) => set(s => ({ patients: [...s.patients, p] })),
      updatePatient: (id, data) => set(s => ({
        patients: s.patients.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      addRecord: (r) => set(s => ({ records: [...s.records, r] })),
      signRecord: (id) => set(s => ({
        records: s.records.map(r => r.id === id ? { ...r, assinado: true } : r)
      })),
      addProtocol: (p) => set(s => ({ protocols: [...s.protocols, p] })),
      updateProtocol: (id, data) => set(s => ({
        protocols: s.protocols.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      addSession: (s) => set(state => ({ sessions: [...state.sessions, s] })),
      updateSession: (id, data) => set(s => ({
        sessions: s.sessions.map(ss => ss.id === id ? { ...ss, ...data } : ss)
      })),
      addPrescription: (p) => set(s => ({ prescriptions: [...s.prescriptions, p] })),
      signPrescription: (id) => set(s => ({
        prescriptions: s.prescriptions.map(p => p.id === id ? { ...p, assinada: true } : p)
      })),
      getRecordsByPatient: (pacienteId) => get().records.filter(r => r.pacienteId === pacienteId),
      getProtocolsByPatient: (pacienteId) => get().protocols.filter(p => p.pacienteId === pacienteId),
    }),
    { name: 'medvante-prontuario' }
  )
)
