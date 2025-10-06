# 🏈 NFL Office Squares

<div align="center">

![NFL Squares](https://img.shields.io/badge/NFL-Squares-blue?style=for-the-badge&logo=nfl)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

**A beautiful, fully-featured NFL Squares board application with automatic winner detection, live ESPN scores, and admin management.**

[Features](#-features) • [Quick Start](#-quick-start) • [Docker Deploy](#-docker-deployment) • [Demo](#-demo)

</div>

---

## ✨ Features

### **🎯 Automatic Winner Detection** ⚡ NEW!
- ✅ **Fully automatic** - Winners detected when quarters end
- ✅ Works during halftime, quarter transitions, and game end
- ✅ Uses real quarter-ending scores from ESPN
- ✅ No manual admin intervention needed
- ✅ Polls ESPN API every 60 seconds
- ✅ Instant badge display on winning squares

### **👥 User Features**
- ✅ Anonymous square claiming (no registration)
- ✅ Multi-select squares (buy multiple at once)
- ✅ On-screen keyboard for touchscreens
- ✅ Shift key for special characters (@, #, $, etc.)
- ✅ Payment via PayPal/Venmo QR codes or Cash
- ✅ Real-time game scores from ESPN
- ✅ Live potential winner highlighting (glowing effect)
- ✅ Square details popup (pauses board rotation)
- ✅ Beautiful modern dark theme
- ✅ Fully mobile responsive

### **🔐 Admin Features**
- ✅ Secure PIN-protected admin panel
- ✅ Forced re-authentication (logout on navigation)
- ✅ Create boards from ESPN game schedule
- ✅ Percentage OR dollar amount payouts
- ✅ Payment method configuration per board
- ✅ Finalize boards (reveal random numbers)
- ✅ Track payments with bulk actions
- ✅ Manage squares (view, remove individual/all)
- ✅ Quick stats (sold, players, revenue)
- ✅ Edit board names
- ✅ Archive boards (hide from view)
- ✅ Delete boards (with double confirmation)
- ✅ Export/Import backups (JSON)
- ✅ On-screen keyboard toggle setting

### **🏈 Board Display**
- ✅ 10x10 grid with team color gradients
- ✅ Auto-rotating carousel (multiple boards)
- ✅ Pauses rotation during square interaction
- ✅ Manual navigation with arrow buttons
- ✅ Quarter winner badges (Q1-Q4) with colors
- ✅ Winners panel with payout amounts
- ✅ Total pot and fill statistics
- ✅ Responsive layout (mobile/tablet/desktop)

## 🚀 Quick Start

### Option 1: Docker (Recommended) 🐳

**Prerequisites:** Docker and Docker Compose installed

```bash
# Clone the repository
git clone https://github.com/neilyboy/nfl-office-squares.git
cd nfl-office-squares

# Copy environment file
cp .env.example .env

# Edit .env and set your admin PIN
nano .env  # or use your favorite editor

# Start everything!
docker compose up -d

# Check logs
docker compose logs -f app
```

Access at: **http://localhost:3002**

The database, migrations, and app will all start automatically! 🎉

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed admin settings (optional)
npx prisma db seed

# Start dev server
npm run dev
```

Access at: **http://localhost:3002**

### First-Time Setup

1. Navigate to http://localhost:3002
2. You'll be redirected to `/setup`
3. Create your admin PIN (6 digits)
4. Create a recovery password
5. Done! Click "Admin Dashboard" to create your first board

---

## 🐳 Docker Deployment

### Production Deployment

**Docker Compose includes:**
- ✅ Next.js application (optimized production build)
- ✅ PostgreSQL database (persistent volume)
- ✅ Automatic database migrations
- ✅ Health checks
- ✅ Restart policies
- ✅ Network isolation

### Environment Variables

Create a `.env` file (or copy `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://squares:your_db_password@db:5432/nfl_squares?schema=public"
POSTGRES_USER=squares
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=nfl_squares

# App Configuration
NODE_ENV=production
PORT=3002

# Admin Setup (Optional - can be set via /setup page)
# ADMIN_PIN_HASH=... (generated from setup page)
# ADMIN_PASSWORD_HASH=... (generated from setup page)

# Security (Optional)
FORCE_SECURE_COOKIES=false  # Set to true if behind HTTPS proxy
```

### Docker Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Reset database (WARNING: Deletes all data)
docker compose down -v
docker compose up -d

# Backup database
docker compose exec db pg_dump -U squares nfl_squares > backup.sql

# Restore database
cat backup.sql | docker compose exec -T db psql -U squares nfl_squares
```

### Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build

# Migrations run automatically on startup
```

### Reverse Proxy Setup (Nginx)

```nginx
server {
    listen 80;
    server_name squares.yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Health Check

The app includes a health check endpoint:

```bash
curl http://localhost:3002/api/health
# Should return: {"status": "ok"}
```

---

## 🎨 Tech Stack

**Frontend**
- Next.js 14 (App Router) - React framework
- React 18 - UI library
- TypeScript - Type safety
- TailwindCSS - Styling
- shadcn/ui - Component library
- react-simple-keyboard - On-screen keyboard
- Lucide Icons - Icon library

**Backend**
- Next.js API Routes - RESTful endpoints
- Prisma ORM - Database toolkit
- PostgreSQL (Docker) / SQLite (Local) - Database
- bcrypt - Password hashing
- ESPN API - Live game scores

**DevOps**
- Docker & Docker Compose - Containerization
- GitHub Actions ready - CI/CD
- Health checks - Monitoring

## 📁 Project Structure

```
new-nfl-squares/
├── prisma/
│   └── schema.prisma
├── public/
│   ├── team_logos/
│   └── team_wordmarks/
├── app/
│   ├── api/           # API routes
│   ├── admin/         # Admin pages
│   ├── buy/           # Buy squares page
│   ├── setup/         # First-time setup
│   └── page.tsx       # Main board display
├── components/
│   ├── ui/            # shadcn/ui components
│   └── *.tsx          # Feature components
└── lib/
    ├── db.ts          # Prisma client
    ├── auth.ts        # PIN hashing
    ├── espn-api.ts    # ESPN integration
    └── utils.ts       # Helpers
```

## 🎯 Key Differences from Old Version

### **UI/UX**
- ✨ Modern dark theme with gradients
- ✨ Card-based layouts
- ✨ Smooth animations
- ✨ Better mobile experience
- ✨ Professional toast notifications

### **Features**
- ✅ On-screen keyboard is now an admin setting
- ✅ Quarter winner badges persist forever
- ✅ Board info panel shows all stats
- ✅ Better potential winner display
- ✅ Percentage OR dollar payouts
- ✅ Improved admin dashboard

### **Tech**
- ⚡ Next.js 14 (App Router)
- ⚡ TypeScript for type safety
- ⚡ Modern component architecture
- ⚡ Better session management

## 📝 How It Works

### **Admin Workflow**
1. First-time setup: Create PIN + password
2. Login to admin dashboard
3. Create board: Select game, set cost, configure payouts
4. Configure payment methods (PayPal/Venmo/Cash)
5. Users buy squares
6. Mark payments as complete
7. Finalize board (reveal numbers)
8. Live game updates show winners
9. Archive when complete

### **User Workflow**
1. View main board display
2. Click "Buy Square"
3. Select one or more squares
4. Enter name (on-screen keyboard if enabled)
5. Choose payment method
6. Scan QR code or pay cash
7. Squares are reserved
8. Watch live game for winners!

## 🏆 Quarter Winners

When a quarter ends:
- ✅ Winning square gets badge (Q1, Q2, Q3, or Q4)
- ✅ Badge persists for entire game
- ✅ All 4 badges visible at game end
- ✅ Squares can win multiple quarters (shows "Q1,Q2")
- ✅ Winner info displayed in board panel

## 📱 Mobile Support

- Fully responsive design
- No horizontal scrolling
- Touch-friendly tap targets
- Board info moves to bottom on mobile
- All features work perfectly

## 🔒 Security

- bcrypt password hashing
- PIN-protected admin
- Session management
- Input sanitization
- Secure cookie handling

## 🎨 Design Credits

UI/UX inspired by the beautiful NFL Pickems application.  
Built with love for football fans! 🏈

---

## 📜 License

MIT License - feel free to use this for your office, friends, or Super Bowl party!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions

---

<div align="center">

**Built with ❤️ for football fans**

**Ready for your Super Bowl party!** 🎉🏈

[⬆ Back to Top](#-nfl-office-squares)

</div>
