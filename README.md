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
npm install
npm start


Um QR Code será gerado no seu terminal.
Abra o WhatsApp no seu celular > Aparelhos Conectados > Conectar um Aparelho.
Escaneie o código e pronto!


📈 Estrutura Startup
Este repositório foi estruturado pensando em escalabilidade:
Modularização: Comandos fáceis de editar e expandir.
Conexão Estável: Sistema de reconexão automática em caso de queda de rede.
Baixo Consumo: Projetado para rodar em instâncias leves (VPS básica).
🛡️ Segurança
A sessão do WhatsApp é criptografada e salva localmente na pasta auth_info_baileys. Nunca compartilhe esta pasta publicamente, pois ela contém as chaves de acesso ao seu WhatsApp.

📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

Desenvolvido com 💙 para fins de automação inteligente.
