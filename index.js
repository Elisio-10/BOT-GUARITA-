const { default: makeWASocket, useMultiFileAuthState, downloadMediaMessage, delay } = require("@whiskeysockets/baileys");
const fs = require('fs');
const P = require('pino');
const Jimp = require('jimp');
const jsQR = require('jsqr');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const readline = require("readline");

// CONFIGURAÇÃO DE CONTAS MOÇAMBIQUE
const CONTAS = {
    mpesa: { numero: "855642998", nome: "Elisio Mocumbe" },
    emola: { numero: "879740345", nome: "Percina Elta" }
};

// BANCO DE DADOS
let db = {
    config: { welcome: true, ia: false },
    bilhetes: {}, 
    vendas_pendentes: {},
    afiliados: {},
    ids_usados: []
};
if (fs.existsSync('./database.json')) db = JSON.parse(fs.readFileSync('./database.json'));
const save = () => fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));

// FUNÇÕES AUXILIARES (SMS, PDF, IMAGEM)
function extrairSMS(texto) {
    const id = texto.match(/ID:\s*([A-Z0-9]+)/i);
    const valor = texto.match(/(\d+\.\d+|\d+)\s*MT/i);
    return id ? { id: id[1].toUpperCase(), valor: valor ? valor[1] : "?" } : null;
}

async function gerarBilheteImg(codigo, nome) {
    const img = new Jimp(600, 300, '#1e293b');
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    img.print(font, 40, 40, "BILHETE VIP");
    img.print(font, 40, 100, nome.toUpperCase());
    const qrBuf = await QRCode.toBuffer(codigo, { width: 150 });
    const qrImg = await Jimp.read(qrBuf);
    img.composite(qrImg, 400, 75);
    const path = `./${codigo}.png`;
    await img.writeAsync(path);
    return path;
}

// INÍCIO DO BOT
async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ logger: P({ level: 'silent' }), auth: state });
    
    // Vincular por Código de Telefone (Melhor para Termux/Celular)
    if (!sock.authState.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const num = await new Promise(res => rl.question("Digite seu número (Ex: 25885...): ", res));
        const code = await sock.requestPairingCode(num);
        console.log(`👉 CÓDIGO DE CONEXÃO: ${code}`);
        rl.close();
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const pushName = msg.pushName || "Cliente";

        // 1. LEITURA AUTOMÁTICA DE SMS M-PESA/E-MOLA
        const sms = extrairSMS(body);
        if (sms) {
            if (db.ids_usados.includes(sms.id)) return sock.sendMessage(from, { text: "❌ ID já usado!" });
            db.vendas_pendentes[sms.id] = { usuario: from, valor: sms.valor, nome: pushName };
            save();
            await sock.sendMessage(from, { text: `✅ SMS RECONHECIDO!\nValor: ${sms.valor} MT\nID: ${sms.id}\nAguarde a aprovação.` });
            return;
        }

        // 2. VALIDAÇÃO DE BILHETE POR FOTO (QR CODE)
        if (msg.message.imageMessage) {
            const buffer = await downloadMediaMessage(msg, 'buffer');
            const img = await Jimp.read(buffer);
            const qr = jsQR(img.bitmap.data, img.bitmap.width, img.bitmap.height);
            if (qr) {
                const b = db.bilhetes[qr.data];
                if (b && b.status === "disponivel") {
                    b.status = "usado"; b.usado_em = new Date().toLocaleString(); save();
                    await sock.sendMessage(from, { text: `✅ ACESSO LIBERADO!\n🎫 ${qr.data}` });
                } else {
                    await sock.sendMessage(from, { text: "❌ BILHETE INVÁLIDO OU JÁ USADO!" });
                }
            }
            return;
        }

        // 3. COMANDOS
        if (!body.startsWith('.')) return;
        const args = body.slice(1).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        switch (cmd) {
            case 'ajuda':
                const menu = `🚀 *STARTUP BOT - COMANDOS*\n\n` +
                    `*BILHETERIA:*\n.comprar | .pagar [ID]\n.confirmar [ID] | .relatorio\n\n` +
                    `*GESTÃO GRUPO:*\n.abrir | .fechar | .todos\n.kick | .ban | .listar\n\n` +
                    `*AFILIADOS:*\n.novoafiliado | .saldo`;
                await sock.sendMessage(from, { text: menu });
                break;

            case 'confirmar':
                const idC = args[0]?.toUpperCase();
                const v = db.vendas_pendentes[idC];
                if (v) {
                    const cod = "TICKET-" + idC;
                    db.bilhetes[cod] = { status: "disponivel", cliente: v.nome };
                    db.ids_usados.push(idC);
                    delete db.vendas_pendentes[idC]; save();
                    const path = await gerarBilheteImg(cod, v.nome);
                    await sock.sendMessage(v.usuario, { image: fs.readFileSync(path), caption: `🎫 Seu Bilhete Oficial!` });
                    fs.unlinkSync(path);
                }
                break;

            case 'relatorio':
                const wb = new ExcelJS.Workbook();
                const s = wb.addWorksheet('Vendas');
                s.addRow(['CÓDIGO', 'STATUS', 'CLIENTE']);
                Object.keys(db.bilhetes).forEach(k => s.addRow([k, db.bilhetes[k].status, db.bilhetes[k].cliente]));
                await wb.xlsx.writeFile('./Relatorio.xlsx');
                await sock.sendMessage(from, { document: fs.readFileSync('./Relatorio.xlsx'), fileName: 'Relatorio.xlsx', mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                break;
                
            case 'abrir': await sock.groupSettingUpdate(from, 'not_announcement'); break;
            case 'fechar': await sock.groupSettingUpdate(from, 'announcement'); break;
        }
    });
}
start();
