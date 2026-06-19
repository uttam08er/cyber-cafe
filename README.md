# 🖥️ Shaurya eServices Smart Cyber Café Management System

A full-stack production-ready web application for managing a cyber café — built with React (Vite) + Flask + SQLite/MySQL.

---

## 📁 Project Structure

```
cyber-cafe/
├── backend/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── service.py
│   │   ├── request.py
│   │   ├── booking.py
│   │   └── contact.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── services.py
│   │   ├── requests.py
│   │   ├── upload.py
│   │   ├── bookings.py
│   │   ├── admin.py
│   │   └── contact.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── helpers.py
│   │   ├── validators.py
│   │   └── decorators.py
│   ├── uploads/               ← uploaded files (gitignored)
│   ├── app.py                 ← Flask app factory + seeder
│   ├── wsgi.py                ← Production entry point
│   ├── config.py
│   ├── extensions.py
│   ├── requirements.txt
│   ├── Procfile               ← Render deployment
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js       ← Axios instance + interceptors
    │   │   └── index.js       ← All API calls
    │   ├── components/
    │   │   ├── common/        ← Navbar, Footer, Modal, StatusBadge, etc.
    │   │   ├── user/          ← ServiceCard, RequestCard
    │   │   └── admin/         ← Sidebar, StatCard
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useFetch.js
    │   ├── pages/
    │   │   ├── admin/         ← AdminDashboard, Users, Services, Requests, Bookings, Contacts
    │   │   ├── dashboard/     ← Overview, MyRequests, MyBookings, Profile
    │   │   ├── HomePage.jsx
    │   │   ├── ServicesPage.jsx
    │   │   ├── ApplyServicePage.jsx
    │   │   ├── BookingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ContactPage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── vercel.json
    └── .env.example
```

---

## ⚡ Local Setup (Development)

### 1. Clone / Download the project

```bash
git clone <your-repo-url>
cd cyber-cafe
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate
# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env as needed (SECRET_KEY, JWT_SECRET_KEY, etc.)

# Run the app (creates DB + seeds data automatically)
python app.py
```

Backend runs at: **http://localhost:5000**

The first run will:
- Create `cybercafe.db` (SQLite)
- Create all database tables
- Seed default services (Printing, Scanning, etc.)
- Create admin user: `admin@cybercafe.com` / `Admin@123456`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# VITE_API_URL=http://localhost:5000

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔑 Default Credentials

| Role  | Email                   | Password      |
|-------|-------------------------|---------------|
| Admin | admin@cybercafe.com     | Admin@123456  |

---

## 🌐 API Endpoints Reference

### Auth
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| POST   | /api/auth/register            | Register new user        |
| POST   | /api/auth/login               | Login                    |
| POST   | /api/auth/refresh             | Refresh access token     |
| GET    | /api/auth/me                  | Get current user         |
| PUT    | /api/auth/me                  | Update profile           |
| POST   | /api/auth/change-password     | Change password          |

### Services
| Method | Endpoint                      | Auth Required | Description          |
|--------|-------------------------------|---------------|----------------------|
| GET    | /api/services/                | No            | Get active services  |
| GET    | /api/services/all             | Admin         | Get all services     |
| GET    | /api/services/:id             | No            | Get single service   |
| POST   | /api/services/                | Admin         | Create service       |
| PUT    | /api/services/:id             | Admin         | Update service       |
| DELETE | /api/services/:id             | Admin         | Deactivate service   |

### Requests
| Method | Endpoint                          | Auth    | Description              |
|--------|-----------------------------------|---------|--------------------------|
| POST   | /api/requests/                    | User    | Create request           |
| GET    | /api/requests/my                  | User    | Get my requests          |
| GET    | /api/requests/:id                 | User    | Get single request       |
| POST   | /api/requests/:id/cancel          | User    | Cancel request           |
| GET    | /api/requests/admin/all           | Admin   | All requests             |
| PUT    | /api/requests/admin/:id/status    | Admin   | Update request status    |

### File Upload
| Method | Endpoint                          | Auth    | Description              |
|--------|-----------------------------------|---------|--------------------------|
| POST   | /api/upload/request/:id           | User    | Upload file to request   |
| GET    | /api/upload/file/:filename        | User    | Serve uploaded file      |
| DELETE | /api/upload/delete/:requestId     | User    | Delete uploaded file     |

### Bookings
| Method | Endpoint                          | Auth    | Description              |
|--------|-----------------------------------|---------|--------------------------|
| GET    | /api/bookings/available           | User    | Check slot availability  |
| POST   | /api/bookings/                    | User    | Create booking           |
| GET    | /api/bookings/my                  | User    | My bookings              |
| POST   | /api/bookings/:id/cancel          | User    | Cancel booking           |
| GET    | /api/bookings/admin/all           | Admin   | All bookings             |

