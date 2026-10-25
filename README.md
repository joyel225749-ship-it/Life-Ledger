# LifeLedger 2.0 — Intelligent Product Lifecycle & Warranty Tracker

A full-stack MERN application that helps you track product receipts, warranties, repair costs, and the total cost of ownership — all in one place.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt |
| File uploads | Multer (local, with ownership checks) |
| Charts | Recharts |
| Styling | CSS (custom, responsive) |

---

## Folder structure

```
LifeLedger/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api.js          # Centralised API fetch helper
│   │   ├── App.jsx         # Route definitions
│   │   ├── main.jsx        # React entry point
│   │   ├── styles.css      # All styles
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorMessage.jsx
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── ProductsPage.jsx
│   │       ├── ProductFormPage.jsx
│   │       ├── ProductDetailPage.jsx
│   │       ├── DeadlinesPage.jsx
│   │       ├── ReceiptsPage.jsx
│   │       └── SecondLifePage.jsx
│   ├── vite.config.js
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── index.js        # Server entry
│   │   ├── middleware/
│   │   │   └── auth.js     # JWT requireAuth middleware
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   └── RepairLog.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── products.js
│   │       ├── repairs.js
│   │       ├── uploads.js
│   │       └── dashboard.js
│   ├── uploads/            # Local file uploads (not committed)
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

---

## Requirements

- **Node.js LTS** (v18 or newer) — download from [nodejs.org](https://nodejs.org)
- **MongoDB Atlas account** (free tier works) — [cloud.mongodb.com](https://cloud.mongodb.com)
- **npm** (comes with Node.js)

---

## Setup instructions (step by step for beginners)

### Step 1 — Clone / open the project

Open the project folder in VS Code. Open a terminal with **Terminal → New Terminal**.

### Step 2 — Configure backend environment

```bash
cd server
copy .env.example .env
```

Open `server/.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/lifeledger
JWT_SECRET=pick_a_long_random_string_here_at_least_32_chars
CLIENT_ORIGIN=http://localhost:5173
MAX_UPLOAD_MB=8
```

> **Never commit your `.env` file.** It is already in `.gitignore`.

### Step 3 — Install and run the backend

In the first terminal:

```bash
cd server
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 LifeLedger API listening on http://localhost:5000
```

### Step 4 — Install and run the frontend

Open a **second terminal**:

```bash
cd client
npm install
npm run dev
```

Open the URL shown (usually **http://localhost:5173**).

---

## Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ Yes | Your MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ Yes | Long random secret for signing JWTs |
| `PORT` | No | Backend port (default: 5000) |
| `CLIENT_ORIGIN` | No | Frontend URL for CORS (default: http://localhost:5173) |
| `MAX_UPLOAD_MB` | No | Max upload size in MB (default: 8) |

---

## API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Server health check |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/dashboard` | JWT | Dashboard stats |
| GET | `/api/products` | JWT | List all products |
| POST | `/api/products` | JWT | Add a product |
| GET | `/api/products/:id` | JWT | Get one product |
| PATCH | `/api/products/:id` | JWT | Update a product |
| DELETE | `/api/products/:id` | JWT | Delete a product |
| GET | `/api/repairs?productId=` | JWT | List repairs for a product |
| POST | `/api/repairs` | JWT | Log a repair |
| PATCH | `/api/repairs/:id` | JWT | Update a repair |
| DELETE | `/api/repairs/:id` | JWT | Delete a repair |
| POST | `/api/uploads/receipt` | JWT | Upload a receipt file |
| POST | `/api/uploads/photo` | JWT | Upload a product photo |
| GET | `/api/uploads/file/:name` | JWT | Download a file (ownership-checked) |

---

## Features implemented (Phase 1)

- ✅ User registration and login with bcrypt password hashing
- ✅ JWT authentication with protected routes
- ✅ MongoDB Atlas database connection
- ✅ Full product CRUD (add, view, edit, delete, search, filter by category)
- ✅ Repair log CRUD with automatic cost totalling
- ✅ Dashboard with live stats (purchase cost, repair cost, warranties, deadlines)
- ✅ Warranty and return deadline tracking with urgency indicators
- ✅ Digital receipt vault — upload PDFs/images; ownership-checked download
- ✅ Product passport detail page (info, warranty, costs, repairs, receipt)
- ✅ Repair vs replace ratio indicator
- ✅ Second-life guidance page (repair, resell, donate, recycle)
- ✅ Responsive layout — works on mobile, tablet, and desktop
- ✅ Loading, empty, and error states throughout

---

## Security notes

- Passwords are hashed with bcrypt (12 rounds) — never stored as plaintext
- JWTs expire after 2 hours
- All product and repair routes check the `owner` field — users cannot access each other's data
- Uploaded files are served only to the user who owns the linked product
- All secrets must be in `.env` and never committed

---

## Planned phases

- **Phase 2:** Email reminders for upcoming warranty deadlines
- **Phase 3:** OCR receipt scanning (user must confirm extracted data before saving)
- **Phase 4:** Charts and analytics (spend by category, cost over time)
- **Phase 5:** Deployment guide (Railway / Render + MongoDB Atlas + cloud file storage)
