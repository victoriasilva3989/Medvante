import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface ImportStep {
  key: string
  label: string
}

const steps: ImportStep[] = [
  { key: 'tipo', label: 'Tipo' },
  { key: 'template', label: 'Template' },
  { key: 'upload', label: 'Upload' },
  { key: 'mapeamento', label: 'Mapeamento' },
  { key: 'validacao', label: 'Validação' },
  { key: 'importar', label: 'Importar' },
]

export function ImportacaoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<null | { total: number; validos: number; erros: number }>(null)

  const importTypes = [
    { key: 'atendimentos', label: 'Atendimentos', desc: 'Consultas e procedimentos', icon: '📋' },
    { key: 'financeiro', label: 'Lançamentos financeiros', desc: 'Receitas e despesas', icon: '💰' },
    { key: 'pacientes', label: 'Pacientes', desc: 'Base cadastral', icon: '🏥' },
    { key: 'estoque', label: 'Estoque', desc: 'Inventário inicial', icon: '📦' },
  ]

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new()

    // Aba 1 - Instruções
    const instrucoesData = [
      ['INSTRUÇÕES - MEDVANTE'],
      [''],
      ['Passo a passo:'],
      ['1. Não altere os nomes das colunas'],
      ['2. Datas no formato DD/MM/AAAA'],
      ['3. Valores sem R$, usar vírgula decimal (ex: 350,00)'],
      ['4. Campos opcionais podem ficar em branco'],
      ['5. Salve como .xlsx antes de enviar'],
      [''],
      ['Colunas da planilha:'],
      ['Coluna', 'Nome', 'Obrigatório', 'Tipo', 'Exemplo', 'Observação'],
      ['A', 'data', 'SIM', 'Data', '15/03/2024', 'DD/MM/AAAA'],
      ['B', 'paciente_nome', 'SIM', 'Texto', 'Maria da Silva', 'Nome completo'],
      ['C', 'paciente_cpf', 'NÃO', 'Texto', '123.456.789-00', 'Com ou sem pontuação'],
      ['D', 'procedimento', 'SIM', 'Texto', 'Consulta', 'Nome do procedimento'],
      ['E', 'tipo', 'SIM', 'Opção', 'particular', 'particular / convenio / telemedicina'],
      ['F', 'convenio', 'NÃO', 'Texto', 'UNIMED', 'Obrigatório se tipo = convenio'],
      ['G', 'valor', 'SIM', 'Número', '350,00', 'Sem R$, usar vírgula'],
      ['H', 'status', 'NÃO', 'Opção', 'pago', 'pago / pendente / parcial'],
      ['I', 'local', 'NÃO', 'Texto', 'Consultório Centro', 'Nome do local'],
      ['J', 'observacao', 'NÃO', 'Texto', 'Retorno', 'Qualquer anotação'],
      [''],
      ['Valores aceitos para campo "tipo":'],
      ['particular, convenio, telemedicina'],
      [''],
      ['Valores aceitos para campo "status":'],
      ['pago, pendente, parcial'],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(instrucoesData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Instruções')

    // Aba 2 - Atendimentos
    const headers = ['data', 'paciente_nome', 'paciente_cpf', 'procedimento', 'tipo', 'convenio', 'valor', 'status', 'local', 'observacao']
    const exemplos = [
      ['15/03/2024', 'Maria da Silva', '123.456.789-00', 'Consulta', 'particular', '', '350,00', 'pago', 'Consultório Centro', 'Retorno'],
      ['16/03/2024', 'João Santos', '', 'Eletrocardiograma', 'convenio', 'UNIMED', '180,00', 'pendente', '', ''],
      ['17/03/2024', 'Ana Costa', '987.654.321-00', 'Teleconsulta', 'telemedicina', '', '250,00', 'pago', '', ''],
    ]
    const ws2 = XLSX.utils.aoa_to_sheet([headers, ...exemplos])
    ws2['!cols'] = headers.map(() => ({ wch: 20 }))
    XLSX.utils.book_append_sheet(wb, ws2, 'Atendimentos')

    // Aba 3 - Convênios
    const convenios = [
      ['CONVÊNIOS DE REFERÊNCIA'],
      [''],
      ['Use exatamente estes nomes na coluna "convenio":'],
      ['UNIMED', 'SulAmérica', 'Amil', 'Bradesco Saúde', 'NotreDame'],
      ['Hapvida', 'São Francisco', 'Allianz', 'Prevent Senior', 'Omint'],
      ['Golden Cross', 'Medial Saúde', 'Cassi', 'Fusex', 'Geap'],
    ]
    const ws3 = XLSX.utils.aoa_to_sheet(convenios)
    XLSX.utils.book_append_sheet(wb, ws3, 'Referência - Convênios')

    XLSX.writeFile(wb, 'medvante_template_importacao.xlsx')
  }

  const handleSimulateImport = () => {
    setImportResult({ total: 156, validos: 142, erros: 14 })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      {/* Step content */}
      {currentStep === 0 && (
        <Card header={<span className="font-heading text-base font-medium">Escolha o tipo de dado</span>}>
          <div className="grid grid-cols-2 gap-4">
            {importTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  selectedType === type.key ? 'border-blue-brand bg-blue-pale/30' : 'border-border hover:border-border-strong bg-bg-card'
                }`}
              >
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
            <p className="text-sm text-text-secondary mb-4">Baixe nossa planilha modelo, preencha com seus dados e faça o upload. É o caminho mais rápido e sem erros.</p>
            <Button className="w-full" onClick={handleDownloadTemplate}>
              <Download size={16} /> Baixar planilha modelo (.xlsx)
            </Button>
            <div className="mt-3">
              <button onClick={() => setCurrentStep(2)} className="text-sm text-blue-brand hover:underline cursor-pointer">Já preencheu? Ir para o upload →</button>
            </div>
          </Card>

          <Card header={<span className="font-heading text-base font-medium">Minha planilha</span>}>
            <p className="text-sm text-text-secondary mb-4">Se já tem uma planilha, pode enviar diretamente. Vamos mapear suas colunas para o formato do Medvante.</p>
            <Button variant="secondary" className="w-full" onClick={() => setCurrentStep(2)}>
              <Upload size={16} /> Ir para o upload
            </Button>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <Card header={<span className="font-heading text-base font-medium">Upload da planilha</span>}>
          <div className="border-2 border-dashed border-border-strong rounded-xl p-12 text-center hover:border-blue-brand transition-colors cursor-pointer">
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
            <Button onClick={() => setCurrentStep(3)}>Mapear colunas →</Button>
          </div>
        </Card>
      )}

      {currentStep === 3 && (
        <Card header={<span className="font-heading text-base font-medium">Mapeamento de colunas</span>}>
          <div className="space-y-4">
            {['data', 'paciente_nome', 'paciente_cpf', 'procedimento', 'tipo', 'convenio', 'valor', 'status'].map((col) => (
              <div key={col} className="flex items-center gap-4">
                <label className="text-sm font-medium text-text-primary w-40">{col}</label>
                <select className="flex-1 px-3 py-2 rounded-lg border border-border-strong text-sm text-text-primary outline-none focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
                  <option>Selecionar coluna...</option>
                  <option>{col}</option>
                  <option>Pular esta coluna</option>
                </select>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="ghost"><AlertTriangle size={14} /> Auto-detectar</Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCurrentStep(2)}>Voltar</Button>
              <Button onClick={() => setCurrentStep(4)}>Validar →</Button>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 4 && (
        <Card header={<span className="font-heading text-base font-medium">Validação e preview</span>}>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-success"><CheckCircle size={16} /> <span className="text-sm">142 válidos</span></div>
            <div className="flex items-center gap-2 text-warning"><AlertTriangle size={16} /> <span className="text-sm">8 com aviso</span></div>
            <div className="flex items-center gap-2 text-danger"><XCircle size={16} /> <span className="text-sm">6 com erro</span></div>
          </div>
          <div className="bg-bg-card-alt rounded-lg p-4 text-sm">
            <p className="font-medium text-text-primary mb-2">Erros encontrados:</p>
            <table className="w-full text-xs">
              <thead><tr className="text-text-muted"><th className="text-left py-1">Linha</th><th className="text-left">Coluna</th><th className="text-left">Motivo</th><th className="text-left">Sugestão</th></tr></thead>
              <tbody className="text-text-secondary">
                <tr><td className="py-1">3</td><td>valor</td><td>Formato inválido</td><td>Use vírgula decimal (ex: 350,00)</td></tr>
                <tr><td className="py-1">7</td><td>data</td><td>Data inválida</td><td>Use formato DD/MM/AAAA</td></tr>
                <tr><td className="py-1">12</td><td>tipo</td><td>Valor não reconhecido</td><td>Use: particular, convenio ou telemedicina</td></tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="ghost"><Download size={14} /> Baixar relatório de erros</Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCurrentStep(3)}>Voltar</Button>
              <Button onClick={() => { setCurrentStep(5); handleSimulateImport() }}>Importar →</Button>
            </div>
          </div>
        </Card>
      )}

      {currentStep === 5 && (
        <Card header={<span className="font-heading text-base font-medium">Confirmar e importar</span>}>
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
                <Button variant="secondary">Histórico de importações</Button>
                <Button onClick={() => { setCurrentStep(0); setImportResult(null); setSelectedType(null) }}>
                  Nova importação
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Você está importando <strong className="text-text-primary">156 atendimentos</strong></p>
              <div className="bg-bg-card-alt rounded-lg h-2 overflow-hidden">
                <div className="bg-blue-brand h-full rounded-full w-0 animate-pulse transition-all" style={{ width: '65%' }} />
              </div>
              <p className="text-xs text-text-muted text-center">Importando... 65%</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}


