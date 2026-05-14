import { useState, useRef, useEffect } from 'react'
import { Card } from '../../ui/Card'
import { PaywallGate } from '../../trial/PaywallGate'
import { Brain, Send, Bot, User, MessageSquare, FileText, Microscope } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestions = [
  'Resuma os principais diagnósticos diferenciais para cefaleia refratária',
  'Sugira uma conduta baseada em evidências para diabetes tipo 2',
  'Analise possíveis interações medicamentosas entre antihipertensivos',
  'Gere um relatório de evolução para prontuário de paciente com hipertensão',
  'Quais exames complementares solicitar para suspeita de hipotireoidismo?',
]

export function IaPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        cefaleia: `**Análise clínica baseada em evidências (CID-10: R51)**

**Diagnósticos Diferenciais:**
1. **Cefaleia Tensional** (mais comum) — caráter bilateral, opressivo, sem fotofobia
2. **Enxaqueca** — unilateral, pulsátil, com náuseas e fotofobia
3. **Cefaleia em Salvas** — unilateral, periorbital, autonômica
4. **Cefaleia Cervicogênica** — origem na coluna cervical

**Recomendações:**
- Anamnese detalhada com caracterização da dor
- Exame neurológico completo
- Considerar neuroimagem se sinais de alerta (red flags)
- Tratamento agudo: AINEs ou triptanos conforme perfil`,
        diabetes: `**Conduta baseada em evidências para Diabetes Tipo 2 (CID-10: E11)**

**Abordagem Inicial:**
1. **Estilo de vida** — dieta, exercícios (≥150 min/semana), perda de peso
2. **Metformina** — primeira linha, 500-2550mg/dia
3. **HbA1c alvo** — <7% (individualizar)

**Se não controlar:**
- Adicionar iSGLT2 ou aGLP-1 (benefício cardiovascular)
- Insulinização precoce se HbA1c >9%

**Acompanhamento:**
- HbA1c a cada 3-6 meses
- Perfil lipídico anual
- Microalbuminúria anual
- Fundoscopia anual`,
        interação: `**Análise de Interações Medicamentosas**

**Principais interações com antihipertensivos comuns:**

| Medicamento | Interage com | Efeito |
|---|---|---|
| IECA/BRA | AINEs | Redução do efeito anti-hipertensivo |
| IECA/BRA | Diuréticos poupadores de K | Hipercalemia |
| Betabloqueador | Verapamil/Diltiazem | Bradicardia, BAV |
| Diuréticos | Lítio | Toxicidade por lítio |

**Recomendação:** Monitorar pressão arterial, função renal e eletrólitos em 2 semanas após início ou mudança de dose.`,
        relatório: `**Evolução Médica**

Paciente em acompanhamento ambulatorial. Refere adesão regular à medicação. Ao exame: PA 128x82 mmHg, FC 72 bpm, SatO2 98%. Ausculta cardiorrespiratória sem alterações. Abdome normotenso, indolor.

**Conduta:**
- Manter esquema medicamentoso atual
- Solicitar exames laboratoriais de rotina (lipidograma, glicemia, creatinina, K+)
- Retorno em 60 dias ou antes se sintomas

Dr(a). [Nome] · CRM [Número]`,
        exames: `**Exames Complementares para Hipotireoidismo (CID-10: E03.9)**

**Suspeita clínica:** fadiga, ganho de peso, intolerância ao frio, pele seca

**Exames de primeira linha:**
- **TSH** — screening inicial (elevado no hipotireoidismo primário)
- **T4 livre** — confirmatório (reduzido)

**Se TSH elevado + T4 normal → Hipotireoidismo subclínico**

**Anticorpos (se suspeita de Hashimoto):**
- Anti-TPO
- Anti-Tg

**Exames complementares:**
- Lipidograma (dislipidemia secundária)
- ECG (bradicardia, baixa voltagem)
- USG de tireoide (se nódulos ou bócio assimétrico)`,
      }

      let response = ''
      for (const [key, value] of Object.entries(responses)) {
        if (input.toLowerCase().includes(key)) {
          response = value
          break
        }
      }

      if (!response) {
        response = `**Análise clínica baseada em evidências**

Com base na sua solicitação, realizei uma análise considerando as melhores práticas e guidelines atuais.

**Principais pontos:**
1. A conduta deve ser individualizada conforme o perfil do paciente
2. Considere fatores de risco, comorbidades e preferências do paciente
3. Documente todo o raciocínio clínico no prontuário

Para uma análise mais específica, por favor forneça mais detalhes sobre o caso (sinais, sintomas, exames, histórico).

*Esta análise é baseada em evidências para fins de suporte à decisão clínica. Não substitui o julgamento médico.*`
      }

      const assistantMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
      setLoading(false)
    }, 1500)
  }

  return (
    <PaywallGate feature="clinic" description="O Charcot é o assistente de IA do Medvante. Analise prontuários, sugira diagnósticos e otimize sua prática clínica.">
      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-deep to-blue-mid p-4 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-medium">Charcot — IA Clínica</h2>
              <p className="text-xs text-text-on-dark2/80">Assistente inteligente para suporte à decisão clínica</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Brain size={48} className="text-blue-pale mb-4" />
                <h3 className="font-heading text-lg font-medium text-text-primary mb-2">Como posso ajudar?</h3>
                <p className="text-sm text-text-secondary max-w-md mb-6">
                  Faça perguntas sobre diagnósticos diferenciais, condutas baseadas em evidências, interações medicamentosas, ou peça para gerar relatórios de evolução.
                </p>
                <div className="grid grid-cols-1 gap-2 w-full max-w-lg">
                  {suggestions.map(s => (
                    <button key={s} onClick={() => { setInput(s) }}
                      className="text-left text-sm p-3 rounded-lg border border-border hover:border-blue-brand hover:bg-blue-pale/30 transition-all cursor-pointer text-text-secondary hover:text-text-primary">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-pale flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-blue-brand" />
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'bg-blue-brand text-white' : 'bg-bg-card-alt text-text-primary'} rounded-xl px-4 py-3`}>
                  <div className="text-sm whitespace-pre-wrap [&_strong]:font-semibold [&_strong]:text-inherit leading-relaxed">
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.startsWith('| ') || line.startsWith('|---') ? (
                          <span className="text-xs font-mono">{line}</span>
                        ) : line.startsWith('**') && line.endsWith('**') ? (
                          <strong className="font-semibold">{line.slice(2, -2)}</strong>
                        ) : line.startsWith('### ') ? (
                          <strong className="font-semibold text-base">{line.slice(4)}</strong>
                        ) : line.match(/^\d+\.\s/) ? (
                          <span className="block ml-2">{line}</span>
                        ) : (
                          line
                        )}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] mt-2 opacity-60">
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-brand flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-pale flex items-center justify-center">
                  <Brain size={16} className="text-blue-brand animate-pulse" />
                </div>
                <div className="bg-bg-card-alt rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-brand animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-brand animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-brand animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Digite sua pergunta clínica..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-border-strong text-sm outline-none focus:border-blue-brand focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
              />
              <button onClick={handleSend} disabled={!input.trim() || loading}
                className="px-4 py-2.5 bg-blue-brand text-white rounded-lg hover:bg-blue-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-2">
              O Charcot fornece análises baseadas em evidências para suporte à decisão clínica. Sempre valide as informações com seu julgamento profissional.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 space-y-4">
          <Card header={<span className="font-heading text-sm font-medium">Funcionalidades</span>}>
            <div className="space-y-3">
              {[
                { icon: MessageSquare, label: 'Análise de prontuários', desc: 'Resuma e extraia insights' },
                { icon: Microscope, label: 'Sugestão diagnóstica', desc: 'Diagnósticos diferenciais baseados em evidências' },
                { icon: FileText, label: 'Relatórios inteligentes', desc: 'Gere evoluções e relatórios' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-pale flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} className="text-blue-brand" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-primary">{item.label}</p>
                    <p className="text-[11px] text-text-secondary">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {messages.length > 0 && (
            <Card header={<span className="font-heading text-sm font-medium">Conversa atual</span>}>
              <div className="space-y-2">
                {messages.slice(-3).map(m => (
                  <div key={m.id} className="flex items-center gap-2">
                    {m.role === 'assistant' ? <Brain size={12} className="text-blue-brand" /> : <User size={12} className="text-text-muted" />}
                    <p className="text-xs text-text-secondary truncate">{m.content.slice(0, 40)}{m.content.length > 40 ? '...' : ''}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PaywallGate>
  )
}