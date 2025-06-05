/*
===============================================
UTILITY TOOLS - Camada de Ferramentas e Utilidades
===============================================
Responsável por funções auxiliares, processamento de pastas e sistema de busca
*/

// ==============================================
// SISTEMA DE BUSCA AVANÇADO
// ==============================================
function executarBusca() {
    const termo = document.getElementById('searchInput').value.trim();
    if (!termo) {
        limparBusca();
        return;
    }

    dataManager.setTermoBuscaAtual(termo);
    const resultados = buscarApresentacoes(termo);
    exibirResultadosBusca(resultados, termo);
}

function limparBusca() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').style.display = 'none';
    dataManager.setTermoBuscaAtual('');
    uiRenderer.renderizarCards();
}

function buscarApresentacoes(termo) {
    if (!termo) return dataManager.getApresentacoes();

    const termosProcessados = processarTermoBusca(termo);
    
    return dataManager.getApresentacoes().filter(apresentacao => {
        const texto = criarTextoParaBusca(apresentacao);
        return termosProcessados.some(termoPro => 
            verificarCorrespondencia(texto, termoPro)
        );
    });
}

function processarTermoBusca(termo) {
    const termos = [];
    
    // Busca com aspas (exata)
    const aspasRegex = /"([^"]+)"/g;
    let match;
    while ((match = aspasRegex.exec(termo)) !== null) {
        termos.push({
            tipo: 'exato',
            valor: match[1].toLowerCase()
        });
        termo = termo.replace(match[0], '');
    }
    
    // Busca com wildcards
    const palavras = termo.split(/\s+/).filter(p => p.length > 0);
    palavras.forEach(palavra => {
        if (palavra.includes('*')) {
            termos.push({
                tipo: 'wildcard',
                valor: palavra.toLowerCase()
            });
        } else {
            termos.push({
                tipo: 'normal',
                valor: palavra.toLowerCase()
            });
        }
    });
    
    return termos;
}

function criarTextoParaBusca(apresentacao) {
    const textos = [
        apresentacao.nome || '',
        apresentacao.descricao || '',
        apresentacao.pasta || '',
        apresentacao.caminhoBase || ''
    ];
    
    // Adicionar textos dos arquivos
    if (apresentacao.arquivos) {
        apresentacao.arquivos.forEach(arquivo => {
            textos.push(arquivo.name || '');
            textos.push(arquivo.path || '');
            textos.push(arquivo.relativePath || '');
        });
    }
    
    // Adicionar estrutura
    if (apresentacao.estrutura) {
        textos.push(...apresentacao.estrutura);
    }
    
    return textos.join(' ').toLowerCase();
}

function verificarCorrespondencia(texto, termo) {
    switch (termo.tipo) {
        case 'exato':
            return texto.includes(termo.valor);
        case 'wildcard':
            const regex = new RegExp(
                termo.valor.replace(/\*/g, '.*'),
                'i'
            );
            return regex.test(texto);
        case 'normal':
            return texto.includes(termo.valor);
        default:
            return false;
    }
}

function exibirResultadosBusca(resultados, termo) {
    const container = document.getElementById('searchResults');
    
    if (resultados.length === 0) {
        container.innerHTML = `❌ Nenhum resultado encontrado para: <strong>"${termo}"</strong>`;
        container.style.display = 'block';
        document.getElementById('cardsGrid').innerHTML = '<div class="empty-state"><h3>Nenhum resultado encontrado</h3><p>Tente outros termos de busca</p></div>';
    } else {
        container.innerHTML = `✅ ${resultados.length} resultado(s) encontrado(s) para: <strong>"${termo}"</strong>`;
        container.style.display = 'block';
        uiRenderer.renderizarCards(resultados);
    }
}

