<div align="center">

<img src="public/uno-logo.png" alt="UNO Logo" width="160"/>

# Mabar UNO Online

**Game kartu UNO multiplayer real-time berbasis web — dimainkan bersama teman atau lawan bot AI.**

[![Live Demo](https://img.shields.io/badge/🎮_Live_Demo-mabar--uno.vercel.app-4ade80?style=for-the-badge)](https://mabar-uno.vercel.app)
[![Backend Railway](https://img.shields.io/badge/⚙️_Server-Railway-6366f1?style=for-the-badge)](https://mabar-uno-be.up.railway.app)
[![Backend Vercel](https://img.shields.io/badge/⚙️_Server_Fallback-Vercel-000000?style=for-the-badge)](https://mabar-uno-be.vercel.app)

</div>

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 🃏 Multiplayer Real-time | Main bareng teman via Socket.io dengan kode room |
| 🤖 Bot AI | Mode Solo vs 3 Bot AI dengan logika bermain adaptif |
| 🎨 Wild Color Picker | Pilih warna saat memainkan Wild atau Wild Draw Four |
| 📦 Play Group | Lempar banyak kartu bernilai sama sekaligus (Tongkrongan) |
| 🔊 Sound Effects | Suara UNO saat kartu tersisa 1, suara kemenangan saat menang |
| 🌈 Color Glow | Background berubah sesuai warna aktif |
| 📱 Responsif | Tampilan menyesuaikan semua ukuran layar |
| 🏆 Game Over Screen | Layar kemenangan / kekalahan dengan animasi |

---

## 🎮 Aturan Permainan

### Mode Tongkrongan (Default)
- **Play Group** — Lempar beberapa kartu dengan nilai yang sama sekaligus, asalkan minimal satu cocok warna/nilai dengan kartu di meja
- **Stack +2** — Tumpuk Draw +2 di atas Draw +2 untuk mengoper hukuman ke pemain berikutnya
- **Instant Wild** — Kartu Wild bisa dimainkan kapan saja

### Mode Official
- Hanya satu kartu per giliran
- Aturan UNO standar internasional

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm v9+

### Clone & Install

```bash
# Clone repository
git clone https://github.com/Raflyromeo/mabar-uno.git
cd mabar-uno

# Install dependencies frontend
npm install

# Install dependencies server
cd server
npm install
cd ..
```

### Konfigurasi Environment

Buat file `.env` di root project berdasarkan `.env.example`:

```bash
cp .env.example .env
```

Isi file `.env`:

```env
# Primary server URL (Railway)
VITE_SERVER_URL=https://your-app.up.railway.app

# Fallback server URL (Vercel) — digunakan jika server utama tidak bisa diakses
VITE_SERVER_URL_FALLBACK=https://mabar-uno-be.vercel.app
```

### Menjalankan Secara Lokal

**Terminal 1 — Frontend:**
```bash
npm run dev
```

**Terminal 2 — Backend Server:**
```bash
cd server
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

> Pastikan `.env` menggunakan `VITE_SERVER_URL=http://localhost:3001` untuk development lokal.

---

## 🏗️ Struktur Folder

```
mabar-uno/
│
├── public/                     # Aset statis
│   ├── favicon.ico
│   ├── uno-logo.png
│   └── card/                   # Asset SVG kartu UNO (semua warna & nilai)
│
├── server/                     # Backend Node.js (Socket.io)
│   ├── index.js                # Entry point server — room & event handler
│   ├── package.json
│   └── railway.json            # Konfigurasi deploy Railway
│
├── src/
│   ├── components/
│   │   ├── Card.jsx            # Komponen kartu tunggal dengan animasi
│   │   ├── ColorPicker.jsx     # Modal pilih warna (Wild/Draw4) via Portal
│   │   ├── GameBoard.jsx       # Papan game — kartu tengah, lawan, background
│   │   ├── InfoModal.jsx       # Modal info aturan & profil pembuat
│   │   ├── PlayerHand.jsx      # Tangan kartu pemain & tombol aksi
│   │   └── Sidebar.jsx         # Sidebar info (tidak aktif di layout utama)
│   │
│   ├── hooks/
│   │   ├── useAI.js            # Hook logika bot AI (pilih & lempar kartu)
│   │   └── useSocketEvents.js  # Hook event Socket.io (room, sync state)
│   │
│   ├── lib/
│   │   ├── socket.js           # Inisialisasi Socket.io client + fallback server
│   │   └── sounds.js           # Web Audio API — suara UNO & kemenangan
│   │
│   ├── store/
│   │   └── gameStore.js        # Zustand store — state game, aksi, sinkronisasi
│   │
│   ├── utils/
│   │   └── gameLogic.js        # Logika inti: deck, validasi kartu, aturan
│   │
│   ├── App.jsx                 # Root komponen — routing menu & game
│   ├── main.jsx                # Entry point React
│   └── index.css               # Global styles + Tailwind
│
├── .env.example                # Template environment variable
├── index.html                  # HTML entry + metadata SEO
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Kegunaan |
|---|---|
| [React 19](https://react.dev) | UI Framework |
| [Vite 6](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS 3](https://tailwindcss.com) | Styling utility-first |
| [Framer Motion](https://www.framer.com/motion/) | Animasi kartu & transisi |
| [Zustand](https://zustand-demo.pmnd.rs/) | State management game |
| [Socket.io-client](https://socket.io) | Koneksi real-time ke server |
| [Lucide React](https://lucide.dev) | Icon library |
| Web Audio API | Synthesizer suara UNO (tanpa file audio) |

### Backend
| Teknologi | Kegunaan |
|---|---|
| [Node.js](https://nodejs.org) | Runtime server |
| [Express](https://expressjs.com) | HTTP server & health check |
| [Socket.io](https://socket.io) | WebSocket — room & game event |

### Deployment
| Platform | Digunakan untuk |
|---|---|
| [Vercel](https://vercel.com) | Frontend + Backend fallback |
| [Railway](https://railway.app) | Backend primary (WebSocket) |

---

## 🌐 Cara Deploy

### Frontend (Vercel)

1. Push ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Tambahkan environment variables:
   ```
   VITE_SERVER_URL=https://your-railway-server.up.railway.app
   VITE_SERVER_URL_FALLBACK=https://mabar-uno-be.vercel.app
   ```
4. Deploy otomatis dari branch `main`

### Backend (Railway)

1. Import folder `server/` ke [railway.app](https://railway.app)
2. Railway otomatis mendeteksi Node.js
3. Pastikan `railway.json` sudah ada di `server/`

### Backend Fallback (Vercel)

1. Deploy folder `server/` sebagai project terpisah di Vercel
2. Vercel mendukung Node.js serverless untuk Express + Socket.io

---

## 👤 Pembuat

<div align="center">

**Muhammad Rafly Romeo Nasution**

Mahasiswa Sistem Informasi Semester 6 — Universitas Gunadarma

| Platform | Link |
|---|---|
| 🐱 GitHub | [github.com/Raflyromeo](https://github.com/Raflyromeo/) |
| 💼 LinkedIn | [linkedin.com/in/muhammadraflyromeonasution](https://linkedin.com/in/muhammadraflyromeonasution) |
| 📸 Instagram | [@rfly.romeo_](https://instagram.com/rfly.romeo_) |

</div>

---

<div align="center">

Made with ❤️ by Rafly Romeo · 2026

</div>
