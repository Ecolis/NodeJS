const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const path = require('path');
const WebSocket = require('ws'); // Подключение библиотеки ws
const products = require('./products.json');

const app = express();
const port = 3000;

// Создаем схему GraphQL
const schema = buildSchema(`
  type Product {
    id: ID!
    name: String!
    price: Int!
    description: String
    categories: [String!]!
  }

  type Query {
    products(category: String): [Product]
  }
`);

const root = {
  products: ({ category }) => {
    if (!category) return products;
    return products.filter(product => product.categories.includes(category));
  }
};

// Указываем путь к статическим файлам
app.use(express.static(path.join(__dirname)));

// Настройка GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// Запуск сервера
const server = app.listen(port, () => {
  console.log(`Сервер интернет-магазина запущен на http://localhost:${port}`);
});

// WebSocket сервер
const wss = new WebSocket.Server({ server });

const clients = new Map();

wss.on('connection', (ws) => {
  console.log('Новое подключение');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'register') {
      clients.set(ws, { role: data.role, username: data.username });
      console.log(`Зарегистрирован ${data.role}: ${data.username}`);
      return;
    }

    if (data.type === 'message') {
      const sender = clients.get(ws);
      broadcast({
        type: 'message',
        from: sender.username,
        role: sender.role,
        text: data.text,
        timestamp: new Date().toISOString(),
      });
    }
  });

  ws.on('close', () => {
    const user = clients.get(ws);
    if (user) {
      console.log(`Пользователь отключен: ${user.username}`);
      clients.delete(ws);
    }
  });
});

function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach((user, client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}