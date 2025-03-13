const http = require('http');
const WebSocket = require('ws');

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server is running\n');
});

// Создаем WebSocket сервер
const wss = new WebSocket.Server({ server });

// Обработка подключений WebSocket
wss.on('connection', (ws) => {
    console.log('Новое подключение');

    ws.on('message', (message) => {
        console.log('Получено сообщение:', message.toString());
        ws.send(`Вы сказали: ${message}`);
    });

    ws.on('close', () => {
        console.log('Пользователь отключен');
    });
});

// Запускаем сервер на порту 8081
const PORT = 8081; // Измененный порт
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});