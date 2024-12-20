// Импорт библиотек
const express = require("express");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const PORT = 3000;

const path = require('path');

// Обслуживание статических файлов из корневой директории
app.use(express.static(path.join(__dirname)));

// Маршрут для index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// Настройка подключения к базе данных
const pool = new Pool({
    connectionString: "postgresql://postgres:TLcTxBzltZdjZjMIAYRfgyhRYnbSBszz@autorack.proxy.rlwy.net:23303/railway",
    ssl: {
        rejectUnauthorized: false, // Включите SSL для безопасности
    },
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Проверка подключения
pool.connect((err) => {
    if (err) {
        console.error("Ошибка подключения к базе данных:", err.stack);
    } else {
        console.log("Подключение к базе данных успешно!");
    }
});

// === Регистрация пользователя ===
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Все поля обязательны!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hashedPassword]
    );
    res.status(201).json({ userId: result.rows[0].id });
  } catch (err) {
    if (err.code === "23505") {  // Ошибка уникальности email
      res.status(400).json({ error: "Пользователь уже существует" });
    } else {
      console.error("Ошибка при регистрации:", err.stack);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Все поля обязательны!" });
    }

    try {
        const result = await pool.query(
            "SELECT id, name, password_hash FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (isValidPassword) {
            res.status(200).json({
                message: "Успешный вход",
                userId: user.id,
                userName: user.name // Передаём имя пользователя
            });
        } else {
            res.status(401).json({ error: "Неверный пароль" });
        }
    } catch (err) {
        console.error("Ошибка при авторизации:", err.stack);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
