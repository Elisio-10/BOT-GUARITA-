# 🤖 WhatsApp Group Manager Bot - Startup Edition

Este é um bot de automação avançada para gerenciamento de grupos de WhatsApp, desenvolvido com **Node.js** e a biblioteca **Baileys**. O sistema foi projetado para ser escalável, permitindo atualizações em tempo real e uma base sólida para crescimento.

## 🚀 Funcionalidades

O bot responde a comandos de administradores para facilitar a gestão de comunidades e grupos de postos de combustível ou qualquer outro nicho.

| Comando | Descrição |
| :--- | :--- |
| `.abrir` | Libera o grupo para que todos os membros enviem mensagens. |
| `.fechar` | Restringe o envio de mensagens apenas para administradores. |
| `.silenciar` | Atalho para o comando fechar. |
| `.kick` | Remove um usuário mencionado do grupo. |
| `.ban` | Remove permanentemente um usuário (mesmo que o kick). |
| `.link` | Gera e envia o link de convite do grupo atual. |
| `.informações` | Exibe estatísticas do grupo (membros, data de criação, etc). |

## 🛠️ Tecnologias Utilizadas

- [Node.js](https://nodejs.org/) - Ambiente de execução.
- [Baileys](https://github.com/WhiskeySockets/Baileys) - Biblioteca de conexão com a API do WhatsApp.
- [QRCode-Terminal](https://www.npmjs.com/package/qrcode-terminal) - Exibição do QR Code para pareamento.
- [Multi-File Auth](https://github.com/WhiskeySockets/Baileys) - Persistência de sessão (não desloga ao reiniciar).

## 📦 Instalação e Configuração

Siga os passos abaixo para rodar o projeto em sua máquina ou VPS:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/whatsapp-manager-bot.git
   cd whatsapp-manager-bot
