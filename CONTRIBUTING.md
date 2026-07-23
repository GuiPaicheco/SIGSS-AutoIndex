# Guia de Contribuição — SIGSS-AutoIndex

Agradecemos o seu interesse em contribuir para o projeto **SIGSS-AutoIndex**!

O objetivo deste documento é orientar desenvolvedores e colaboradores sobre as diretrizes, padrões de código e fluxo de trabalho exigidos para manter a qualidade e segurança do sistema.

---

## 📜 Princípios Fundamentais

Este projeto segue princípios arquiteturais inegociáveis:

1. **Execução 100% em Memória**: Proibida a criação de banco de dados, armazenamento local (`localStorage`, `indexedDB`) ou salvamento de arquivos em disco.
2. **Zero Interferência na UI**: Proibido adicionar botões, modais, menus ou alterar o fluxo natural dos profissionais de saúde no SIGSS.
3. **Resiliência Crítica**: Todo processamento deve possuir mecanismo de fallback garantido para a abertura do PDF original sem modificações em caso de qualquer exceção.

---

## 💻 Padrão de Código e Convenções

- **Sintaxe**: JavaScript Moderno (ES2022+).
- **Módulos no Browser**: Injeção declarativa sequencial no Manifest V3 em contexto `world: "MAIN"`.
- **Compatibilidade Dupla**: Todo script utilitário ou de modelo deve manter suporte para exportação via `module.exports` quando executado em ambiente Node.js.
- **Indentação**: 4 espaços.
- **Comentários**: Todos os arquivos devem manter o cabeçalho profissional do projeto e documentação JSDoc em todas as funções públicas.
- **Logs**: Utilizar exclusivamente a abstração `Logger` (`Logger.info`, `Logger.debug`, `Logger.error`), respeitando a flag `DEBUG_MODE`.

---

## 🐛 Como Abrir Issues

Se você encontrar um problema ou bug em campo:

1. Verifique se o problema já foi reportado na aba **Issues** do repositório oficial.
2. Caso não exista, abra uma nova Issue informando:
   - Descrição detalhada do comportamento observado.
   - Passos para reproduzir o problema.
   - Logs de erro capturados no Console do DevTools (quando em `DEBUG_MODE = true`).
   - Versão da extensão utilizada.

---

## 🔀 Como Criar Pull Requests (PR)

1. Faça um *Fork* do repositório.
2. Crie uma branch para sua modificação:
   ```bash
   git checkout -b feature/nome-da-feature
   ```
3. Garanta que todos os testes automatizados locais estejam passando:
   ```bash
   node scratch/test_v0_5_0.js
   ```
4. Envie seus commits seguindo o padrão de mensagens do projeto (ex: `v1.0.0: ...`).
5. Abra o **Pull Request** para a branch `main` descrevendo com clareza as alterações realizadas e confirmando que nenhum princípio arquitetural foi violado.
