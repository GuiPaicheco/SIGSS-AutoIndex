# Guia de Release e Versionamento — SIGSS-AutoIndex

Este documento orienta o processo de geração e publicação de novas versões da extensão **SIGSS-AutoIndex**.

---

## 🏷️ Versionamento Semântico (SemVer)

O projeto adota a especificação de **Versionamento Semântico 2.0.0** (`MAJOR.MINOR.PATCH`):

- **MAJOR (ex: 1.0.0)**: Alterações estruturais ou redefinições da arquitetura base.
- **MINOR (ex: 1.1.0)**: Adição de novas funcionalidades de forma retrocompatível (ex: suporte a novas UBSs ou equipes).
- **PATCH (ex: 1.0.1)**: Correções de bugs, ajustes de documentação ou refatorações sem alteração de comportamento.

---

## 📋 Checklist de Liberação de Release

Antes de publicar uma nova versão oficial:

1. **Testes de Laboratório**: Executar a suíte de testes automatizados unitários:
   ```bash
   node scratch/test_v0_5_0.js
   ```
2. **Atualização do Manifest**: Atualizar a propriedade `"version"` no arquivo `manifest.json`.
3. **Changelog**: Registrar detalhadamente todas as alterações no arquivo `CHANGELOG.md`.
4. **Headers e Comentários**: Confirmar se todos os módulos mantêm o cabeçalho e documentação JSDoc atualizados.
5. **Git Commit & Tag**:
   ```bash
   git add .
   git commit -m "v1.0.0: Descrição da release"
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin main --tags
   ```
6. **Homologação em Campo**: Carregar a versão compactada/descompactada no Google Chrome e validar no ambiente real do SIGSS da UBS.
