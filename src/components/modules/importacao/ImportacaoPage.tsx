import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { usePersistedState } from '../../../hooks/usePersistedState'
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle } from 'lucide-react'
import type { Appointment } from '../../../types'

interface ImportStep { key: string; label: string }

const steps: ImportStep[] = [
  { key: 'tipo', label: 'Tipo' },
  { key: 'template', label: 'Template' },
  { key: 'upload', label: 'Upload' },
  { key: 'validacao', label: 'Validação' },
  { key: 'importar', label: 'Importar' },
]

const COLUNAS_ESPERADAS = ['data', 'paciente_nome', 'paciente_cpf', 'procedimento', 'tipo', 'convenio', 'valor', 'status', 'local', 'observacao']

export function ImportacaoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [importedData, setImportedData] = useState<Record<string, string>[] | null>(null)
  const [importedHeaders, setImportedHeaders] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<{ linha: number; coluna: string; motivo: string }[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<null | { total: number; validos: number; erros: number }>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, setAtendimentos] = usePersistedState<Appointment[]>('medvante-atendimentos', [])

  const importTypes = [
    { key: 'atendimentos', label: 'Atendimentos', desc: 'Consultas e procedimentos', icon: '📋' },
    { key: 'financeiro', label: 'Lançamentos financeiros', desc: 'Receitas e despesas', icon: '💰' },
    { key: 'pacientes', label: 'Pacientes', desc: 'Base cadastral', icon: '🏥' },
    { key: 'estoque', label: 'Estoque', desc: 'Inventário inicial', icon: '📦' },
  ]

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new()
    const instrucoesData = [
      ['INSTRUÇÕES - MEDVANTE'], [''], ['Passo a passo:'],
      ['1. Não altere os nomes das colunas'], ['2. Datas no formato DD/MM/AAAA'],
      ['3. Valores sem R$, usar vírgula decimal (ex: 350,00)'],
      ['4. Campos opcionais podem ficar em branco'], ['5. Salve como .xlsx antes de enviar'], [''],
      ['Colunas da planilha:'],
      ['Coluna', 'Nome', 'Obrigatório', 'Tipo', 'Exemplo', 'Observação'],
      ['A', 'data', 'SIM', 'Data', '15/03/2024', 'DD/MM/AAAA'],
      ['B', 'paciente_nome', 'SIM', 'Texto', 'Exemplo', 'Nome completo'],
      ['C', 'paciente_cpf', 'NÃO', 'Texto', '000.000.000-00', 'Com ou sem pontuação'],
      ['D', 'procedimento', 'SIM', 'Texto', 'Consulta', 'Nome do procedimento'],
      ['E', 'tipo', 'SIM', 'Opção', 'particular', 'particular / convenio / telemedicina'],
      ['F', 'convenio', 'NÃO', 'Texto', 'UNIMED', 'Obrigatório se tipo = convenio'],
      ['G', 'valor', 'SIM', 'Número', '350,00', 'Sem R$, usar vírgula'],
      ['H', 'status', 'NÃO', 'Opção', 'pago', 'pago / pendente / parcial'],
      ['I', 'local', 'NÃO', 'Texto', 'Consultório Centro', 'Nome do local'],
      ['J', 'observacao', 'NÃO', 'Texto', 'Retorno', 'Qualquer anotação'],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(instrucoesData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Instruções')
    const headers = ['data', 'paciente_nome', 'paciente_cpf', 'procedimento', 'tipo', 'convenio', 'valor', 'status', 'local', 'observacao']
    const exemplos = [
      ['DD/MM/AAAA', 'Nome do paciente', '000.000.000-00', 'Procedimento', 'particular', '', '0,00', 'pendente', '', ''],
    ]
    const ws2 = XLSX.utils.aoa_to_sheet([headers, ...exemplos])
    ws2['!cols'] = headers.map(() => ({ wch: 20 }))
    XLSX.utils.book_append_sheet(wb, ws2, 'Atendimentos')
    XLSX.writeFile(wb, 'medvante_template_importacao.xlsx')
  }

  const handleFileSelect = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const firstSheet = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet, { defval: '' })
        if (json.length > 0) {
          setImportedHeaders(Object.keys(json[0]))
          setImportedData(json)
          validateData(json)
          setCurrentStep(3)
        }
      } catch (err) {
        alert('Erro ao ler o arquivo. Verifique se é um .xlsx válido.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const validateData = (data: Record<string, string>[]) => {
    const errors: { linha: number; coluna: string; motivo: string }[] = []
    data.forEach((row, i) => {
      if (!row['paciente_nome']?.trim()) errors.push({ linha: i + 2, coluna: 'paciente_nome', motivo: 'Nome do paciente é obrigatório' })
      if (!row['data']?.trim()) errors.push({ linha: i + 2, coluna: 'data', motivo: 'Data é obrigatória' })
      if (!row['procedimento']?.trim()) errors.push({ linha: i + 2, coluna: 'procedimento', motivo: 'Procedimento é obrigatório' })
      if (!row['valor']?.trim()) errors.push({ linha: i + 2, coluna: 'valor', motivo: 'Valor é obrigatório' })
      if (row['tipo'] && !['particular', 'convenio', 'telemedicina'].includes(row['tipo'])) {
        errors.push({ linha: i + 2, coluna: 'tipo', motivo: 'Tipo deve ser: particular, convenio ou telemedicina' })
      }
      if (row['status'] && !['pago', 'pendente', 'parcial'].includes(row['status'])) {
        errors.push({ linha: i + 2, coluna: 'status', motivo: 'Status deve ser: pago, pendente ou parcial' })
      }
    })
    setValidationErrors(errors)
  }

  const handleImport = () => {
    if (!importedData) return
    const validRows = importedData.filter(row => row['paciente_nome']?.trim() && row['data']?.trim() && row['procedimento']?.trim() && row['valor']?.trim())

    const appointments: Appointment[] = validRows.map((row, i) => ({
      id: 'import-' + Date.now() + '-' + i,
      data: row['data'] || '',
      paciente_nome: row['paciente_nome'] || '',
      paciente_cpf: row['paciente_cpf'],
      procedimento: row['procedimento'] || '',
      tipo: (row['tipo'] as Appointment['tipo']) || 'particular',
      convenio: row['convenio'],
      valor: parseFloat(String(row['valor']).replace(',', '.')) || 0,
      status: (row['status'] as Appointment['status']) || 'pendente',
      local: row['local'],
      observacao: row['observacao'],
      importado: true,
    }))

    setImportProgress(0)
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setImportResult({ total: importedData.length, validos: appointments.length, erros: importedData.length - appointments.length })
          setAtendimentos(prev => [...prev, ...appointments])
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />

      {/* Step progress */}
      <Card>
        <div className="flex items-center gap-0">
          {steps.map((step, i) => (
            <div key={step.key} className="flex-1 flex items-center">
              <div className={`flex items-center gap-2 ${i <= currentStep ? 'text-blue-brand' : 'text-text-muted'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  i < currentStep ? 'bg-blue-brand text-white' : i === currentStep ? 'bg-blue-pale text-blue-brand border-2 border-blue-brand' : 'bg-bg-card-alt text-text-muted'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium hidden md:inline">{step.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${i < currentStep ? 'bg-blue-brand' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
      </Card>

      {currentStep === 0 && (
        <Card header={<span className="font-heading text-base font-medium">Escolha o tipo de dado</span>}>
          <div className="grid grid-cols-2 gap-4">
            {importTypes.map((type) => (
              <button key={type.key} onClick={() => setSelectedType(type.key)}
                className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  selectedType === type.key ? 'border-blue-brand bg-blue-pale/30' : 'border-border hover:border-border-strong bg-bg-card'
                }`}>
                <span className="text-2xl">{type.icon}</span>
                <h3 className="font-heading text-base font-medium text-text-primary mt-2">{type.label}</h3>
                <p className="text-sm text-text-secondary mt-0.5">{type.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button disabled={!selectedType} onClick={() => setCurrentStep(1)}>Continuar →</Button>
          </div>
        </Card>
      )}

      {currentStep === 1 && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-2 border-blue-brand" header={
            <div className="flex items-center justify-between">
              <span className="font-heading text-base font-medium">Template oficial</span>
              <Badge variant="gold">RECOMENDADO</Badge>
            </div>
          }>
            <p className="text-sm text-text-secondary mb-4">Baixe nossa planilha modelo, preencha com seus dados e faça o upload.</p>
            <Button className="w-full" onClick={handleDownloadTemplate}>
              <Download size={16} /> Baixar planilha modelo (.xlsx)
            </Button>
            <div className="mt-3">
              <button onClick={handleFileSelect} className="text-sm text-blue-brand hover:underline cursor-pointer">Já preencheu? Ir para o upload →</button>
            </div>
          </Card>
          <Card header={<span className="font-heading text-base font-medium">Minha planilha</span>}>
            <p className="text-sm text-text-secondary mb-4">Se já tem uma planilha, pode enviar diretamente.</p>
            <Button variant="secondary" className="w-full" onClick={handleFileSelect}>
              <Upload size={16} /> Selecionar arquivo
            </Button>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <Card header={<span className="font-heading text-base font-medium">Upload da planilha</span>}>
          <div onClick={handleFileSelect}
            className="border-2 border-dashed border-border-strong rounded-xl p-12 text-center hover:border-blue-brand transition-colors cursor-pointer">
            <FileSpreadsheet size={48} className="mx-auto text-text-muted mb-4" />
            <p className="text-text-primary font-medium">Arraste sua planilha aqui ou clique para selecionar</p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="blue">.xlsx</Badge>
              <Badge variant="blue">.xls</Badge>
              <Badge variant="blue">.csv</Badge>
            </div>
            <p className="text-xs text-text-muted mt-2">Tamanho máximo: 10MB</p>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="secondary" onClick={() => setCurrentStep(1)}>Voltar</Button>
            <Button onClick={handleFileSelect}>Selecionar arquivo →</Button>
          </div>
        </Card>
      )}

      {currentStep === 3 && importedData && (
        <Card header={<span className="font-heading text-base font-medium">Validação e preview</span>}>
          {importedHeaders.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-text-muted mb-1">Colunas detectadas: {importedHeaders.join(', ')}</p>
              <div className="flex items-center gap-2">
                {COLUNAS_ESPERADAS.map(col => (
                  <Badge key={col} variant={importedHeaders.includes(col) ? 'green' : 'red'}>
                    {col} {importedHeaders.includes(col) ? '✓' : '✗'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle size={16} /> <span className="text-sm">{importedData.length - validationErrors.length} válidos</span>
            </div>
            <div className="flex items-center gap-2 text-danger">
              <XCircle size={16} /> <span className="text-sm">{validationErrors.length} com erro</span>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-bg-card-alt rounded-lg p-4 text-sm mb-4">
              <p className="font-medium text-text-primary mb-2">Erros encontrados:</p>
              <table className="w-full text-xs">
                <thead><tr className="text-text-muted"><th className="text-left py-1">Linha</th><th className="text-left">Coluna</th><th className="text-left">Motivo</th></tr></thead>
                <tbody className="text-text-secondary">
                  {validationErrors.slice(0, 10).map((err, i) => (
                    <tr key={i}><td className="py-1">{err.linha}</td><td className="py-1">{err.coluna}</td><td className="py-1">{err.motivo}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Preview */}
          <div className="mb-4">
            <button onClick={() => setShowPreview(!showPreview)} className="text-sm text-blue-brand hover:underline cursor-pointer">
              {showPreview ? 'Ocultar preview' : `Mostrar preview (${importedData.length} linhas)`}
            </button>
          </div>
          {showPreview && (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs border-collapse">
                <thead><tr className="bg-bg-card-alt">
                  {importedHeaders.map(h => <th key={h} className="px-2 py-1 text-left text-text-muted">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {importedData.slice(0, 5).map((row, i) => (
                    <tr key={i}>{
                      importedHeaders.map(h => <td key={h} className="px-2 py-1 text-text-primary">{row[h] || '-'}</td>)
                    }</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => { setCurrentStep(0); setImportedData(null); setValidationErrors([]) }}>Recomeçar</Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCurrentStep(1)}>Voltar</Button>
              <Button onClick={() => { setCurrentStep(4); handleImport() }}
                disabled={importedData.length === 0}>
                Importar {importedData.length - validationErrors.length} registros →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 4 && (
        <Card header={<span className="font-heading text-base font-medium">Importando...</span>}>
          {importResult ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success-pale flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h3 className="font-heading text-xl font-medium text-text-primary mb-1">Importação concluída!</h3>
              <p className="text-text-secondary text-sm mb-4">
                {importResult.validos} registros importados · {importResult.erros} ignorados
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="secondary" onClick={() => { setCurrentStep(0); setImportedData(null); setImportResult(null); setValidationErrors([]); setImportProgress(0) }}>
                  Nova importação
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <p className="text-sm text-text-secondary text-center">
                Importando <strong className="text-text-primary">{importedData?.length || 0} registros</strong>...
              </p>
              <div className="bg-bg-card-alt rounded-lg h-2 overflow-hidden">
                <div className="bg-blue-brand h-full rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
              </div>
              <p className="text-xs text-text-muted text-center">{importProgress}%</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}