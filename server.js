const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;

// MIME types para diferentes extensões de arquivo
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown'
};

const server = http.createServer((req, res) => {
  // Parse da URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  
  // Se for a raiz, servir index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Caminho completo do arquivo
  const filePath = path.join(__dirname, pathname);
  
  // Verificar se o arquivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Se não encontrar index.html, criar uma página de listagem
      if (pathname === '/index.html') {
        createDirectoryListing(res);
      } else {
        send404(res, pathname);
      }
    } else {
      // Verificar se é um diretório
      fs.stat(filePath, (err, stats) => {
        if (err) {
          send500(res, err);
        } else if (stats.isDirectory()) {
          // Se for diretório, tentar servir index.html dentro dele
          const indexPath = path.join(filePath, 'index.html');
          fs.access(indexPath, fs.constants.F_OK, (err) => {
            if (err) {
              createDirectoryListing(res, filePath);
            } else {
              serveFile(res, indexPath);
            }
          });
        } else {
          // Servir o arquivo
          serveFile(res, filePath);
        }
      });
    }
  });
});

function serveFile(res, filePath) {
  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      send500(res, err);
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end(content);
    }
  });
}

function createDirectoryListing(res, dirPath = __dirname) {
  fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      send500(res, err);
      return;
    }
    
    const fileList = files
      .filter(file => !file.name.startsWith('.')) // Ocultar arquivos ocultos
      .map(file => {
        const icon = file.isDirectory() ? '📁' : getFileIcon(file.name);
        const type = file.isDirectory() ? 'pasta' : 'arquivo';
        return `
          <div class="file-item">
            <span class="file-icon">${icon}</span>
            <a href="/${file.name}" class="file-link">
              ${file.name}
            </a>
            <span class="file-type">${type}</span>
          </div>
        `;
      })
      .join('');
    
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Organização - Servidor Local</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .server-info {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 5px solid #667eea;
        }
        
        .file-grid {
            display: grid;
            gap: 15px;
            margin-top: 20px;
        }
        
        .file-item {
            display: flex;
            align-items: center;
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 1px solid #e9ecef;
        }
        
        .file-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            border-color: #667eea;
        }
        
        .file-icon {
            font-size: 2em;
            margin-right: 15px;
            min-width: 50px;
            text-align: center;
        }
        
        .file-link {
            flex: 1;
            text-decoration: none;
            color: #333;
            font-weight: 500;
            font-size: 1.1em;
        }
        
        .file-link:hover {
            color: #667eea;
        }
        
        .file-type {
            color: #6c757d;
            font-size: 0.9em;
            text-transform: uppercase;
            font-weight: 500;
        }
        
        .status {
            color: #28a745;
            font-weight: bold;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #6c757d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Sistema de Organização</h1>
        
        <div class="server-info">
            <h3>📡 Servidor Local Ativo</h3>
            <p><strong>Status:</strong> <span class="status">Online</span></p>
            <p><strong>Porta:</strong> ${PORT}</p>
            <p><strong>URL:</strong> http://localhost:${PORT}</p>
            <p><strong>Diretório:</strong> ${dirPath}</p>
        </div>
        
        <h3>📂 Arquivos Disponíveis:</h3>
        <div class="file-grid">
            ${fileList || '<p style="text-align: center; color: #6c757d;">Nenhum arquivo encontrado no diretório.</p>'}
        </div>
        
        <div class="footer">
            <p>💡 Desenvolvido para organização inteligente de arquivos e documentos</p>
            <p>HTML, CSS e JavaScript puro - Sem dependências externas</p>
        </div>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(html);
  });
}

function getFileIcon(filename) {
  const ext = path.extname(filename).toLowerCase();
  const iconMap = {
    '.html': '🌐',
    '.css': '🎨',
    '.js': '⚡',
    '.json': '📋',
    '.md': '📝',
    '.txt': '📄',
    '.pdf': '📕',
    '.png': '🖼️',
    '.jpg': '🖼️',
    '.jpeg': '🖼️',
    '.gif': '🖼️',
    '.svg': '🎯',
    '.mp4': '🎬',
    '.mp3': '🎵',
    '.zip': '📦',
    '.rar': '📦'
  };
  return iconMap[ext] || '📄';
}

function send404(res, pathname) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>404 - Não Encontrado</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
        h1 { color: #e74c3c; }
    </style>
</head>
<body>
    <h1>404 - Arquivo Não Encontrado</h1>
    <p>O arquivo <strong>${pathname}</strong> não foi encontrado.</p>
    <p><a href="/">← Voltar para o início</a></p>
</body>
</html>`;
  
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function send500(res, error) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end(`Erro interno do servidor: ${error.message}`);
}

server.listen(PORT, () => {
  console.log(`
🚀 Servidor iniciado com sucesso!
📡 Acesse: http://localhost:${PORT}
📁 Diretório: ${__dirname}
⏹️  Para parar: Ctrl+C
  `);
});

// Tratamento para encerramento gracioso
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso!');
    process.exit(0);
  });
});