### Admin
| Method | Endpoint                              | Auth    | Description              |
|--------|---------------------------------------|---------|--------------------------|
| GET    | /api/admin/dashboard                  | Admin   | Analytics data           |
| GET    | /api/admin/users                      | Admin   | All users                |
| GET    | /api/admin/users/:id                  | Admin   | User detail              |
| PUT    | /api/admin/users/:id/toggle-active    | Admin   | Toggle user status       |

### Contact
| Method | Endpoint                          | Auth    | Description              |
|--------|-----------------------------------|---------|--------------------------|
| POST   | /api/contact/                     | No      | Submit contact form      |
| GET    | /api/contact/admin/all            | Admin   | All contact messages     |
| PUT    | /api/contact/admin/:id/read       | Admin   | Mark as read             |

---

## 🚀 Deployment Guide

### Backend → Render.com (Free Tier)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo, select the `backend/` directory
4. Configure:
   - **Runtime**: Python 3.11
   - **Build command**: `pip install -r requirements.txt`
   - **Start command**: `gunicorn wsgi:app --bind 0.0.0.0:$PORT`
5. Add environment variables:
   ```
   FLASK_ENV=production
   SECRET_KEY=<generate-strong-key>
   JWT_SECRET_KEY=<generate-strong-key>
   DATABASE_URL=sqlite:///cybercafe.db
   FRONTEND_URL=https://your-frontend.vercel.app
   ADMIN_EMAIL=admin@yoursite.com
   ADMIN_PASSWORD=<strong-password>
   ```
6. Deploy — Render will give you a URL like `https://your-api.onrender.com`

> **For MySQL on production**: Create a MySQL database on PlanetScale or Railway and set:
> `DATABASE_URL=mysql+pymysql://user:pass@host/dbname`

---

### Frontend → Vercel (Free)

1. Push frontend to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select your repo, set root directory to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-api.onrender.com
   ```
5. Deploy — Vercel auto-detects Vite and handles routing via `vercel.json`

---

### Environment Variables Summary

#### Backend (.env)
```
FLASK_ENV=production
SECRET_KEY=minimum-32-character-secret-key
JWT_SECRET_KEY=minimum-32-character-jwt-secret
DATABASE_URL=sqlite:///cybercafe.db
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=10485760
ALLOWED_EXTENSIONS=pdf,jpg,jpeg,png,doc,docx
FRONTEND_URL=https://your-app.vercel.app
ADMIN_EMAIL=admin@yoursite.com
ADMIN_PASSWORD=StrongPassword123
```

#### Frontend (.env)
```
VITE_API_URL=https://your-api.onrender.com
```

---

## 🔐 Security Features

- ✅ Passwords hashed with **bcrypt**
- ✅ **JWT** access + refresh tokens (24h / 30d)
- ✅ Token auto-refresh via Axios interceptors
- ✅ Protected routes (frontend + backend)
- ✅ Admin-only routes with role check decorator
- ✅ File upload validation (type + size)
- ✅ CORS configured for specific origins
- ✅ SQL injection prevented via SQLAlchemy ORM
- ✅ Input validation on all endpoints
- ✅ Secure file names (UUID-based)

---

## 💳 Optional: Razorpay Payment Integration

To add Razorpay payments:

**Backend** – add to `requirements.txt`:
```
razorpay==1.4.1
```

Create `routes/payment.py`:
```python
import razorpay
client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@payment_bp.route('/create-order', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    order = client.order.create({
        'amount': int(data['amount'] * 100),  # paise
        'currency': 'INR',
        'receipt': f'rcpt_{data["request_id"]}',
    })
    return jsonify({'order_id': order['id'], 'amount': order['amount']})
```

**Frontend** – load Razorpay script and call checkout:
```javascript
const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY,
  amount: order.amount,
  currency: 'INR',
  order_id: order.order_id,
  handler: async (response) => {
    // Verify payment on backend
  }
}
new window.Razorpay(options).open()
```

---

## 📞 WhatsApp Integration

The app includes WhatsApp Chat buttons pre-configured in:
- **Footer** – "Chat on WhatsApp" button
- **Contact page** – "Start WhatsApp Chat" button

Update the phone number `919999999999` in these files with your actual WhatsApp business number.

---

## 🛠️ Tech Stack Summary

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS          |
| Routing   | React Router DOM v6                     |
| HTTP      | Axios with interceptors                 |
| Toast     | react-hot-toast                         |
| Charts    | Recharts                                |
| Icons     | Lucide React                            |
| Backend   | Flask 3 + Blueprints                    |
| Auth      | flask-jwt-extended (JWT)                |
| ORM       | SQLAlchemy + Flask-Migrate              |
| Database  | SQLite (dev) / MySQL (prod)             |
| Password  | Flask-Bcrypt                            |
| CORS      | Flask-CORS                              |
| Server    | Gunicorn (production)                   |

---

## 📝 License

MIT — free to use and modify for commercial projects.
#   c y b e r - c a f e  
 