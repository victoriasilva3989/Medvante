import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

var __dirname = dirname(fileURLToPath(import.meta.url))
var root = join(__dirname, '..')

var keys = [
  'medvante-auth', 'medvante-caixa', 'medvante-prontuario',
  'medvante-comissionamento', 'medvante-banks', 'medvante-faturamento',
  'medvante-trial', 'medvante-atendimentos', 'medvante-contas-receber',
  'medvante-contas-pagar', 'medvante-profile', 'medvante-notificacoes',
  'medvante-dmed-status', 'medvante-pipeline', 'medvante-glosas',
  'medvante-campanhas', 'medvante-nps', 'medvante-crm',
  'medvante-estoque', 'medvante-orcamentos', 'medvante-precificacao',
]

console.log('===========================================')
console.log('  Medvante - Reset de dados de desenvolvimento')
console.log('===========================================')
console.log('')
console.log('  Chaves a serem removidas (' + keys.length + '):')
keys.forEach(function (k) { console.log('    - ' + k) })
console.log('')
console.log('  O localStorage do Medvante so pode ser limpo pelo navegador.')
console.log('')
console.log('  > Opcao 1 - Abra reset.html no navegador:')
console.log('     ' + join(root, 'reset.html'))
console.log('')
console.log('  > Opcao 2 - Cole no console do DevTools (F12):')
console.log('')
var cmds = keys.map(function (k) { return "localStorage.removeItem('" + k + "')" }).join('; ')
console.log('    ' + cmds + ';')
console.log('    location.reload();')
console.log('')
console.log('  > Opcao 3 - No app, va em Configuracoes > "Resetar dados do sistema"')
console.log('===========================================')
console.log('')

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

var keyRows = keys.map(function (k) { return '        <li>' + escapeHtml(k) + '</li>' }).join('\n')

var json = JSON.stringify(keys)

var html = '<!DOCTYPE html>\n'
  + '<html lang="pt-BR">\n'
  + '<head>\n'
  + '  <meta charset="UTF-8">\n'
  + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
  + '  <title>Medvante - Reset</title>\n'
  + '  <style>\n'
  + '    * { margin: 0; padding: 0; box-sizing: border-box; }\n'
  + '    body {\n'
  + '      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n'
  + '      background: #0B1121; color: #E2E8F0;\n'
  + '      display: flex; align-items: center; justify-content: center;\n'
  + '      min-height: 100vh;\n'
  + '    }\n'
  + '    .card {\n'
  + '      background: #1E293B; border-radius: 16px;\n'
  + '      padding: 48px; max-width: 520px; width: 90%;\n'
  + '      text-align: center; border: 1px solid #334155;\n'
  + '    }\n'
  + '    h1 { color: #93C5FD; font-size: 24px; margin-bottom: 8px; }\n'
  + '    h1 span { color: #2563EB; }\n'
  + '    p { color: #94A3B8; font-size: 14px; margin-bottom: 24px; }\n'
  + '    .keys {\n'
  + '      text-align: left; background: #0F172A;\n'
  + '      border-radius: 8px; padding: 16px; margin-bottom: 24px;\n'
  + '      font-size: 12px; color: #64748B; max-height: 200px; overflow-y: auto;\n'
  + '    }\n'
  + '    .keys li { padding: 2px 0; }\n'
  + '    .btn {\n'
  + '      background: #2563EB; color: #fff; border: none;\n'
  + '      padding: 14px 32px; border-radius: 10px; font-size: 15px;\n'
  + '      font-weight: 600; cursor: pointer; transition: background .2s;\n'
  + '    }\n'
  + '    .btn:hover { background: #1D4ED8; }\n'
  + '    .btn:active { background: #1E40AF; }\n'
  + '    .success { color: #22C55E; font-weight: 600; margin-top: 16px; display: none; }\n'
  + '  </style>\n'
  + '</head>\n'
  + '<body>\n'
  + '  <div class="card">\n'
  + '    <h1>med<span>vante</span></h1>\n'
  + '    <p>Clique abaixo para limpar todos os dados locais do Medvante.</p>\n'
  + '    <div class="keys">\n'
  + '      <strong style="color:#94A3B8;">Chaves que serao removidas:</strong>\n'
  + '      <ul>\n'
  + keyRows + '\n'
  + '      </ul>\n'
  + '    </div>\n'
  + '    <button class="btn" onclick="resetar()">Limpar dados</button>\n'
  + '    <p class="success" id="msg">Dados limpos com sucesso! Voce pode fechar esta pagina.</p>\n'
  + '  </div>\n'
  + '  <script>\n'
  + '    function resetar() {\n'
  + '      var keys = ' + json + ';\n'
  + '      keys.forEach(function(k) { localStorage.removeItem(k); });\n'
  + '      document.getElementById("msg").style.display = "block";\n'
  + '    }\n'
  + '  <\/script>\n'
  + '</body>\n'
  + '</html>\n'

writeFileSync(join(root, 'reset.html'), html, 'utf-8')
console.log('  - reset.html gerado na raiz do projeto.')
console.log('')
