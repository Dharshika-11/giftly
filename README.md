# 🎁 Giftly – Smart Gift Recommendation Assistant

> Find a gift they'll actually love.

Giftly is a production-ready, full-stack gift recommendation platform. Tell Giftly who you're shopping for, your budget, and their interests — and get thoughtful, curated gift suggestions instantly.

---

## ✨ Features

- **Conversational gift discovery** — natural back-and-forth conversation to understand context
- **Structured recommendations** — gift ideas with prices, reasons, and personalization tips
- **Conversation history** — all chats persisted and resumable across sessions
- **Anonymous sessions** — no login required, session-based identity
- **Cold-start resilience** — graceful handling of Render backend wake-up delays
- **Mobile-responsive** — works beautifully on all device sizes
- **Duplicate request protection** — idempotency keys prevent double Gemini calls

---

## 🏗 Architecture

```
GitHub
   │
   │ push to main
   ▼
GitHub Actions (CI)
   ├── Frontend: lint + type-check + build
   └── Backend: ruff + pytest + import check
         │
         ▼
      GitHub
       /   \
      ▼     ▼
  Vercel   Render
  (Next.js) (FastAPI)
              │
              ▼
        MongoDB Atlas
              │
              ▼
          Gemini API
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, Uvicorn |
| Database | MongoDB Atlas (async via Motor) |
| LLM | Google Gemini 1.5 Flash |
| Hosting (Frontend) | Vercel |
| Hosting (Backend) | Render |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
giftly/
├── frontend/               # Next.js application
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── chat/
│   │   │   └── page.tsx    # Chat interface
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ConversationSidebar.tsx
│   │   ├── GiftCard.tsx
│   │   ├── GiftGrid.tsx
│   │   ├── LoadingState.tsx
│   │   └── ErrorState.tsx
│   ├── lib/
│   │   ├── api.ts           # API client with retry logic
│   │   └── session.ts       # Anonymous session management
│   ├── types/
│   │   └── index.ts
│   └── .env.example
│
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── main.py         # App entry point + CORS
│   │   ├── config.py       # Settings via pydantic-settings
│   │   ├── database.py     # Motor/MongoDB connection
│   │   ├── models/
│   │   │   └── conversation.py
│   │   ├── schemas/
│   │   │   ├── conversation.py
│   │   │   └── chat.py
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   ├── conversations.py
│   │   │   └── chat.py
│   │   └── services/
│   │       ├── gemini_service.py
│   │       └── conversation_service.py
│   ├── tests/
│   │   └── test_api.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── .env.example
│
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml
│       └── backend-ci.yml
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- MongoDB Atlas account (free tier works)
- Google Gemini API key

---

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Mac/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start development server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
Swagger docs at: http://localhost:8000/docs  
Health check: http://localhost:8000/health

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit with your backend URL

# Start development server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 🔑 Environment Variables

### Backend `.env`

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE_NAME=giftly
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🍃 MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster (M0 free tier)
3. Create a database user with read/write access
4. Whitelist your IP (or `0.0.0.0/0` for development)
5. Get your connection string:
   `Clusters → Connect → Connect your application → Copy URI`
6. Replace `<password>` with your database user password
7. Add to `backend/.env` as `MONGODB_URI`

---

## 🤖 Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create or select a project
3. Generate an API key
4. Add to `backend/.env` as `GEMINI_API_KEY`

> **Never expose this key to the frontend.**

---

## 🧪 Running Tests

### Backend

```bash
cd backend
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux

pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm run lint
npm run type-check
npm run build
```

---

## 📦 Git Workflow

```bash
git init
git add .
git commit -m "feat: initial Giftly implementation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/giftly.git
git push -u origin main
```

Every push to `main` triggers GitHub Actions CI automatically.

---

## ☁️ Vercel Deployment (Frontend)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **New Project** and import your GitHub repository
3. Set the **Root Directory** to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://giftly-api.onrender.com`)
5. Deploy

Vercel auto-deploys on every push to `main`.

---

## 🎛 Render Deployment (Backend)

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
5. Add environment variables (from `backend/.env.example`)
6. Deploy

---

## ❄️ Cold-Start Handling

Render's free tier spins down services after inactivity. Giftly handles this gracefully:

- Frontend shows **"Waking up the gift assistant..."** banner
- Automatic retry with exponential backoff (2s → 4s → 8s, max 3 attempts)
- Idempotency keys prevent duplicate Gemini requests on retry
- `/api/wake` endpoint for warming up the service
- Lightweight `/health` endpoint that never times out

> **Note**: Application code cannot prevent cold starts on Render free tier. Upgrading to a paid plan keeps the service always-on.

---

## 🔒 Security

- Gemini API key never exposed to frontend
- MongoDB URI never exposed to frontend
- CORS configured with allowed origins from environment variables
- Message size limits (2000 chars max)
- Input validation on all endpoints
- No stack traces in API error responses
- Anonymous sessions (no PII stored)

---

## 📋 Production Checklist

- [ ] `MONGODB_URI` set in Render environment
- [ ] `GEMINI_API_KEY` set in Render environment
- [ ] `FRONTEND_URL` set to your Vercel URL in Render
- [ ] `NEXT_PUBLIC_API_URL` set to your Render URL in Vercel
- [ ] GitHub Actions CI passing
- [ ] `/health` returns `{"status":"ok"}`
- [ ] Conversation creation working
- [ ] Gemini responding with gift suggestions
- [ ] Mobile layout tested

---

## 🛠 Troubleshooting

**Backend won't start:**
- Check `MONGODB_URI` is set correctly
- Check `GEMINI_API_KEY` is valid
- Run `uvicorn app.main:app --reload` and check logs

**Frontend can't reach backend:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS: `FRONTEND_URL` in backend must match frontend URL
- Check `/health` endpoint is accessible

**Gemini not responding:**
- Verify `GEMINI_API_KEY` is active
- Check Gemini API quotas in Google AI Studio
- Verify `gemini-1.5-flash` model is available in your region

**MongoDB connection failing:**
- Whitelist your IP in MongoDB Atlas
- Verify connection string format
- Check database user has correct permissions

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Lightweight health check |
| GET | `/api/health` | Detailed health with DB status |
| GET | `/api/wake` | Wake up cold-started backend |
| POST | `/api/conversations` | Create new conversation |
| GET | `/api/conversations?session_id=` | List conversations |
| GET | `/api/conversations/{id}?session_id=` | Get conversation with messages |
| DELETE | `/api/conversations/{id}?session_id=` | Delete conversation |
| POST | `/api/chat` | Send message, get gift suggestions |

Full Swagger docs: `http://localhost:8000/docs`