// ==============================================
// PROCESSAMENTO DE PASTAS
// ==============================================
function processarPasta() {
    const fileInput = document.getElementById('fileInput');
    const files = Array.from(fileInput.files);
    
    if (files.length === 0) {
        alert('Por favor, selecione uma pasta primeiro!\n\nDica: Use o botão "Escolher arquivos" e selecione uma pasta inteira.');
        return;
    }

    const pastaRaiz = files[0].webkitRelativePath.split('/')[0];
    
    // Sugerir caminho base baseado no OS
    const isWindows = navigator.platform.indexOf('Win') > -1;
    const isMac = navigator.platform.indexOf('Mac') > -1;
    let caminhoBaseSugerido = '';
    
    if (isWindows) {
        caminhoBaseSugerido = 'C:\\Projetos\\';
    } else if (isMac) {
        caminhoBaseSugerido = '/Users/' + (process?.env?.USER || 'usuario') + '/projetos/';
    } else {
        caminhoBaseSugerido = '/home/usuario/projetos/';
    }
    
    const caminhoBaseInput = document.getElementById('caminhoBase');
    if (!caminhoBaseInput.value.trim()) {
        caminhoBaseInput.placeholder = `Ex: ${caminhoBaseSugerido}`;
    }
    
    dataManager.setArquivosCarregados(files.map(file => ({
        name: file.name,
        path: file.webkitRelativePath,
        relativePath: file.webkitRelativePath.substring(pastaRaiz.length + 1),
        size: file.size,
        type: file.type || 'unknown',
        lastModified: file.lastModified
    })));

    document.getElementById('pasta').value = pastaRaiz;
    mostrarPastaCarregada();
    uiRenderer.mostrarNotificacao(`Pasta "${pastaRaiz}" carregada com ${files.length} arquivos!`, 'success');
    
    if (!caminhoBaseInput.value.trim()) {
        setTimeout(() => {
            uiRenderer.mostrarNotificacao('💡 Defina um "Caminho Base" para caminhos completos!', 'info');
        }, 2000);
    }
}

function mostrarPastaCarregada() {
    const container = document.getElementById('uploadedFiles');
    const arquivosCarregados = dataManager.getArquivosCarregados();
    
    if (arquivosCarregados.length === 0) {
        container.innerHTML = '';
        return;
    }

    const estruturaHierarquica = gerarEstruturaHierarquica();
    const pastaRaiz = arquivosCarregados[0].path.split('/')[0];

    container.innerHTML = `
        <h5 style="margin-bottom: 15px; color: #4a5568;">📁 Pasta Carregada: <strong>${pastaRaiz}</strong></h5>
        <div style="background: #f8fafc; border-radius: 8px; padding: 15px; max-height: 300px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.6;">
            ${estruturaHierarquica}
        </div>
        <div style="margin-top: 10px; padding: 10px; background: #e6fffa; border-radius: 6px; font-size: 12px; color: #234e52;">
            📊 <strong>Total:</strong> ${arquivosCarregados.length} arquivos | 
            📁 <strong>Pastas:</strong> ${contarPastas()} | 
            💾 <strong>Tamanho:</strong> ${formatarTamanho(calcularTamanhoTotal())}
        </div>
    `;
}

