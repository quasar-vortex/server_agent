# 🛠 Server Agent & Log Ingestion API

A lightweight DevOps-style monitoring system built with Node.js + TypeScript.

It consists of:

- A **reporting agent** that collects system metrics and sends them to...
- A **central Express API** that stores and retrieves logs using SQLite.

---

## 📦 Features

### 🖥️ Node Agent (`reporter/`)

- Collects system info via shell commands (disk usage, uptime, memory, etc.)
- Registers the server once and caches its ID
- Periodically sends logs to the backend every 15 minutes
- Can be run manually, via cron, or as a systemd service

### 🌐 Log Server API (`log_server/`)

- `POST /api/v1/servers` — Register a new server by IP/hostname
- `POST /api/v1/logs` — Upload logs in bulk from a server
- `GET /api/v1/logs/server/:serverId` — Retrieve last 24 hours of logs

---

## 🧪 Metrics Collected

- Disk Usage
- Uptime
- Logged-in Users
- Memory
- Active Socket Connections
- DNS Resolution
- Network Interfaces
- Routing Table
- Ping Test

---

## 🧰 Tech Stack

- Node.js + TypeScript
- Express
- SQLite3
- Zod (request validation)
- Native shell commands (`execSync`)

---

## 🚀 Getting Started

### Clone the Project

```bash
git clone https://github.com/quasar-vortex/server_agent.git
cd server_agent


```

---

### Log Server Setup (`log_server/`)

```bash
cd log_server
npm install
npm run build
npm start
```

The API will run at `http://localhost:5000` (configurable via `.env`).

---

### Reporter Agent Setup (`reporter/`)

```bash
cd ../reporter
npm install
npm run build
node dist/index.js
```

This will:

- Register the server if needed
- Send logs to the backend every 15 minutes

To run it persistently, see `agent.service` below.

---

## 🔁 Example Systemd Setup

**`/etc/systemd/system/server-agent.service`**

```ini
[Unit]
Description=Server Agent
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/reporter
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable with:

```bash
sudo systemctl daemon-reload
sudo systemctl enable server-agent
sudo systemctl start server-agent
```

---

## 📁 Directory Structure

```
server_agent_project/
├── log_server/                  # Express API backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.ts
│   ├── log.db
│   ├── .env
│   ├── package.json
│   └── tsconfig.json

├── reporter/                    # Node.js agent
│   ├── src/
│   │   └── index.ts
│   ├── .agent.json
│   ├── agent.service
│   ├── package.json
│   └── tsconfig.json

├── .gitignore
└── README.md
```

---

## 📬 Contact

Built by [Jeremy Barber](https://www.linkedin.com/in/jeremy-bar/)
Feel free to reach out or fork it and adapt it to your needs!
