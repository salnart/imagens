# Imagens

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-salnart%2Fimagens-181717?logo=github)](https://github.com/salnart/imagens)

A self-hosted AI image generation platform with multi-provider failover, user management, and an intuitive admin panel. Deploy with Docker.

<p align="center">
  <img src="screenshot/1.png" width="45%" alt="Generate">
  <img src="screenshot/2.png" width="45%" alt="Promts Panel">
  <br>
  <img src="screenshot/3.png" width="45%" alt="Promts Library">
  <img src="screenshot/4.png" width="45%" alt="Image Editor">
    <br>
  <img src="screenshot/5.png" width="45%" alt="Admin Dashboard">
  <img src="screenshot/6.png" width="45%" alt="Providers">
</p>

---

## Features

- **Multi-Provider AI** — Configure any OpenAI-compatible API (OpenAI, Google AI Studio, OpenRouter, etc.) with automatic failover
- **User Management** — Registration, credits system, per-user UI configuration
- **Admin Panel** — Dashboard, audit logs, provider management, user management
- **Image Generation** — Text-to-image, reference images, batch generation (up to 4)
- **Unlimited Mode** — Per-user and global unlimited generation
- **Dark Theme** — Modern sidebar-based admin interface
- **Docker** — One-command deployment

---

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- An AI API key (OpenAI, Google AI Studio, or any OpenAI-compatible provider)

### 1. Clone and Configure

```bash
git clone https://github.com/YOUR_USERNAME/gpt-image-studio.git
cd gpt-image-studio
cp .env.example .env
```

Edit `.env` — at minimum set `MYSQL_PASSWORD` to a secure password, and configure your AI provider:

```env
# Database (required)
MYSQL_PASSWORD=your_secure_password

# AI Provider (at least one required)
AI_API_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-your-api-key
IMAGE_MODEL=dall-e-3
```

### 2. Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

Or manually:

```bash
docker compose build app --no-cache
docker compose up -d
```

### 3. First Run

1. Open http://localhost:3000
2. Register — **the first registered user becomes admin**
3. Configure additional AI providers in the admin panel → Providers tab
4. Add users via admin panel → User Management

---

## Admin Panel

Access: http://localhost:3000/admin (or click "Admin" in top nav)

| Tab | Description |
|-----|-------------|
| Dashboard | Stats and recent activity |
| Logs | Generation audit logs with filters |
| Users | User management (credits, unlimited, config) |
| Permissions | Global settings and UI config |
| Providers | AI provider management with drag & drop priority |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/me` | Current user + public settings |
| POST | `/api/auth/register` | Register (first user = admin) |
| POST | `/api/auth/login` | Login |
| POST | `/api/images/generate` | Generate image |
| GET | `/api/images/history` | User's generation history |
| GET | `/api/admin/settings` | Admin settings (admin only) |
| PATCH | `/api/admin/settings` | Update settings (admin only) |
| GET | `/api/admin/users` | User list (admin only) |
| GET | `/api/admin/generations` | Generation logs (admin only) |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `MYSQL_HOST` | `mysql` | MySQL host (Docker service name) |
| `MYSQL_PASSWORD` | — | MySQL root password **(required)** |
| `MYSQL_DATABASE` | `gpt_image_studio` | Database name |
| `AI_API_BASE_URL` | — | AI API base URL |
| `AI_API_KEY` | — | AI API key |
| `IMAGE_MODEL` | `dall-e-3` | Default image model |
| `DEFAULT_CREDITS` | `10` | Sign-up credits |
| `GENERATION_CREDIT_COST` | `1` | Credits per image |
| `CHECKIN_CREDIT` | `1` | Daily checkin credit |
| `ALLOW_REGISTRATION` | `true` | Allow user registration |
| `MAX_IMAGES_PER_REQUEST` | `4` | Max batch size |
| `ADMIN_EMAIL` | — | Pre-create admin on first start |
| `ADMIN_PASSWORD` | — | Admin password (with ADMIN_EMAIL) |

---

## Provider Configuration

In the admin panel → Providers, add any OpenAI-compatible API:

| Provider | Base URL | Model |
|----------|----------|-------|
| OpenAI | `https://api.openai.com/v1` | `dall-e-3` |
| Google AI Studio | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash-exp-image-generation` |
| OpenRouter | `https://openrouter.ai/api/v1` | Any supported model |

Providers are tried in order — if the first fails, the next is used (failover).

---

## Project Structure

```
├── server.js              # Main server
├── src/
│   └── mysql-store.js     # Database layer
├── public/
│   ├── index.html         # Main page
│   ├── app.js             # Frontend app
│   ├── admin.html         # Admin panel
│   ├── admin.js           # Admin logic
│   └── admin.css          # Admin styles
├── database/
│   └── schema.sql         # Database schema
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── deploy.sh
```

---

## Security

- API keys are **never sent to clients**. The `/api/auth/me` endpoint strips API keys from provider data.
- Full provider details (with keys) are only available via `/api/admin/settings` (admin-only endpoint).
- CSRF protection with Double Submit Cookie pattern.
- Session cookies are HttpOnly, SameSite=Strict.
- Rate limiting on login attempts and API calls.

---

## License

MIT

---

## Credits

- **Original engine:** [image2creat](https://github.com/dk56dd/image2creat) by dk56dd
- **Image Editor:** [Filerobot](https://github.com/scaleflex/filerobot-image-editor) by Scaleflex

---

## 🇷🇺 Русская версия

GPT Image Studio — self-hosted веб-приложение для генерации изображений через AI API.

### Быстрый старт

```bash
cp .env.example .env
# Отредактируйте .env — укажите MYSQL_PASSWORD и AI_API_KEY
docker compose build app --no-cache
docker compose up -d
```

Откройте http://localhost:3000, зарегистрируйтесь — **первый зарегистрировавшийся пользователь становится администратором**.

### Возможности

- Поддержка нескольких AI-провайдеров с автоматическим failover
- Система кредитов и управление пользователями
- Админ-панель: дашборд, логи, провайдеры, пользователи
- Генерация по тексту и референсным изображениям
- Unlimited режим (глобальный и для каждого пользователя)
- Тёмная тема, современный интерфейс
- Развёртывание одной командой через Docker

### Провайдеры

В админ-панели → Providers можно добавить любого OpenAI-совместимого провайдера. Провайдеры сортируются перетаскиванием — первый включённый является приоритетным, при ошибке запрос переходит к следующему.