function gerarEstruturaHierarquica() {
    const arquivosCarregados = dataManager.getArquivosCarregados();
    if (arquivosCarregados.length === 0) return '';

    const caminhoBase = document.getElementById('caminhoBase').value.trim();
    const pastaRaiz = arquivosCarregados[0].path.split('/')[0];
    const arquivosPorPasta = {};
    
    arquivosCarregados.forEach(arquivo => {
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
        if (caminhoBase) {
            // Normalizar caminho base
            const caminhoBaseLimpo = caminhoBase.replace(/\//g, '\\').replace(/\\+$/, '') + '\\';
            
            if (pasta === '') {
                caminhoCompleto = `${caminhoBaseLimpo}${pastaRaiz}`;
            } else {
                const pastaLimpa = pasta.replace(/\//g, '\\');
                caminhoCompleto = `${caminhoBaseLimpo}${pastaRaiz}\\${pastaLimpa}`;
            }
        } else {
            caminhoCompleto = pasta === '' ? 
                `📁 ${pastaRaiz}` : 
                `📁 ${pastaRaiz}/${pasta}`;
        }
        
        const arquivosDaPasta = arquivosPorPasta[pasta];
        
        if (arquivosDaPasta.length > 0) {
            estrutura += `<div style="margin-bottom: 15px;">`;
            estrutura += `<div style="color: #2b6cb0; font-weight: 600; margin-bottom: 8px; padding: 5px 0; border-bottom: 1px solid #e2e8f0;">`;
            
            if (caminhoBase) {
                const caminhoFinal = caminhoCompleto + '\\';
                estrutura += `<a href="#" class="folder-path-link" data-path="${caminhoFinal}" onclick="window.utilityTools.copiarCaminhoData(this)" title="Clique para copiar: ${caminhoFinal}">📁 ${caminhoFinal}</a>`;
            } else {
                estrutura += `<span style="color: #a0aec0;" title="💡 Configure um 'Caminho Base' para caminhos completos">${caminhoCompleto}</span>`;
                estrutura += ` <small style="color: #e53e3e; font-size: 11px;">(relativo - configure Caminho Base)</small>`;
            }
            
            estrutura += `</div>`;
            estrutura += `<div style="margin-left: 20px; border-left: 2px solid #e2e8f0; padding-left: 15px;">`;
            
            arquivosDaPasta
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(arquivo => {
                    const icone = getFileIcon(arquivo.name);
                    
                    if (caminhoBase) {
                        const caminhoArquivo = `${caminhoCompleto}\\${arquivo.name}`;
                        estrutura += `<div style="margin: 3px 0; padding: 2px 0; color: #38a169;">`;
                        estrutura += `↪ <a href="#" class="file-path-link" data-path="${caminhoArquivo}" onclick="window.utilityTools.copiarCaminhoData(this)" title="Clique para copiar: ${caminhoArquivo}">${icone} ${arquivo.name}</a>`;
                        estrutura += `</div>`;
                    } else {
                        estrutura += `<div style="margin: 3px 0; padding: 2px 0; color: #718096;">`;
                        estrutura += `↪ ${icone} ${arquivo.name} <small style="color: #a0aec0;">(configure Caminho Base para link)</small>`;
                        estrutura += `</div>`;
                    }
                });
            estrutura += `</div></div>`;
        }
    });
    
    return estrutura;
}

function gerarEstruturaDosArquivos() {
    const arquivosCarregados = dataManager.getArquivosCarregados();
    
    if (arquivosCarregados.length === 0) {
        return ['📄 Nenhuma pasta carregada ainda', '💡 Use o botão "📂 Processar Pasta" acima para carregar uma pasta completa'];
    }

    const arquivosPorPasta = {};
    const pastaRaiz = arquivosCarregados[0].path.split('/')[0];
    
    arquivosCarregados.forEach(arquivo => {
        const partesPath = arquivo.relativePath.split('/');
        const pastaPai = partesPath.slice(0, -1).join('/') || '';
        
        if (!arquivosPorPasta[pastaPai]) {
            arquivosPorPasta[pastaPai] = [];
        }
        arquivosPorPasta[pastaPai].push(arquivo);
    });

    const estrutura = [];
    const pastasOrdenadas = Object.keys(arquivosPorPasta).sort();
    
    pastasOrdenadas.forEach(pasta => {
        const caminhoCompleto = pasta === '' ? pastaRaiz : `${pastaRaiz}/${pasta}`;
        const arquivosDaPasta = arquivosPorPasta[pasta];
        
        if (arquivosDaPasta.length > 0) {
            estrutura.push(`📁 ${caminhoCompleto}\\`);
            
            arquivosDaPasta
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(arquivo => {
                    const icone = getFileIcon(arquivo.name);
                    estrutura.push(`    ↪ ${icone} ${arquivo.name}`);
                });
            
            estrutura.push('');
        }
    });
    
    return estrutura.length > 0 ? estrutura : ['📄 Nenhum arquivo encontrado na pasta'];
}

function contarPastas() {
    const arquivosCarregados = dataManager.getArquivosCarregados();
    const pastas = new Set();
    arquivosCarregados.forEach(arquivo => {
        const partesPath = arquivo.relativePath.split('/');
        for (let i = 0; i < partesPath.length - 1; i++) {
            pastas.add(partesPath.slice(0, i + 1).join('/'));
        }
    });
    return pastas.size;
}

function calcularTamanhoTotal() {
    const arquivosCarregados = dataManager.getArquivosCarregados();
    return arquivosCarregados.reduce((total, arquivo) => total + arquivo.size, 0);
}

// ==============================================
// SISTEMA DE CÓPIA DE CAMINHOS E TEXTOS
// ==============================================
function copiarCaminhoData(elemento) {
    const caminho = elemento.dataset.path;
    
    // Log detalhado para debug
    console.log('🔧 DEBUG CÓPIA DATA:');
    console.log('   📥 Data-path:', caminho);
    console.log('   📏 Tamanho:', caminho.length);
    
    // Normalização para Windows
    let caminhoNormalizado = caminho
        .replace(/\//g, '\\')                    // Converter / para \
        .replace(/\\+/g, '\\');                  // Múltiplas barras para uma
    
    // Garantir que não termina com dupla barra desnecessária
    if (caminhoNormalizado.endsWith('\\\\')) {
        caminhoNormalizado = caminhoNormalizado.slice(0, -1);
    }
    
    console.log('   ✅ Normalizado:', caminhoNormalizado);
    
    // Método moderno: Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(caminhoNormalizado).then(() => {
            mostrarNotificacaoCopia(caminhoNormalizado);
        }).catch(() => {
            copiarTextoFallback(caminhoNormalizado, 'Caminho');
        });
    } else {
        copiarTextoFallback(caminhoNormalizado, 'Caminho');
    }
}

