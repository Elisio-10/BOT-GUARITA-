const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require("@whiskeysockets/baileys");
const P = require("pino");
const { Boom } = require("@hapi/boom");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false
    });

    // SISTEMA DE CONEXÃO POR CÓDIGO PARA CELULAR
    if (!sock.authState.creds.registered) {
        console.log("--- VINCULAÇÃO MOBILE ---");
        const phoneNumber = await question("Digite seu número de WhatsApp (Ex: 5511999999999): ");
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\n✅ SEU CÓDIGO DE CONEXÃO: ${code}\n`);
        console.log("Instruções: No WhatsApp, vá em Aparelhos Conectados > Conectar com código de telefone.");
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ BOT CONECTADO E PRONTO PARA USO!');
        }
    });

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        if (!body.startsWith('.')) return;
        const command = body.split(' ')[0].toLowerCase();

        // COMANDOS DE GESTÃO
        if (isGroup) {
            switch (command) {
                case '.abrir':
                    await sock.groupSettingUpdate(from, 'not_announcement');
                    await sock.sendMessage(from, { text: '🔓 *GRUPO ABERTO:* Mensagens liberadas para todos.' });
                    break;

                case '.fechar':
                case '.silenciar':
                    await sock.groupSettingUpdate(from, 'announcement');
                    await sock.sendMessage(from, { text: '🔒 *GRUPO FECHADO:* Somente administradores podem falar.' });
                    break;

                case '.link':
                    const code = await sock.groupInviteCode(from);
                    await sock.sendMessage(from, { text: `🔗 *LINK DO GRUPO:* https://chat.whatsapp.com/${code}` });
                    break;

                case '.kick':
                case '.ban':
                    const mention = msg.message.extendedTextMessage?.contextInfo?.mentionedJid[0];
                    if (mention) {
                        await sock.groupParticipantsUpdate(from, [mention], 'remove');
                        await sock.sendMessage(from, { text: '🚫 Usuário banido com sucesso.' });
                    } else {
                        await sock.sendMessage(from, { text: '❌ Marque alguém para banir.' });
                    }
                    break;

                case '.informações':
                    const meta = await sock.groupMetadata(from);
                    await sock.sendMessage(from, { text: `📝 *DADOS DO GRUPO*\n\n📌 Nome: ${meta.subject}\n👥 Membros: ${meta.participants.length}\n👑 Criador: ${meta.owner || 'Não identificado'}` });
                    break;
            }
        }
    });
}

startBot();
