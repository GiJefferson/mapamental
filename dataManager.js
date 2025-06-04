/*
===============================================
DATA MANAGER - Camada de Gerenciamento de Dados
===============================================
Responsável pelo CRUD de apresentações, persistência de dados e operações core
*/

// Variáveis globais de gerenciamento de dados
let apresentacoes = [];
let arquivosCarregados = [];
let editandoId = null;
let excluindoId = null;
let customizandoId = null;
let termoBuscaAtual = '';

const DATABASE_FILE = 'database.json';

// ==============================================
// CRUD DE APRESENTAÇÕES
// ==============================================
function adicionarApresentacao() {
    const nome = document.getElementById('nome').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const icone = document.getElementById('icone').value;
    const pasta = document.getElementById('pasta').value.trim();
    const caminhoBase = document.getElementById('caminhoBase').value.trim();

    // APENAS o campo Nome é obrigatório
    if (!nome) {
        alert('Por favor, preencha o campo Nome!');
        return;
    }

    const estrutura = utilityTools.gerarEstruturaDosArquivos();
    
    if (editandoId) {
        // Atualizando apresentação existente
        const index = apresentacoes.findIndex(a => a.id === editandoId);
        if (index !== -1) {
            apresentacoes[index] = {
                ...apresentacoes[index],
                nome, descricao, icone, pasta, caminhoBase, estrutura,
                arquivos: [...arquivosCarregados],
                atualizado_em: new Date().toISOString()
            };
        }
        editandoId = null;
        document.getElementById('formTitle').textContent = '📥 Importar Nova Apresentação';
        document.getElementById('submitBtn').textContent = 'Adicionar';
        document.getElementById('submitBtn').className = 'add-btn';
        document.getElementById('cancelBtn').style.display = 'none';
        
        uiRenderer.toggleImportSection();
        uiRenderer.mostrarNotificacao('Apresentação atualizada! Clique em "💾 Salvar Database.json"', 'success');
    } else {
        // Adicionando nova apresentação
        const corPadrao = 'linear-gradient(135deg, #667eea, #764ba2)';
        const timestamp = new Date().toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const novaApresentacao = {
            id: Date.now(),
            nome, 
            descricao: descricao || '', // CORRIGIDO: descrição vazia se não preenchida
            icone, 
            pasta: pasta || '', // CORRIGIDO: pasta vazia se não preenchida
            caminhoBase, 
            estrutura,
            arquivos: [...arquivosCarregados],
            criado_em: new Date().toISOString(),
            corFundo: corPadrao,
            corIcone: corPadrao,
            tamanhoTitulo: 1.3
        };
        apresentacoes.push(novaApresentacao);
        
        uiRenderer.toggleImportSection();
        
        if (caminhoBase) {
            uiRenderer.mostrarNotificacao('Nova apresentação com caminhos completos adicionada!', 'success');
        } else {
            uiRenderer.mostrarNotificacao('Apresentação adicionada! Configure "Caminho Base" para caminhos completos.', 'success');
        }
    }

    uiRenderer.renderizarCards(termoBuscaAtual ? utilityTools.buscarApresentacoes(termoBuscaAtual) : apresentacoes);
    limparFormulario();
}