function copiarCaminho(caminho) {
    // Primeiro, decodificar qualquer escape que veio do HTML
    let caminhoDecodificado = caminho
        .replace(/\\\\/g, '\\')                  // Duplas barras para simples
        .replace(/\\'/g, "'");                   // Aspas escapadas
    
    // Normalização completa para Windows
    let caminhoNormalizado = caminhoDecodificado
        .replace(/\//g, '\\')                    // Converter / para \
        .replace(/\\+/g, '\\');                  // Múltiplas barras para uma
    
    // Garantir que não termina com dupla barra
    if (caminhoNormalizado.endsWith('\\\\')) {
        caminhoNormalizado = caminhoNormalizado.slice(0, -1);
    }
    
    // Log detalhado para debug
    console.log('🔧 DEBUG CÓPIA:');
    console.log('   📥 Recebido:', caminho);
    console.log('   🔄 Decodificado:', caminhoDecodificado);
    console.log('   ✅ Normalizado:', caminhoNormalizado);
    console.log('   📏 Tamanho final:', caminhoNormalizado.length);
    
    // Método moderno: Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(caminhoNormalizado).then(() => {
            mostrarNotificacaoCopia(caminhoNormalizado);
        }).catch(() => {
            copiarTextoFallback(caminhoNormalizado, 'Caminho');
        });
    } else {
        copiarTextoFallback(caminhoNormalizado, 'Caminho');
    }
}

// NOVA FUNÇÃO: Copiar texto de forma mais segura usando data attributes
function copiarTextoSeguro(elemento) {
    const texto = elemento.dataset.texto;
    
    if (!texto) {
        console.error('❌ Nenhum texto encontrado no data-texto');
        uiRenderer.mostrarNotificacao('Erro: texto não encontrado', 'error');
        return;
    }

    // Decodificar HTML entities
    const textoDecodificado = texto
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
    
    console.log('🔧 DEBUG CÓPIA SEGURA:');
    console.log('   📥 Data-texto:', texto);
    console.log('   ✅ Decodificado:', textoDecodificado);
    console.log('   📏 Tamanho:', textoDecodificado.length);
    
    // Método moderno: Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textoDecodificado).then(() => {
            mostrarNotificacaoTexto(textoDecodificado, 'Descrição');
        }).catch((err) => {
            console.error('Erro na Clipboard API:', err);
            copiarTextoFallback(textoDecodificado, 'Descrição');
        });
    } else {
        copiarTextoFallback(textoDecodificado, 'Descrição');
    }
}

