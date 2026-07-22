# TripVault ✈️ — Premium Travel Planning & Budgeting Platform

TripVault is a production-ready, security-first travel organizer built on the MERN stack. Designed for elite adventurers, it allows users to plan structured daily itineraries, track trip expenses with visual charts, secure passport and visa copies in a cloud document vault, and leverage the Gemini AI assistant to orchestrate luxury getaways instantly.

---

## 🚀 Features

- **Gemini AI travel co-pilot**: Instantiate a chat terminal to draft luxury itineraries, select dining reservations, and plan checklist items in seconds.
- **Visual Budget & Expenses tracker**: Record cash or card outflows across categories (Food, Booking, Transport, etc.) and analyze spending via interactive Recharts pie charts.
- **Secure Document Vault**: Upload visa PDFs, flight boarding passes, and passport copies directly to the cloud (backed by Cloudinary).
- **Responsive Premium Interface**: A cohesive gold-on-dark, glassmorphic layout adapted to screens from 375px mobile viewports up to large desktop monitors.
- **Dynamic Weather & Places integration**: Search coordinates, review local conditions, and convert currencies instantly using real-time API integrations.
- **Social Profiles**: Share customized public summaries of travel adventures with dynamic star ratings and flagship imagery.
- **PDF Export**: Generate formatted PDF document summaries of all travel vault items directly from the backend server.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, React Router DOM v6, Lucide React (Icons), Recharts (Visualizations), Canvas Confetti, Axios.
- **Backend**: Node.js, Express.js, JWT Authentication, Multer, Multer-Storage-Cloudinary, PDFKit (PDF generation).
- **Database**: MongoDB Atlas (NoSQL DB backing).
- **Hosting & Infrastructure**: Vercel (Frontend), Render (Backend), Cloudinary (Image & Asset CDN).

---

## 📂 Folder Structure

```text
tripvault/
├── backend/
│   ├── config/             # DB & Cloudinary credentials setup
│   ├── controllers/        # Business logic handlers (auth, trip, upload)
│   ├── middleware/         # JWT parsing & upload storage controls
│   ├── models/             # Mongoose Schemas (User, Trip, Expense, Document)
│   ├── routes/             # Express server endpoints
│   ├── server.js           # Express main server execution
│   └── package.json
└── frontend/
    ├── components/         # Reusable UI components (Navbar, Footer, Skeleton)
    ├── context/            # Global state context (AuthContext)
    ├── pages/              # SPA route pages (Dashboard, AIChat, TripDetails)
    ├── services/           # Axios network configurations & API requests
    ├── styles/             # Modular CSS stylesheet cascading (globals, responsive)
    ├── vercel.json         # Vercel deployment route rewrites
    ├── vite.config.js      # Build proxy bindings
    └── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend` directory with the following keys:

```ini
PORT=8000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signing_key_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_google_gemini_generative_ai_key
FRONTEND_URL=your_deployed_vercel_frontend_url
```

Create a `.env` file inside the `frontend` directory with the following key for production:

```ini
VITE_API_URL=your_deployed_render_backend_url
```

---

## 🛠️ Installation & Run Locally

### Prerequisites
- Node.js installed (v16+ recommended)
- MongoDB running locally or a MongoDB Atlas account

### 1. Clone & Set Up Backend
```bash
cd backend
npm install
npm run dev
```
The server will boot on `http://localhost:8000`.

### 2. Set Up Frontend
```bash
cd ../frontend
npm install
npm run dev
```
The client dashboard will compile and open at `http://localhost:5180`.

---

## ☁️ Deployment Guides

### Backend: Render
1. Create a new **Web Service** on Render.
2. Link your Git repository.
3. Configure the build commands:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add all environment variables listed in the Environment Variables section above.

### Frontend: Vercel
1. Add a new project on Vercel and import your Git repository.
2. Configure the directory settings:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add the production environment variable:
   - `VITE_API_URL` pointing to your Render backend domain (e.g. `https://tripvault-api.onrender.com`).

---

## 📸 Screenshots & Demo

- **Live Demo Link**: `https://tripvault-client.vercel.app` (Placeholder)
- **Screenshots**:
  ![Dashboard Screenshot](https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80)
  *Premium dashboard visual view with skeleton load transitions.*

---

## 🔮 Future Improvements

- Add Multi-currency support with dynamic live rate calculations.
- Introduce collaborative travel vaults, allowing multiple users to edit the same trip in real time.
- Implement Offline Sync support using service workers.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
