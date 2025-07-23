# Используем официальный образ Node.js
FROM node:18

# Рабочая директория внутри контейнера
WORKDIR /src

# Копируем package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 8080

# Установка продакшн-режима
ENV NODE_ENV=production

# Запуск сервера
CMD ["npm", "start"]