// FUNÇÃO MELHORADA: Copiar texto genérico com melhor tratamento de erro
function copiarTexto(texto, tipo = 'Texto') {
    // Tratamento mais robusto de caracteres especiais
    let textoLimpo;
    
    try {
        textoLimpo = texto
            .replace(/\\'/g, "'")                    // Remove escapes de aspas simples
            .replace(/\\"/g, '"')                    // Remove escapes de aspas duplas
            .replace(/\\\\/g, '\\')                  // Remove escapes de barras
            .replace(/\\n/g, '\n')                   // Converte quebras de linha
            .replace(/\\t/g, '\t')                   // Converte tabs
            .trim();                                 // Remove espaços extras
    } catch (error) {
        console.error('Erro ao processar texto:', error);
        textoLimpo = String(texto).trim(); // Fallback para conversão simples
    }
    
    console.log('🔧 DEBUG CÓPIA DE TEXTO:');
    console.log('   📥 Recebido:', texto);
    console.log('   ✅ Limpo:', textoLimpo);
    console.log('   📏 Tamanho:', textoLimpo.length);
    
    // Método moderno: Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textoLimpo).then(() => {
            mostrarNotificacaoTexto(textoLimpo, tipo);
        }).catch((err) => {
            console.error('Erro na Clipboard API:', err);
            copiarTextoFallback(textoLimpo, tipo);
        });
    } else {
        copiarTextoFallback(textoLimpo, tipo);
    }
}

