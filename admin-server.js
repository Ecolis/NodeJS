const express = require('express');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const port = 8080;

app.use(express.json());


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

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все товары
 *     responses:
 *       200:
 *         description: Список всех товаров
 */
app.get('/api/products', (req, res) => {
    res.json(readProducts());
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Добавить несколько товаров
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 description:
 *                   type: string
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *     responses:
 *       200:
 *         description: Товары успешно добавлены
 */
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

/**
 * @swagger
 * /api/products:
 *   put:
 *     summary: Редактировать товар по ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       404:
 *         description: Товар не найден
 */
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

/**
 * @swagger
 * /api/products:
 *   delete:
 *     summary: Удалить товар по ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Товар удален
 *       404:
 *         description: Товар не найден
 */
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


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});
