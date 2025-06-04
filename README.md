# 🧠 Mapa Mental Organizacional v2.0

Um sistema inteligente para organização de arquivos e documentos, desenvolvido em HTML, CSS e JavaScript puro. Organize suas apresentações, projetos e pastas de forma visual e interativa.

## 📋 Índice

- [Características](#-características)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Resolução de Problemas](#-resolução-de-problemas)
- [Contribuição](#-contribuição)

## ✨ Características

### 🆕 Novidades da v2.0
- **🔍 Sistema de Busca Avançado** - Busque com wildcards (*), aspas exatas e múltiplos termos
- **🖱️ Drag & Drop** - Reorganize apresentações arrastando e soltando
- **🎨 Personalização** - 12 cores de fundo e tamanhos de título ajustáveis
- **📋 Textos Clicáveis** - Copie descrições e caminhos com um clique
- **👁️ Múltiplas Visualizações** - Grade, Lista e Compacto
- **📄 Duplicação** - Clone apresentações rapidamente
- **🔗 Caminhos Completos** - Configure caminho base para links diretos

### 🏗️ Características Técnicas
- **100% Offline** - Funciona sem internet
- **Sem Dependências** - HTML, CSS e JS puro
- **Responsivo** - Funciona em desktop e mobile
- **Sistema de Database** - Salva tudo em database.json
- **Modular** - Código organizado em 3 módulos principais

## 🚀 Instalação

### Opção 1: Download Direto
1. Baixe todos os arquivos do projeto
2. Coloque em uma pasta
3. Abra `index.html` no navegador

### Opção 2: Servidor Local (Recomendado)
```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# VS Code Live Server
Instale a extensão Live Server
```

### 📁 Estrutura de Arquivos
```
mapa-mental-organizacional/
├── index.html          # Interface principal
├── styles.css          # Estilos e responsividade
├── dataManager.js      # CRUD e persistência
├── uiRenderer.js       # Interface e visualização
├── utilityTools.js     # Ferramentas e busca
└── database.json       # Dados (criado automaticamente)
```

## 📖 Como Usar

### 🎯 Primeiro Uso

1. **Configure o Caminho Base** (Importante!)
   ```
   Windows: C:\Projetos\
   Mac/Linux: /home/usuario/projetos/
   ```

2. **Adicione uma Apresentação**
   - Clique em "📥 Importar Nova Apresentação"
   - Preencha o nome (obrigatório)
   - Use "📂 Processar Pasta" para carregar estrutura completa

3. **Salve os Dados**
   - Clique em "💾 Salvar Database.json"
   - Coloque o arquivo na mesma pasta do HTML

### 🔍 Sistema de Busca

```
# Busca simples
javascript

# Busca com wildcard
*javascript*

# Busca exata
"projeto final"

# Busca combinada
python *2024* "machine learning"
```

### 🎨 Personalização

- **Cores**: Clique no botão 🎨 de qualquer card
- **Tamanho**: Ajuste o slider de fonte
- **Reorganização**: Arraste cards pela área de ⋮⋮

### 📋 Cópia Inteligente

- **Descrições**: Clique na descrição para copiar
- **Caminhos**: Clique nos links azuis/verdes para copiar paths
- **Formatos**: Automaticamente normaliza para Windows (\\)

## 🛠️ Funcionalidades

### 📊 Gestão de Dados
- ✅ Adicionar, editar, excluir apresentações
- ✅ Duplicar apresentações
- ✅ Backup automático com timestamp
- ✅ Importar/exportar database.json
- ✅ Reorganização por drag & drop

### 🔍 Busca e Filtros
- ✅ Busca em tempo real
- ✅ Wildcards (*termo*)
- ✅ Busca exata ("termo")
- ✅ Busca em todos os campos
- ✅ Busca em estrutura de arquivos

### 🎨 Interface
- ✅ 3 modos de visualização
- ✅ 12 esquemas de cores
- ✅ Tamanhos de título ajustáveis
- ✅ Interface responsiva
- ✅ Notificações visuais

### 📁 Processamento de Pastas
- ✅ Upload de pastas completas
- ✅ Mapeamento hierárquico
- ✅ Ícones por tipo de arquivo
- ✅ Estatísticas de arquivos
- ✅ Caminhos clicáveis

## 📋 Estrutura do Projeto

### 🗂️ Módulos Principais

#### `dataManager.js` - Gerenciamento de Dados
```javascript
// Funções principais
- adicionarApresentacao()
- editarApresentacao()
- excluirApresentacao()
- salvarDados()
- carregarDatabaseArquivo()
```

#### `uiRenderer.js` - Interface do Usuário
```javascript
// Funções principais
- renderizarCards()
- toggleImportSection()
- mudarVisualizacao()
- habilitarDragAndDrop()
- abrirCustomizacao()
```

#### `utilityTools.js` - Ferramentas
```javascript
// Funções principais
- executarBusca()
- processarPasta()
- copiarCaminho()
- getFileIcon()
- mostrarEstatisticas()
```

### 💾 Formato do Database

```json
{
  "apresentacoes": [
    {
      "id": 1234567890,
      "nome": "Projeto React",
      "descricao": "Aplicação web moderna",
      "icone": "⚛️",
      "pasta": "projeto-react",
      "caminhoBase": "C:\\Projetos\\",
      "estrutura": ["📁 src/", "📄 App.js"],
      "arquivos": [
        {
          "name": "App.js",
          "path": "projeto-react/src/App.js",
          "relativePath": "src/App.js",
          "size": 1024,
          "type": "application/javascript"
        }
      ],
      "corFundo": "linear-gradient(135deg, #667eea, #764ba2)",
      "corIcone": "linear-gradient(135deg, #667eea, #764ba2)",
      "tamanhoTitulo": 1.3,
      "criado_em": "2024-12-04T10:00:00.000Z"
    }
  ],
  "versao": "2.0",
  "timestamp": "2024-12-04T10:00:00.000Z"
}
```

## 🐛 Resolução de Problemas

### 🔒 Erro CORS (file://)
**Problema**: Arquivo aberto diretamente no navegador
```
❌ Database não carrega automaticamente
❌ Bloqueio de segurança do navegador
```

**Soluções**:
1. Use sempre "📂 Carregar Database.json"
2. Configure servidor local:
   ```bash
   python -m http.server 8000
   npx serve
   ```
3. Use extensão Live Server no VS Code

### 📄 Database não encontrado
**Problema**: Arquivo database.json não existe,
```
✅ Normal no primeiro uso
💡 Use o formulário para adicionar dados
💾 Clique "Salvar Database.json" para criar
```

### 🖱️ Drag & Drop não funciona
**Problema**: Arrastar não reorganiza cards
```
❌ Busca ativa impede reorganização
✅ Limpe a busca primeiro
✅ Cursor deve mostrar 🤏 (grab)
```

### 📋 Cópia não funciona
**Problema**: Caminhos/textos não copiam
```
🔧 Abra Console do navegador (F12)
📊 Veja logs de debug detalhados
🔄 Teste manual: window.utilityTools.testarCopia()
```

### 📱 Mobile não responsivo
**Problema**: Interface quebrada no celular
```
📐 Zoom out no navegador
🔄 Recarregue a página
📱 Use modo paisagem para melhor visualização
```

## ⌨️ Atalhos de Teclado

- **S** - Salvar database.json (quando não estiver em campo de texto)
- **Enter** - Executar busca (quando no campo de busca)
- **Escape** - Fechar modals e popups

## 📊 Estatísticas e Debug

### Console Commands
```javascript
// Estatísticas detalhadas
window.utilityTools.mostrarEstatisticas()

// Testar sistema de cópia
window.utilityTools.testarCopia()

// Diagnosticar cards problemáticos
window.utilityTools.diagnosticarCards()

// Testar descrições complexas
window.utilityTools.testarDescricoes()
```

### Logs do Browser
- **F12** para abrir DevTools
- **Console** mostra logs detalhados
- **Network** para debugar carregamento

## 🔄 Atualizações Futuras

### Próximas Funcionalidades
- [ ] Criação de Subspastas
- [ ] Categorias e tags
- [ ] Filtros avançados
- [ ] Themes personalizados

### Melhorias Planejadas
- [ ] Selecionar mais de uma pasta (Drag Select / Lasso Selection)
- [ ] Drag Select E jogar para uma Subpasta as Pastas
- [ ] Offline complete
- [ ] Compressão de dados

## 🤝 Contribuição

### Como Contribuir
1. Fork o repositório
2. Crie uma branch: `git checkout -b minha-funcionalidade`
3. Faça commits: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin minha-funcionalidade`
5. Abra um Pull Request

### Padrões de Código
- **Comentários**: Sempre documentar funções complexas
- **Modularização**: Manter separação clara entre módulos
- **Responsividade**: Testar em mobile e desktop
- **Compatibilidade**: Manter suporte a browsers modernos

### Reportar Bugs
1. Descreva o problema detalhadamente
2. Inclua logs do console (F12)
3. Especifique browser e versão
4. Anexe database.json se necessário

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

- **Issues**: Use o sistema de issues do GitHub
- **Documentação**: README.md e comentários no código
- **Debug**: Console do navegador (F12) com logs detalhados

---

**🧠 Mapa Mental Organizacional v2.0** - Transforme seus projetos em uma experiência visual e organizada!