function copiarTextoFallback(texto, tipo = 'Texto') {
    const textArea = document.createElement('textarea');
    textArea.value = texto;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        if (tipo === 'Caminho') {
            mostrarNotificacaoCopia(texto);
        } else {
            mostrarNotificacaoTexto(texto, tipo);
        }
    } catch (err) {
        console.error('Erro ao copiar:', err);
        uiRenderer.mostrarNotificacao(`Erro ao copiar ${tipo.toLowerCase()}`, 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

// FUNÇÃO DE NOTIFICAÇÃO PARA CAMINHO COPIADO SEM SCROLL AUTOMÁTICO
function mostrarNotificacaoCopia(caminho) {
    const notification = document.getElementById('copyNotification');
    
    // Mostrar exatamente o que foi copiado
    notification.innerHTML = `
        📋 <strong>Caminho copiado:</strong><br>
        <code style="background: rgba(255,255,255,0.2); padding: 2px 4px; border-radius: 3px; font-size: 11px;">${caminho}</code>
    `;
    notification.classList.add('show');
    
    // Removido scroll automático
    
    // Console log para debug
    console.log('✅ Caminho copiado com sucesso:', caminho);
    console.log('📏 Tamanho:', caminho.length, 'caracteres');
    console.log('🔧 Contém barras:', caminho.includes('\\') ? 'SIM (\\)' : caminho.includes('/') ? 'SIM (/)' : 'NÃO');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// FUNÇÃO DE NOTIFICAÇÃO PARA TEXTO COPIADO SEM SCROLL AUTOMÁTICO
function mostrarNotificacaoTexto(texto, tipo) {
    const notification = document.getElementById('copyNotification');
    
    // Exibir o texto copiado (limitado para não quebrar o layout)
    const textoExibicao = texto.length > 100 ? texto.substring(0, 100) + '.' : texto;
    
    notification.innerHTML = `
        📋 <strong>${tipo} copiado:</strong><br>
        <code style="background: rgba(255,255,255,0.2); padding: 2px 4px; border-radius: 3px; font-size: 11px;">${textoExibicao}</code>
    `;
    notification.classList.add('show');
    
    // Removido scroll automático
    
    // Console log para debug
    console.log(`✅ ${tipo} copiado com sucesso:`, texto);
    console.log('📏 Tamanho:', texto.length, 'caracteres');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// NOVA FUNÇÃO: Notificação para textos genéricos
function mostrarNotificacaoTexto(texto, tipo) {
    const notification = document.getElementById('copyNotification');
    
    // Exibir o texto copiado (limitado para não quebrar o layout)
    const textoExibicao = texto.length > 100 ? texto.substring(0, 100) + '...' : texto;
    
    notification.innerHTML = `
        📋 <strong>${tipo} copiado:</strong><br>
        <code style="background: rgba(255,255,255,0.2); padding: 2px 4px; border-radius: 3px; font-size: 11px;">${textoExibicao}</code>
    `;
    notification.classList.add('show');
    
    // Scroll suave para o topo
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Console log para debug
    console.log(`✅ ${tipo} copiado com sucesso:`, texto);
    console.log('📏 Tamanho:', texto.length, 'caracteres');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// ==============================================
// FUNÇÕES DE INFORMAÇÃO
// ==============================================
function mostrarEstatisticas() {
    const apresentacoes = dataManager.getApresentacoes();
    const totalApresentacoes = apresentacoes.length;
    const totalArquivos = apresentacoes.reduce((total, p) => total + (p.arquivos?.length || 0), 0);
    const tiposArquivos = {};
    
    apresentacoes.forEach(p => {
        if (p.arquivos) {
            p.arquivos.forEach(arquivo => {
                const ext = arquivo.name.split('.').pop().toLowerCase();
                tiposArquivos[ext] = (tiposArquivos[ext] || 0) + 1;
            });
        }
    });
    
    const iconesMaisUsados = {};
    apresentacoes.forEach(p => {
        iconesMaisUsados[p.icone] = (iconesMaisUsados[p.icone] || 0) + 1;
    });

    const coresUsadas = {};
    apresentacoes.forEach(p => {
        if (p.corFundo) {
            coresUsadas[p.corFundo] = (coresUsadas[p.corFundo] || 0) + 1;
        }
    });
    
    const dadosString = JSON.stringify(apresentacoes);
    const tamanhoAtual = new Blob([dadosString]).size;
    
    alert(`📊 ESTATÍSTICAS DO MAPA MENTAL v2.0

📁 Total de Apresentações: ${totalApresentacoes}
📄 Total de Arquivos: ${totalArquivos}
💾 Tamanho dos Dados: ${(tamanhoAtual / 1024).toFixed(2)} KB

🔥 Ícones Mais Usados:
${Object.entries(iconesMaisUsados)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([icone, qtd]) => `${icone} ${qtd}x`)
  .join('\n') || 'Nenhum dado'}

🎨 Personalizações:
${Object.keys(coresUsadas).length} cores diferentes usadas
${apresentacoes.filter(p => p.tamanhoTitulo && p.tamanhoTitulo !== 1.3).length} títulos personalizados

📋 Tipos de Arquivo:
${Object.entries(tiposArquivos)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([tipo, qtd]) => `.${tipo}: ${qtd}`)
  .join('\n') || 'Nenhum arquivo'}

🔍 Busca Atual: ${dataManager.getTermoBuscaAtual() || 'Nenhuma'}
👁️ Visualização: ${window.uiRenderer.getVisualizacaoAtual ? window.uiRenderer.getVisualizacaoAtual() : 'grid'}

🕒 Última Atualização: ${new Date().toLocaleString()}

📂 Arquivo: database.json v2.0
💡 Novidades: Busca avançada, drag&drop, personalização`);
}

function mostrarAjuda() {
    const isFileProtocol = window.location.protocol === 'file:';
    const corsInfo = isFileProtocol ? `

🔒 PROBLEMA CORS DETECTADO:
Você está abrindo o arquivo diretamente no navegador (file://)
Isso bloqueia o carregamento automático do database.json

✅ SOLUÇÕES:
1. Use o botão "📂 Carregar Database.json" (sempre funciona)
2. Use um servidor local:
   • Python: python -m http.server 8000
   • Node.js: npx serve
   • Live Server (VS Code)
3. Coloque em um servidor web

` : '';
    
    alert(`❓ COMO USAR O MAPA MENTAL ORGANIZACIONAL v2.0

🚀 PRIMEIRO USO:
1. Clique em "📥 Importar Nova Apresentação" para expandir
2. ⭐ CONFIGURE "Caminho Base" (Ex: C:\\Projetos\\ ou /home/user/projetos/)
3. Carregue uma pasta completa usando "📂 Processar Pasta"  
4. Clique "💾 Salvar Database.json"

🔗 CAMINHO BASE (IMPORTANTE!):
• Campo opcional que define onde seus projetos ficam
• Windows: C:\\Projetos\\ ou D:\\MeusProjetos\\
• Mac/Linux: /home/usuario/projetos/ ou ~/projetos/
• Com isso, você terá caminhos completos clicáveis!
• SEM caminho base = apenas caminhos relativos${corsInfo}

🔍 BUSCA AVANÇADA (NOVO!):
• Use * como wildcard: *teste* encontra qualquer coisa com "teste"
• Use aspas para busca exata: "projeto final"
• Busca em: nome, descrição, pasta, arquivos, caminhos
• Combine termos: python *2024* "projeto"

🎨 PERSONALIZAÇÃO (NOVO!):
• Botão 🎨 em cada apresentação
• 12 cores de fundo diferentes
• Tamanho de título ajustável
• Personalizações são salvas no database.json

🖱️ DRAG & DROP (NOVO!):
• Arraste qualquer card para reorganizar (cursor de 🤏 grab)
• Funciona como no Windows Explorer
• NÃO funciona durante uma busca ativa
• CLIQUE no ÍCONE do card para ver detalhes da estrutura
• Ícone ⋮⋮ aparece no hover indicando área de arraste

👁️ MODOS DE VISUALIZAÇÃO (NOVO!):
• 🔲 Grade: Cards em grid responsivo
• 📋 Lista: Cards em linha única
• 🗃️ Compacto: Cards menores em grid

📁 CAMINHOS E TEXTOS CLICÁVEIS (NOVO!):
• 🔗 Links azuis/verdes copiam caminhos
• 📋 Descrições copiam texto ao clicar
• Cópia automática para área de transferência
• Scroll para topo após cópia
• Usa barras invertidas \\ corretas no Windows
• Console do navegador (F12) mostra logs de debug

🔄 USO DIÁRIO:
• Use "📂 Carregar Database.json" para importar dados
• Trabalhe normalmente (adicionar, editar, excluir)  
• Salve sempre após mudanças importantes`);
}

// ==============================================
// FUNÇÕES UTILITÁRIAS
// ==============================================
function formatarTamanho(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'js': '📜', 'html': '🌐', 'css': '🎨', 'json': '📋',
        'py': '🐍', 'java': '☕', 'cpp': '⚙️', 'c': '⚙️',
        'txt': '📄', 'md': '📝', 'pdf': '📕', 'doc': '📘', 'docx': '📘',
        'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️', 'svg': '🖼️',
        'mp4': '🎥', 'avi': '🎥', 'mov': '🎥',
        'mp3': '🎵', 'wav': '🎵', 'ogg': '🎵',
        'zip': '📦', 'rar': '📦', '7z': '📦',
        'xlsx': '📊', 'xls': '📊', 'csv': '📊'
    };
    return icons[ext] || '📄';
}

// ==============================================
// TESTE E DIAGNÓSTICO DE CÓPIA
// ==============================================
function testarCopia() {
    const caminhoTeste1 = 'C:/Projetos/MeuProjeto/src/components/Button.jsx';
    const caminhoTeste2 = 'C:\\Projetos\\MeuProjeto\\src\\components\\Button.jsx';
    const caminhoTeste3 = 'C://Projetos//MeuProjeto//src//components//Button.jsx';
    
    console.log('🧪 ===== TESTE DE CÓPIA - MÚLTIPLOS FORMATOS =====');
    
    console.log('\n📝 Teste 1 - Barras normais (/):');
    copiarCaminho(caminhoTeste1);
    
    setTimeout(() => {
        console.log('\n📝 Teste 2 - Barras Windows (\\):');
        copiarCaminho(caminhoTeste2);
    }, 1000);
    
    setTimeout(() => {
        console.log('\n📝 Teste 3 - Barras duplas (//):');
        copiarCaminho(caminhoTeste3);
    }, 2000);
    
    setTimeout(() => {
        console.log('\n🏁 Testes concluídos! Verifique as notificações.');
    }, 3000);
}

// NOVA FUNÇÃO: Teste específico para descrições problemáticas
function testarDescricoes() {
    console.log('🧪 ===== TESTE DE DESCRIÇÕES PROBLEMÁTICAS =====');
    
    const textosProblematicos = [
        'Descrição simples',
        'Texto com "aspas duplas"',
        "Texto com 'aspas simples'",
        'Texto com \\ barras invertidas',
        'Texto com quebra\nde linha',
        'Texto com símbolos: @#$%^&*()',
        'Texto com acentos: ção, não, além',
        'Texto longo que pode causar problemas quando tem muitos caracteres especiais e quebras de linha e aspas "duplas" e \'simples\' ao mesmo tempo',
        '',  // Texto vazio
        '   ', // Apenas espaços
    ];
    
    textosProblematicos.forEach((texto, index) => {
        setTimeout(() => {
            console.log(`\n📝 Teste ${index + 1}:`, texto);
            copiarTexto(texto, `Teste ${index + 1}`);
        }, index * 500);
    });
    
    setTimeout(() => {
        console.log('\n🏁 Testes de descrição concluídos!');
    }, textosProblematicos.length * 500 + 1000);
}

// FUNÇÃO DE DIAGNÓSTICO: Verificar todos os cards com problemas de cópia
function diagnosticarCards() {
    console.log('🔍 ===== DIAGNÓSTICO DE CARDS =====');
    
    const cards = document.querySelectorAll('.card-description');
    console.log(`📊 Total de cards encontrados: ${cards.length}`);
    
    cards.forEach((card, index) => {
        const dataTexto = card.dataset.texto;
        const textoVisivel = card.textContent;
        const temOnclick = card.onclick !== null;
        
        console.log(`\n📋 Card ${index + 1}:`);
        console.log('   📄 Texto visível:', textoVisivel?.substring(0, 50) + (textoVisivel?.length > 50 ? '...' : ''));
        console.log('   📄 Data-texto:', dataTexto?.substring(0, 50) + (dataTexto?.length > 50 ? '...' : ''));
        console.log('   🖱️ Tem onclick:', temOnclick);
        console.log('   📏 Tamanho data:', dataTexto?.length || 0);
        console.log('   ⚠️ Caracteres problemáticos:', 
            (dataTexto?.includes('"') ? 'aspas-duplas ' : '') +
            (dataTexto?.includes("'") ? 'aspas-simples ' : '') +
            (dataTexto?.includes('\\') ? 'barras ' : '') +
            (dataTexto?.includes('\n') ? 'quebras-linha ' : '') ||
            'nenhum'
        );
    });
    
    console.log('\n🏁 Diagnóstico concluído! Verifique os logs acima.');
}

// Exportar funções para uso nos outros módulos
window.utilityTools = {
    // Funções de processamento
    processarPasta,
    mostrarPastaCarregada,
    gerarEstruturaDosArquivos,
    gerarEstruturaHierarquica,
    
    // Sistema de busca
    buscarApresentacoes,
    executarBusca,
    limparBusca,
    
    // Funções de cópia
    copiarCaminho,
    copiarCaminhoData,
    copiarTexto,
    copiarTextoSeguro,
    
    // Utilidades
    getFileIcon,
    formatarTamanho,
    
    // Informações e debug
    mostrarEstatisticas,
    mostrarAjuda,
    testarCopia,
    testarDescricoes,
    diagnosticarCards
};

// Expor funções globalmente para compatibilidade com HTML
window.processarPasta = processarPasta;
window.executarBusca = executarBusca;
window.limparBusca = limparBusca;
window.mostrarEstatisticas = mostrarEstatisticas;
window.mostrarAjuda = mostrarAjuda;