# Política de Segurança — SIGSS-AutoIndex

A segurança da informação e a privacidade dos dados de saúde dos cidadãos de Betim são prioridades máximas do projeto **SIGSS-AutoIndex**.

---

## 🔒 Garantias de Segurança Arquiteturais

1. **Execução 100% Local no Navegador**: O SIGSS-AutoIndex opera exclusivamente na memória RAM do navegador do usuário no contexto das páginas do SIGSS.
2. **Zero Coleta ou Exfiltração de Dados**: A extensão não possui servidores externos, telefonia de telemetria, rastreadores ou bancos de dados remotos. Nenhuma informação de paciente é transmitida para fora dos servidores oficiais da Prefeitura Municipal de Betim.
3. **Descarte em Memória**: As Blob URLs criadas temporariamente para exibição do PDF enumerado são revogadas e limpas automaticamente da memória após 60 segundos.

---

## 📋 Versões Suportadas

Apenas a versão estável mais recente recebe atualizações de segurança e correções:

| Versão | Suportada |
| :--- | :--- |
| 1.0.x | Yes |
| < 1.0.0 | No |

---

## 🚨 Como Reportar Vulnerabilidades

Se você identificar qualquer potencial vulnerabilidade de segurança na extensão:

1. **NÃO crie uma Issue pública** no GitHub.
2. Envie um relatório detalhado diretamente ao mantenedor principal:
   - **Autor**: Guilherme Paicheco Ferreira
   - **Organização**: Prefeitura Municipal de Betim
3. Inclua no relatório:
   - Descrição da vulnerabilidade.
   - Passos ou script para reprodução do cenário de risco.
   - Impacto estimado.

A equipe analisará o relatório e emitirá uma resposta com plano de mitigação em até 48 horas.
