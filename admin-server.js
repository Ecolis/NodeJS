const express = require('express');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 8080;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

// Подключение WebSocket
wss.on('connection', (ws) => {
    console.log('Администратор подключился к WebSocket');

    ws.on('message', (message) => {
        console.log('Сообщение от клиента:', message);

        // Отправляем сообщение всем подключенным клиентам (покупателям и администраторам)
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Администратор отключился от WebSocket');
    });
});

// API для управления товарами
const productsFilePath = path.join(__dirname, 'products.json');

function readProducts() {
    return fs.existsSync(productsFilePath) ? JSON.parse(fs.readFileSync(productsFilePath, 'utf8')) : [];
}

function writeProducts(products) {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}

function generateId(products) {
    const existingIds = new Set(products.map(p => p.id));
    let newId = products.length > 0 ? Math.max(...existingIds) + 1 : 1;
    while (existingIds.has(newId)) {
        newId++;
    }
    return newId;
}

// Swagger документация
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Admin Panel API',
            version: '1.0.0',
            description: 'Документация API для управления товарами'
        },
    },
    apis: [__filename],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/api/products', (req, res) => {
    res.json(readProducts());
});

app.post('/api/products', (req, res) => {
    let products = readProducts();

    const newProducts = req.body.map(product => {
        const id = generateId(products);
        const newProduct = { id, ...product };
        products.push(newProduct);
        return newProduct;
    });

    writeProducts(products);
    res.json({ message: 'Товары добавлены', products: newProducts });
});

app.put('/api/products', (req, res) => {
    const { id, ...updatedProduct } = req.body;
    let products = readProducts();
    const index = products.findIndex(p => p.id === id);

    if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        writeProducts(products);
        res.json({ message: 'Товар обновлен', product: products[index] });
    } else {
        res.status(404).json({ message: 'Товар не найден' });
    }
});

app.delete('/api/products', (req, res) => {
    const { id } = req.body;
    let products = readProducts();
    const index = products.findIndex(p => p.id === id);

    if (index !== -1) {
        const deletedProduct = products.splice(index, 1);
        writeProducts(products);
        res.json({ message: 'Товар удален', product: deletedProduct });
    } else {
        res.status(404).json({ message: 'Товар не найден' });
    }
});

// Отдаем HTML-страницу админки
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Запускаем сервер
server.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});
