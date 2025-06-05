/*
===============================================
UI RENDERER - Camada de Interface do Usuário
===============================================
Responsável pela renderização, visualização e interações com a interface
*/

// Variáveis globais de UI
let visualizacaoAtual = 'compact'; // Alterado para iniciar no modo compacto
let draggedElement = null;
let draggedIndex = -1;

// ==============================================
// SISTEMA DE TOGGLE DO FORMULÁRIO
// ==============================================
function toggleImportSection() {
    const content = document.getElementById('importContent');
    const icon = document.getElementById('toggleIcon');

    if (content.style.display === 'none' || !content.classList.contains('expanded')) {
        content.classList.add('expanded');
        content.style.display = 'block';
        icon.textContent = '🔼';
        icon.classList.add('rotated');
    } else {
        content.classList.remove('expanded');
        content.style.display = 'none';
        icon.textContent = '🔽';
        icon.classList.remove('rotated');
    }
}

// ==============================================
// SISTEMA DE TOGGLE DA BUSCA
// ==============================================
function toggleSearchSection() {
    const content = document.getElementById('searchContent');
    const icon = document.getElementById('searchToggleIcon');
    
    if (content.style.display === 'none' || !content.classList.contains('expanded')) {
        content.classList.add('expanded');
        content.style.display = 'block';
        icon.textContent = '🔼';
        icon.classList.add('rotated');
        
        // Focar no input de busca quando expandir
        setTimeout(() => {
            document.getElementById('searchInput').focus();
        }, 100);
    } else {
        content.classList.remove('expanded');
        content.style.display = 'none';
        icon.textContent = '🔽';
        icon.classList.remove('rotated');
    }
}