function editarApresentacao(id) {
    const apresentacao = apresentacoes.find(a => a.id === id);
    if (!apresentacao) return;

    editandoId = id;
    
    const content = document.getElementById('importContent');
    if (!content.classList.contains('expanded')) {
        uiRenderer.toggleImportSection();
    }
    
    document.getElementById('nome').value = apresentacao.nome;
    document.getElementById('descricao').value = apresentacao.descricao;
    document.getElementById('icone').value = apresentacao.icone;
    document.getElementById('pasta').value = apresentacao.pasta;
    document.getElementById('caminhoBase').value = apresentacao.caminhoBase || '';
    document.getElementById('iconPreview').textContent = apresentacao.icone;
    
    if (apresentacao.arquivos) {
        arquivosCarregados = [...apresentacao.arquivos];
        utilityTools.mostrarPastaCarregada();
    }
    
    document.getElementById('formTitle').textContent = '📝 Editar Apresentação';
    document.getElementById('submitBtn').textContent = 'Atualizar';
    document.getElementById('submitBtn').className = 'update-btn';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    document.querySelector('.import-section').scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicao() {
    editandoId = null;
    document.getElementById('formTitle').textContent = '📥 Importar Nova Apresentação';
    document.getElementById('submitBtn').textContent = 'Adicionar';
    document.getElementById('submitBtn').className = 'add-btn';
    document.getElementById('cancelBtn').style.display = 'none';
    limparFormulario();
}

function duplicarApresentacao(id) {
    const apresentacaoOriginal = apresentacoes.find(a => a.id === id);
    if (!apresentacaoOriginal) return;
    
    const novaApresentacao = {
        ...apresentacaoOriginal,
        id: Date.now(),
        nome: apresentacaoOriginal.nome, // REMOVIDO: + ' (Cópia)'
        criado_em: new Date().toISOString(),
        atualizado_em: undefined // Remove atualizado_em da cópia
    };
    
    // Duplicar array de arquivos se existir
    if (apresentacaoOriginal.arquivos) {
        novaApresentacao.arquivos = [...apresentacaoOriginal.arquivos];
    }
    
    // Duplicar estrutura se existir
    if (apresentacaoOriginal.estrutura) {
        novaApresentacao.estrutura = [...apresentacaoOriginal.estrutura];
    }
    
    apresentacoes.push(novaApresentacao);
    
    uiRenderer.renderizarCards(termoBuscaAtual ? utilityTools.buscarApresentacoes(termoBuscaAtual) : apresentacoes);
            uiRenderer.mostrarNotificacao(`"${apresentacaoOriginal.nome}" duplicada! Lembre-se de salvar o database.json`, 'success');
}

function excluirApresentacao(id) {
    excluindoId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

function confirmarExclusao() {
    if (excluindoId) {
        const apresentacao = apresentacoes.find(a => a.id === excluindoId);
        apresentacoes = apresentacoes.filter(a => a.id !== excluindoId);
        
        uiRenderer.renderizarCards(termoBuscaAtual ? utilityTools.buscarApresentacoes(termoBuscaAtual) : apresentacoes);
        uiRenderer.mostrarNotificacao(`"${apresentacao?.nome}" foi excluída! Lembre-se de salvar o database.json`, 'success');
        excluindoId = null;
    }
    fecharModal();
}

function fecharModal() {
    document.getElementById('deleteModal').style.display = 'none';
    excluindoId = null;
}

function mostrarDetalhes(id) {
    const apresentacao = apresentacoes.find(a => a.id === id);
    if (!apresentacao) return;

    document.getElementById('presentationSection').style.display = 'none';
    document.getElementById('detailsSection').style.display = 'block';

    const detailsIcon = document.getElementById('detailsIcon');
    detailsIcon.textContent = apresentacao.icone;
    
    // Aplicar cor ao ícone de detalhes também
    if (apresentacao.corIcone || apresentacao.corFundo) {
        detailsIcon.style.background = apresentacao.corIcone || apresentacao.corFundo;
    }
    
    document.getElementById('detailsTitle').textContent = apresentacao.nome;
    document.getElementById('detailsDescription').textContent = apresentacao.descricao;

    uiRenderer.exibirEstrutura(apresentacao);
}

function voltarParaLista() {
    document.getElementById('detailsSection').style.display = 'none';
    document.getElementById('presentationSection').style.display = 'block';
}

function limparFormulario() {
    document.getElementById('nome').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('pasta').value = '';
    document.getElementById('caminhoBase').value = '';
    document.getElementById('icone').value = '📚';
    document.getElementById('iconPreview').textContent = '📚';
    document.getElementById('fileInput').value = '';
    arquivosCarregados = [];
    document.getElementById('uploadedFiles').innerHTML = '';
}

// ==============================================
// SISTEMA DE DATABASE
// ==============================================
function tentarCarregarDatabase() {
    document.getElementById('databaseFileInput').click();
}

async function salvarDados() {
    try {
        const dados = {
            apresentacoes,
            timestamp: new Date().toISOString(),
            versao: '2.0',
            total: apresentacoes.length,
            info: 'Mapa Mental Organizacional - Database Principal v2.0'
        };
        
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = DATABASE_FILE;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Database.json salvo!');
        uiRenderer.mostrarNotificacao('Database.json baixado! Coloque na mesma pasta do HTML.', 'success');
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
        uiRenderer.mostrarNotificacao('Erro ao salvar database.json!', 'error');
    }
}

function exportarDados() {
    try {
        const dados = {
            apresentacoes,
            exportado_em: new Date().toISOString(),
            versao: '2.0',
            total: apresentacoes.length,
            info: 'Backup do Mapa Mental Organizacional v2.0'
        };
        
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-mapa-mental-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        uiRenderer.mostrarNotificacao('Backup adicional criado e baixado!', 'success');
    } catch (error) {
        uiRenderer.mostrarNotificacao('Erro ao criar backup!', 'error');
    }
}

function carregarDatabaseArquivo(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (dados.apresentacoes && Array.isArray(dados.apresentacoes)) {
                if (apresentacoes.length > 0) {
                    if (!confirm('Isso substituirá todos os dados atuais. Deseja continuar?')) {
                        return;
                    }
                }
                
                apresentacoes = dados.apresentacoes;
                uiRenderer.renderizarCards();
                uiRenderer.mostrarNotificacao(`Database carregado! ${dados.apresentacoes.length} apresentações importadas!`, 'success');
            } else {
                uiRenderer.mostrarNotificacao('Arquivo database.json inválido!', 'error');
            }
        } catch (error) {
            uiRenderer.mostrarNotificacao('Erro ao carregar database.json!', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

async function tentarCarregarDatabaseAutomatico() {
    try {
        if (window.location.protocol === 'file:') {
            console.log('📄 Arquivo aberto localmente (file://). Carregamento automático desabilitado devido ao CORS.');
            uiRenderer.mostrarNotificacao('💡 Use o botão "📂 Carregar Database.json" para importar seus dados', 'info');
            return false;
        }
        
        console.log('🔍 Tentando carregar database.json automaticamente...');
        const response = await fetch('./database.json');
        
        if (response.ok) {
            const dados = await response.json();
            
            if (dados.apresentacoes && Array.isArray(dados.apresentacoes)) {
                apresentacoes = dados.apresentacoes;
                uiRenderer.renderizarCards();
                console.log(`✅ Database.json carregado automaticamente! ${dados.apresentacoes.length} apresentações.`);
                uiRenderer.mostrarNotificacao(`Database.json carregado! ${dados.apresentacoes.length} apresentações encontradas.`, 'success');
                return true;
            }
        } else {
            console.log('📄 Nenhum database.json encontrado na pasta.');
            return false;
        }
    } catch (error) {
        console.log('📄 Database.json não encontrado ou erro CORS:', error.message);
        if (error.message.includes('CORS')) {
            uiRenderer.mostrarNotificacao('🔒 CORS bloqueado. Use o botão "📂 Carregar Database.json"', 'info');
        }
        return false;
    }
}

function limparCache() {
    if (apresentacoes.length === 0) {
        uiRenderer.mostrarNotificacao('Cache já está vazio!', 'info');
        return;
    }
    
    const totalItens = apresentacoes.length;
    
    if (!confirm(`Isso irá limpar ${totalItens} apresentação(ões) da memória.\n\nO arquivo database.json NÃO será apagado da pasta.\n\nDeseja continuar?`)) {
        return;
    }
    
    // Limpar apenas os dados da memória
    apresentacoes = [];
    arquivosCarregados = [];
    termoBuscaAtual = '';
    
    // Limpar também formulários e estados de edição
    editandoId = null;
    excluindoId = null;
    customizandoId = null;
    
    // Re-renderizar interface
    uiRenderer.renderizarCards();
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').style.display = 'none';
    limparFormulario();
    
    uiRenderer.mostrarNotificacao(`Cache limpo! ${totalItens} apresentação(ões) removidas da memória.`, 'success');
}

// Inicialização principal
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Mapa Mental Organizacional v2.0...');
    console.log('📁 Estrutura: index.html + styles.css + 3 módulos JS + database.json');
    console.log('🌐 Verificando ambiente e habilitando carregamento');
    
    // Tentar carregar database.json automaticamente
    const carregouAutomatico = await tentarCarregarDatabaseAutomatico();
    
    if (!carregouAutomatico) {
        console.log('📄 Nenhum database.json encontrado - iniciando com dados vazios');
        uiRenderer.renderizarCards();
    }
    
    console.log('✅ Sistema inicializado com sucesso!');
});

// Adicionar função global para compatibilidade com o HTML existente
window.aplicarCustomizacao = function() {
    dataManager.aplicarCustomizacao();
};

// Tornar a função global para compatibilidade com HTML
window.limparCache = limparCache;

// Exportar funções para uso nos outros módulos
window.dataManager = {
    // Dados
    getApresentacoes: () => apresentacoes,
    getArquivosCarregados: () => arquivosCarregados,
    setArquivosCarregados: (arquivos) => { arquivosCarregados = arquivos },
    getTermoBuscaAtual: () => termoBuscaAtual,
    setTermoBuscaAtual: (termo) => { termoBuscaAtual = termo },
    getCustomizandoId: () => customizandoId,
    setCustomizandoId: (id) => { customizandoId = id },
    
    // Funções CRUD
    adicionarApresentacao,
    editarApresentacao,
    cancelarEdicao,
    duplicarApresentacao,
    excluirApresentacao,
    confirmarExclusao,
    fecharModal,
    mostrarDetalhes,
    voltarParaLista,
    limparFormulario,
    limparCache,
    
    // Funções de banco de dados
    salvarDados,
    exportarDados,
    tentarCarregarDatabase,
    carregarDatabaseArquivo,
    
    // Reorganização (para drag & drop)
    reorganizarApresentacoes: (fromIndex, toIndex) => {
        const elemento = apresentacoes.splice(fromIndex, 1)[0];
        apresentacoes.splice(toIndex, 0, elemento);
        uiRenderer.renderizarCards();
        uiRenderer.mostrarNotificacao('Apresentações reorganizadas! Lembre-se de salvar.', 'success');
    },
    
    // Personalização
    aplicarCustomizacao: () => {
        if (!customizandoId) return;
        
        const apresentacao = apresentacoes.find(a => a.id === customizandoId);
        const corSelecionada = document.querySelector('.color-option.selected')?.dataset.color;
        const tamanhoFonte = document.getElementById('fontSizeSlider').value;
        
        if (corSelecionada) {
            apresentacao.corFundo = corSelecionada;
            apresentacao.corIcone = corSelecionada; // Salvar a cor para o ícone também
        }
        apresentacao.tamanhoTitulo = parseFloat(tamanhoFonte);
        
        uiRenderer.renderizarCards(termoBuscaAtual ? utilityTools.buscarApresentacoes(termoBuscaAtual) : apresentacoes);
        uiRenderer.fecharCustomizacao();
        uiRenderer.mostrarNotificacao('Personalização aplicada!', 'success');
    }
};