# 🚀 TaskFlow — Smart Task Management System

A modern, full-stack productivity application built with the MERN stack. Features a premium dark UI, drag-and-drop task boards, analytics, and admin panel.

## ✨ Features

### Authentication
- JWT-based auth with secure token storage
- Register, Login, Logout
- Protected routes for authenticated users
- Admin-only routes

### Dashboard (Task Board)
- **3-column Kanban board**: To Do → In Progress → Completed
- **Drag & Drop** between columns (via `@hello-pangea/dnd`)
- Full **CRUD** on tasks
- Task cards with: title, description, priority badge, due date, tags, created date
- **Search** tasks by title, description, or tags
- **Filter** by priority and status
- **Pagination** (10 tasks/page)
- Mark tasks as **Important** (star icon)

### Analytics
- Stats: Total, Completed, Overdue, Important tasks
- Completion rate progress bar
- Bar chart: Tasks by Priority
- Pie chart: Status Distribution
- Bar chart: Completions in last 7 days
- Premium recharts styling

### Favorites
- Separate page listing all important tasks
- Persisted in MongoDB

### Admin Panel
- View all users with task counts
- View all tasks across all users
- Delete any task
- Change user roles (user ↔ admin)
- System-wide stats

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| State | React Context API |
| HTTP | Axios |
| DnD | @hello-pangea/dnd |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Validation | express-validator |

---

## 📁 Project Structure

```
smart-task-manager/
├── backend/
│   ├── models/
│   │   ├── User.js         # User schema + bcrypt hashing
│   │   └── Task.js         # Task schema with indexes
│   ├── routes/
│   │   ├── auth.js         # Register, Login, Me
│   │   ├── tasks.js        # Full CRUD + toggle important
│   │   ├── analytics.js    # Aggregated stats
│   │   └── admin.js        # Admin-only operations
│   ├── middleware/
│   │   └── auth.js         # JWT protect + adminOnly
│   └── server.js           # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── Layout.jsx      # Sidebar + navigation
    │   │   └── tasks/
    │   │       ├── TaskCard.jsx    # Individual task card
    │   │       └── TaskModal.jsx   # Create/Edit modal
    │   ├── context/
    │   │   └── AuthContext.jsx     # Auth state + login/register/logout
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx   # Kanban board
    │   │   ├── AnalyticsPage.jsx   # Charts & stats
    │   │   ├── FavoritesPage.jsx   # Important tasks
    │   │   └── AdminPage.jsx       # Admin panel
    │   ├── utils/
    │   │   └── api.js              # Axios instance with interceptors
    │   ├── App.jsx                 # Router + route guards
    │   ├── main.jsx
    │   └── index.css               # Tailwind + custom CSS
    ├── tailwind.config.js
    ├── vite.config.js
    └── index.html
```

---

## 🚀 Setup & Running

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd smart-task-manager
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET

npm run dev
# Server starts on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
# App starts on http://localhost:5173
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Tasks (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List with filter/search/pagination |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/important` | Toggle important |

### Analytics (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | User's analytics data |

### Admin (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/tasks` | All tasks |
| DELETE | `/api/admin/tasks/:id` | Delete any task |
| PATCH | `/api/admin/users/:id/role` | Change user role |
| GET | `/api/admin/stats` | System stats |

---

## 🎨 Design Decisions

**Theme**: Dark luxury — deep navy-black surfaces with a violet accent (#7C6FFF)  
**Fonts**: Syne (display headers) + DM Sans (body text) — distinctive and modern  
**Motion**: Subtle slide-up/fade-in animations with staggered delays  
**Layout**: Fixed sidebar + scrollable main content  
**Components**: Fully custom built — no UI library bloat  

---

## 🔐 Making Yourself Admin

After registering, manually update your user in MongoDB:
```js
// MongoDB shell
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```
Or use the admin panel once another admin has promoted you.

---

## 📦 Deployment

### Backend (Railway / Render)
1. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`
2. Deploy the `backend/` folder
3. Start command: `npm start`

### Frontend (Vercel / Netlify)
1. Update `vite.config.js` proxy OR set `VITE_API_URL` env variable
2. Build: `npm run build`
3. Serve the `dist/` folder