// ==============================================
// SISTEMA DE VISUALIZAÇÃO
// ==============================================
function mudarVisualizacao(tipo) {
    visualizacaoAtual = tipo;
    const grid = document.getElementById('cardsGrid');
    const botoes = document.querySelectorAll('.view-btn');

    // Atualizar botões ativos
    botoes.forEach(btn => {
        if (btn.dataset.view === tipo) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Atualizar classes do grid
    grid.className = `cards-grid ${tipo}-view`;
}

// ==============================================
// SISTEMA DE PERSONALIZAÇÃO
// ==============================================
function abrirCustomizacao(id) {
    dataManager.setCustomizandoId(id);
    const apresentacao = dataManager.getApresentacoes().find(a => a.id === id);

    // Limpar seleções anteriores
    document.querySelectorAll('.color-option').forEach(opt => 
        opt.classList.remove('selected')
    );

    // Priorizar corIcone se existir, caso contrário usar corFundo
    const corAtual = apresentacao.corIcone || apresentacao.corFundo;

    if (corAtual) {
        document.querySelectorAll('.color-option').forEach(opt => {
            if (opt.dataset.color === corAtual) {
                opt.classList.add('selected');
            }
        });
    }

    if (apresentacao.tamanhoTitulo) {
        const slider = document.getElementById('fontSizeSlider');
        slider.value = apresentacao.tamanhoTitulo;
        document.getElementById('fontSizeDisplay').textContent = apresentacao.tamanhoTitulo + 'rem';
    }

    document.getElementById('customizeBackdrop').style.display = 'block';
    document.getElementById('customizePopup').style.display = 'block';
}

function fecharCustomizacao() {
    document.getElementById('customizeBackdrop').style.display = 'none';
    document.getElementById('customizePopup').style.display = 'none';
    dataManager.setCustomizandoId(null);
}

// ==============================================
// CONTROLE DE CLIQUE NO ÍCONE
// ==============================================
function handleIconClick(apresentacaoId, event) {
    event.stopPropagation();
    event.preventDefault();
    console.log('🖱️ Clique no ícone detectado - ID:', apresentacaoId);
    dataManager.mostrarDetalhes(apresentacaoId);
}

// ==============================================
// SISTEMA DE DRAG & DROP
// ==============================================
function habilitarDragAndDrop() {
    const cards = document.querySelectorAll('.flashcard');

    cards.forEach((card, index) => {
        card.draggable = true;
        card.dataset.index = index;

        card.addEventListener('dragstart', function(e) {
            draggedElement = this;
            draggedIndex = parseInt(this.dataset.index);
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            document.querySelectorAll('.flashcard').forEach(c => 
                c.classList.remove('drop-target')
            );
        });

        card.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        card.addEventListener('dragenter', function(e) {
            e.preventDefault();
            if (this !== draggedElement) {
                this.classList.add('drop-target');
            }
        });

        card.addEventListener('dragleave', function() {
            this.classList.remove('drop-target');
        });

        card.addEventListener('drop', function(e) {
            e.preventDefault();

            if (this !== draggedElement) {
                const dropIndex = parseInt(this.dataset.index);
                if (dataManager.getTermoBuscaAtual()) {
                    mostrarNotificacao('Não é possível reorganizar durante uma busca. Limpe a busca primeiro.', 'error');
                    return;
                }
                dataManager.reorganizarApresentacoes(draggedIndex, dropIndex);
            }
        });
    });
}

// ==============================================
// RENDERIZAÇÃO DE CARDS
// ==============================================
function renderizarCards(dadosParaRenderizar) {
    const apresentacoes = dataManager.getApresentacoes();
    if (!dadosParaRenderizar) dadosParaRenderizar = apresentacoes;

    const container = document.getElementById('cardsGrid');

    // Atualizar contador
    const contador = document.getElementById('contadorApresentacoes');
    if (contador) {
        contador.textContent = apresentacoes.length;
    }

    if (dadosParaRenderizar.length === 0) {
        const isFileProtocol = window.location.protocol === 'file:';
        const corsWarning = isFileProtocol ? `
            <div style="margin-bottom: 20px; padding: 15px; background: #fff5f5; border-radius: 8px; border-left: 3px solid #f56565;">
                <h5 style="color: #742a2a; margin-bottom: 10px;">🔒 CORS Detectado (file://)</h5>
                <p style="color: #742a2a;">O carregamento automático está bloqueado porque você está abrindo o arquivo diretamente.</p>
                <p style="color: #742a2a;"><strong>Solução:</strong> Use sempre o botão "📂 Carregar Database.json" para importar dados!</p>
            </div>` : '';

        container.innerHTML = `
            <div class="empty-state">
                <h3>🗃️ Nenhuma apresentação encontrada</h3>
                <div style="margin: 20px 0; padding: 25px; background: #f8fafc; border-radius: 12px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto; border-left: 4px solid #4299e1;">
                    <h4 style="margin-bottom: 20px; color: #2d3748; text-align: center;">📋 Como Começar</h4>
                    ${corsWarning}
                    <div style="margin-bottom: 20px; padding: 15px; background: #e6fffa; border-radius: 8px; border-left: 3px solid #38b2ac;">
                        <h5 style="color: #234e52; margin-bottom: 10px;">🔄 Se você já tem dados:</h5>
                        <p style="color: #234e52;">1. Clique em "📂 Carregar Database.json" no cabeçalho</p>
                        <p style="color: #234e52;">2. Selecione seu arquivo database.json</p>
                        <p style="color: #234e52;">3. Os dados aparecerão automaticamente</p>
                    </div>
                    
                    <div style="margin-bottom: 20px; padding: 15px; background: #fff5e6; border-radius: 8px; border-left: 3px solid #ed8936;">
                        <h5 style="color: #744210; margin-bottom: 10px;">🚀 Primeira vez:</h5>
                        <p style="color: #744210;">1. Clique no cabeçalho "📥 Importar Nova Apresentação"</p>
                        <p style="color: #744210;">2. Preencha apenas o Nome (outros campos são opcionais)</p>
                        <p style="color: #744210;">3. Use "📂 Processar Pasta" para carregar uma pasta completa</p>
                        <p style="color: #744210;">4. Clique "Adicionar" para criar a apresentação</p>
                        <p style="color: #744210;">5. Clique "💾 Salvar Database.json" para baixar</p>
                    </div>
                    
                    <div style="padding: 15px; background: #f0fff4; border-radius: 8px; border-left: 3px solid #48bb78;">
                        <h5 style="color: #22543d; margin-bottom: 10px;">💡 Novidades v2.0:</h5>
                        <p style="color: #22543d;">• Use a busca para encontrar apresentações rapidamente</p>
                        <p style="color: #22543d;">• Arraste e solte para reorganizar as apresentações</p>
                        <p style="color: #22543d;">• Use o botão 🎨 para personalizar cores e fontes</p>
                        <p style="color: #22543d;">• Use o botão 📄 para duplicar apresentações</p>
                        <p style="color: #22543d;">• Clique nas descrições para copiá-las</p>
                        <p style="color: #22543d;">• Sempre salve após fazer mudanças importantes</p>
                    </div>
                </div>
                <p style="margin-top: 20px; font-size: 14px; color: #a0aec0; text-align: center;">
                    💾 <strong>Sistema offline:</strong> Todos os dados ficam no seu computador em database.json
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML = dadosParaRenderizar.map(apresentacao => {
        let caminhoExibicao = '';
        let mostrarCaminho = false; // CORRIGIDO: começa como false
        
        // Só mostra caminho se tiver pasta OU caminho base preenchidos
        if (apresentacao.pasta && apresentacao.pasta.trim()) {
            mostrarCaminho = true;
            if (apresentacao.caminhoBase && apresentacao.caminhoBase.trim()) {
                // Normalizar caminho base para Windows
                const caminhoBaseLimpo = apresentacao.caminhoBase.replace(/\//g, '\\').replace(/\\+$/, '') + '\\';
                caminhoExibicao = `${caminhoBaseLimpo}${apresentacao.pasta}`;
            } else {
                caminhoExibicao = apresentacao.pasta;
            }
        } else if (apresentacao.caminhoBase && apresentacao.caminhoBase.trim()) {
            // Se só tem caminho base mas não tem pasta
            mostrarCaminho = true;
            caminhoExibicao = apresentacao.caminhoBase.replace(/\//g, '\\').replace(/\\+$/, '');
        }
        
        return `
            <div class="flashcard" style="--card-color: ${apresentacao.corFundo || 'linear-gradient(135deg, #667eea, #764ba2)'}; --title-size: ${apresentacao.tamanhoTitulo || 1.3}rem;">
                <div class="card-header">
                    <div class="card-icon" style="background: ${apresentacao.corIcone || apresentacao.corFundo || 'linear-gradient(135deg, #1d2341, #9b4ba2)'}" onclick="window.uiRenderer.handleIconClick(${apresentacao.id}, event)" title="Clique para ver detalhes da estrutura">${apresentacao.icone}</div>
                    <div class="card-title">${apresentacao.nome}</div>
                </div>
                ${apresentacao.descricao ? `<div class="card-description" onclick="window.utilityTools.copiarTextoSeguro(this)" data-texto="${apresentacao.descricao.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}" title="Clique para copiar descrição">${apresentacao.descricao}</div>` : ''}
                ${mostrarCaminho ? `<div class="card-path" data-path="${caminhoExibicao}" onclick="window.utilityTools.copiarCaminhoData(this)" title="Clique para copiar caminho">📂 ${caminhoExibicao} (${apresentacao.arquivos ? apresentacao.arquivos.length : 0} arquivos)</div>` : ''}
                <div style="margin: 10px 0; padding: 8px; background: #f8fafc; border-radius: 6px; font-size: 12px; color: #718096;">
                    ${apresentacao.criado_em ? `📅 Criado: ${new Date(apresentacao.criado_em).toLocaleDateString()}` : ''}
                    ${apresentacao.atualizado_em ? ` | 🔄 Atualizado: ${new Date(apresentacao.atualizado_em).toLocaleDateString()}` : ''}
                </div>
                <div class="card-actions">
                    <div class="card-actions-right">
                        <button class="btn-customize" onclick="window.uiRenderer.abrirCustomizacao(${apresentacao.id})">🎨</button>
                        <button class="btn-edit" onclick="window.dataManager.editarApresentacao(${apresentacao.id})">✏️ Editar</button>
                        <button class="btn-duplicate" onclick="window.dataManager.duplicarApresentacao(${apresentacao.id})" title="Duplicar apresentação">📄 Duplicar</button>
                        <button class="btn-delete" onclick="window.dataManager.excluirApresentacao(${apresentacao.id})">🗑️ Excluir</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Habilitar drag and drop após renderizar
    setTimeout(habilitarDragAndDrop, 100);
}

// ==============================================
// EXIBIÇÃO DE ESTRUTURA
// ==============================================
function exibirEstrutura(apresentacao) {
    const container = document.getElementById('folderTree');
    
    if (!apresentacao.estrutura || apresentacao.estrutura.length === 0) {
        container.innerHTML = `
            <div class="no-files-message">
                <h4>📂 Nenhum arquivo carregado</h4>
                <p>Para ver a estrutura real, edite esta apresentação e carregue os arquivos da pasta.</p>
            </div>
        `;
        return;
    }

    let estruturaHTML = '';
    
    if (apresentacao.arquivos && apresentacao.arquivos.length > 0) {
        estruturaHTML = gerarEstruturaHierarquicaDetalhada(apresentacao);
    } else {
        estruturaHTML = apresentacao.estrutura.map(item => {
            const isFolder = item.includes('📁');
            const isFile = !isFolder && (item.includes('📄') || item.includes('📜') || item.includes('🌐') || item.includes('🎨') || item.includes('🐍') || item.includes('🖼️') || item.includes('🎥') || item.includes('🎵') || item.includes('📦') || item.includes('📊'));
            let className = 'folder-item';
            
            if (isFolder) className += ' folder';
            if (isFile) className += ' file';
            
            return `<div class="${className}">${item}</div>`;
        }).join('');
    }

    container.innerHTML = estruturaHTML;
}

function gerarEstruturaHierarquicaDetalhada(apresentacao) {
    if (!apresentacao.arquivos || apresentacao.arquivos.length === 0) {
        return '<div class="no-files-message"><h4>📂 Nenhum arquivo disponível</h4></div>';
    }

    const arquivosPorPasta = {};
    const pastaRaiz = apresentacao.pasta;
    
    apresentacao.arquivos.forEach(arquivo => {
        const partesPath = arquivo.relativePath.split('/');
        const pastaPai = partesPath.slice(0, -1).join('/') || '';
        
        if (!arquivosPorPasta[pastaPai]) {
            arquivosPorPasta[pastaPai] = [];
        }
        arquivosPorPasta[pastaPai].push(arquivo);
    });

    let estrutura = '';
    const pastasOrdenadas = Object.keys(arquivosPorPasta).sort();
    
    pastasOrdenadas.forEach(pasta => {
        let caminhoCompleto;
        if (apresentacao.caminhoBase) {
            // Normalizar caminho base para Windows
            const caminhoBaseLimpo = apresentacao.caminhoBase.replace(/\//g, '\\').replace(/\\+$/, '') + '\\';
            
            if (pasta === '') {
                caminhoCompleto = `${caminhoBaseLimpo}${pastaRaiz}`;
            } else {
                const pastaLimpa = pasta.replace(/\//g, '\\');
                caminhoCompleto = `${caminhoBaseLimpo}${pastaRaiz}\\${pastaLimpa}`;
            }
        } else {
            caminhoCompleto = pasta === '' ? pastaRaiz : `${pastaRaiz}\\${pasta.replace(/\//g, '\\')}`;
        }
        
        const arquivosDaPasta = arquivosPorPasta[pasta];
        
        if (arquivosDaPasta.length > 0) {
            estrutura += `<div style="margin-bottom: 15px;" class="folder-group">`;
            estrutura += `<div class="folder-header">`;
            
            const caminhoFinalPasta = caminhoCompleto + '\\';
            estrutura += `<a href="#" class="folder-path-link" data-path="${caminhoFinalPasta}" onclick="window.utilityTools.copiarCaminhoData(this)" title="Clique para copiar caminho">📁 ${caminhoFinalPasta}</a>`;
            estrutura += `</div>`;
            
            estrutura += `<div class="file-list">`;
            arquivosDaPasta
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(arquivo => {
                    const icone = utilityTools.getFileIcon(arquivo.name);
                    const caminhoArquivo = `${caminhoCompleto}\\${arquivo.name}`;
                    estrutura += `<div class="file-item">`;
                    estrutura += `↪ <a href="#" class="file-path-link" data-path="${caminhoArquivo}" onclick="window.utilityTools.copiarCaminhoData(this)" title="Clique para copiar caminho">${icone} ${arquivo.name}</a>`;
                    estrutura += `</div>`;
                });
            estrutura += `</div></div>`;
        }
    });
    
    return estrutura || '<div class="no-files-message"><h4>📂 Estrutura vazia</h4></div>';
}

// ==============================================
// SISTEMA DE NOTIFICAÇÕES
// ==============================================
function mostrarNotificacao(texto, tipo = 'info') {
    const mensagem = document.createElement('div');
    mensagem.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 300px;
        background: ${tipo === 'success' ? 'linear-gradient(135deg, #48bb78, #38a169)' : 
                   tipo === 'error' ? 'linear-gradient(135deg, #f56565, #e53e3e)' : 
                   'linear-gradient(135deg, #4299e1, #3182ce)'};
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    `;
    mensagem.textContent = texto;
    
    document.body.appendChild(mensagem);
    setTimeout(() => mensagem.style.opacity = '1', 100);
    setTimeout(() => {
        mensagem.style.opacity = '0';
        setTimeout(() => document.body.removeChild(mensagem), 300);
    }, 3000);
}

// ==============================================
// FUNÇÃO DE LIMPAR BUSCA
// ==============================================
function limparBusca() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').style.display = 'none';
    dataManager.setTermoBuscaAtual('');
    uiRenderer.renderizarCards();

    // NOVO: Minimizar busca após limpar (opcional)
    // toggleSearchSection();
}

// ==============================================
// INICIALIZAÇÃO E EVENT LISTENERS
// ==============================================
document.addEventListener('DOMContentLoaded', function() {
    // Configurar visualização inicial como compacto
    setTimeout(() => mudarVisualizacao('compact'), 100);

    // Inicializar busca minimizada
    initializarBuscaMinimizada();

    // Resto dos event listeners...

    // Seleção de cores no popup de personalização
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('color-option')) {
            document.querySelectorAll('.color-option').forEach(opt => 
                opt.classList.remove('selected')
            );
            e.target.classList.add('selected');
        }
    });

    // Slider de tamanho de fonte
    const fontSlider = document.getElementById('fontSizeSlider');
    if (fontSlider) {
        fontSlider.addEventListener('input', function() {
            document.getElementById('fontSizeDisplay').textContent = this.value + 'rem';
        });
    }

    // Enter para buscar
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                utilityTools.executarBusca();
            }
        });
    }

    // Atualizar preview do ícone
    const iconeSelect = document.getElementById('icone');
    if (iconeSelect) {
        iconeSelect.addEventListener('change', function() {
            document.getElementById('iconPreview').textContent = this.value;
        });
    }
    
    // Fechar modal ao clicar fora
    window.onclick = function(event) {
        const modal = document.getElementById('deleteModal');
        if (event.target === modal) {
            dataManager.fecharModal();
        }
    }
});

// Atalho de tecla: salvar database.json com tecla "S" (ignora campos de texto)
document.addEventListener("keydown", function(event) {
    // Verifica se a tecla pressionada é "S" ou "s" sem outras teclas (Ctrl, Alt, Meta)
    if (event.key.toLowerCase() === "s" && !event.ctrlKey && !event.altKey && !event.metaKey) {
        // Verifica se o usuário está focado em um campo de texto
        const elementoAtivo = document.activeElement;
        const tag = elementoAtivo.tagName.toLowerCase();
        const tiposDeInput = ["input", "textarea", "select"];

        // Se o foco estiver em input, textarea ou select, não faz nada
        if (tiposDeInput.includes(tag)) {
            return;
        }

        // Impede comportamentos padrão (se houver)
        event.preventDefault();

        // Executa salvamento
        dataManager.salvarDados();
    }
});

// NOVA FUNÇÃO: Controlar estado da busca
function initializarBuscaMinimizada() {
    const searchContent = document.getElementById('searchContent');
    const searchIcon = document.getElementById('searchToggleIcon');

    // Iniciar minimizada
    if (searchContent && searchIcon) {
        searchContent.style.display = 'none';
        searchContent.classList.remove('expanded');
        searchIcon.textContent = '🔽';
        searchIcon.classList.remove('rotated');
    }
}

// Expor globalmente para uso no HTML
window.toggleSearchSection = toggleSearchSection;

// Registrar as funções no escopo global para compatibilidade com HTML
window.salvarDados = dataManager.salvarDados;
window.exportarDados = dataManager.exportarDados;
window.tentarCarregarDatabase = dataManager.tentarCarregarDatabase;
window.carregarDatabaseArquivo = dataManager.carregarDatabaseArquivo;

// Expor globalmente para compatibilidade com HTML existente
window.fecharCustomizacao = fecharCustomizacao;

// Funções globais para compatibilidade com HTML
window.toggleImportSection = toggleImportSection;
window.mudarVisualizacao = mudarVisualizacao;
window.adicionarApresentacao = dataManager.adicionarApresentacao;
window.cancelarEdicao = dataManager.cancelarEdicao;
window.confirmarExclusao = dataManager.confirmarExclusao;
window.fecharModal = dataManager.fecharModal;
window.voltarParaLista = dataManager.voltarParaLista;
window.aplicarCustomizacao = dataManager.aplicarCustomizacao;

// Exportar funções para uso nos outros módulos
window.uiRenderer = {
    // Dados
    getVisualizacaoAtual: () => visualizacaoAtual,

    // Funções de interface
    toggleImportSection,
    mudarVisualizacao,
    renderizarCards,
    mostrarNotificacao,
    habilitarDragAndDrop,
    handleIconClick,

    // Funções de personalização
    abrirCustomizacao,
    fecharCustomizacao,

    // Funções de estrutura
    exibirEstrutura,
    gerarEstruturaHierarquicaDetalhada
};
