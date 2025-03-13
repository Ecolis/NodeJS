# Установка и запуск проекта

1. Склонируйте репозиторий в Visual Studio Code через терминал.
   
   ```git clone https://github.com/Ecolis/NodeJS.git```
   
   ```cd <НАЗВАНИЕ_ПАПКИ_РЕПОЗИТОРИЯ>```
2. Установка Node.js.
   
   - Если у вас не установлен Node.js, установите его с официального сайта или через терминал (для Mac/Linux):
   
       ```sudo apt install nodejs  #Ubuntu/Debian```
   
       ```brew install node #macOS```
    - Проверить: 

      `node -v`

      `npm -v`


3.  Инициализация проекта.
   
      Выполните команду для создания package.json:

      `npm init -y`

4.  Установка зависимостей.
   
      `npm install express body-parser`
   
      `npm install swagger-ui-express swagger-jsdoc`
    
      `npm install express-graphql graphql`

      `npm install ws`
    
6. Запуск серверов.
   - Сервер для просмотра катологов товаров:
     
      `node server.js`
      Сервер будет доступен по адресу:
      http://localhost:3000

   - Сервер администратора:
     
      `node admin-server.js`
     Сервер будет доступен по адресу:
     http://localhost:8080
     



