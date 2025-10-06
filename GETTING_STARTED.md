# 🏈 Getting Started - NFL Squares

**Welcome!** Let's get your beautiful new NFL Squares app running!

---

## 🚀 Quick Start (Development)

### **Step 1: Navigate to Project**

```bash
cd /home/neil/Documents/new-nfl-squares
```

### **Step 2: Create Database**

```bash
npx prisma migrate dev --name init
```

This creates the SQLite database with all tables.

### **Step 3: Start Development Server**

```bash
npm run dev
```

### **Step 4: Open Browser**

```
http://localhost:3002
```

You'll be redirected to the setup page automatically!

---

## 🎯 First-Time Setup

### **1. Create Admin Account**

- **PIN:** Choose 4 or 6 digits (e.g., 1234)
- **Password:** Minimum 8 characters (for PIN recovery)
- Click "Complete Setup"

### **2. You're In!**

After setup, you'll be logged into the admin dashboard.

---

## 🎮 Testing the App

### **Test Flow 1: View Empty Board**

1. Go to admin dashboard
2. Since no boards exist yet, you'll see "No Boards Available"
3. This is normal! We need to build the board creation UI next.

### **Test Flow 2: Admin Features**

1. Login with your PIN
2. View admin dashboard
3. Toggle on-screen keyboard setting
4. Log out and back in

### **Test Flow 3: Manual Board Creation (Temporary)**

For now, you can create a test board manually:

```bash
# Open Prisma Studio
npx prisma studio
```

1. Go to Board table
2. Click "Add record"
3. Fill in:
   - **name:** "Test Super Bowl Board"
   - **gameId:** "401547644" (example ESPN game ID)
   - **teamHome:** "KC"
   - **teamAway:** "SF"
   - **costPerSquare:** 10
   - **payoutQ1:** 25
   - **payoutQ2:** 25
   - **payoutQ3:** 25
   - **payoutQ4:** 25
   - **status:** "open"
4. Save

Then refresh the main page - you'll see your board!

---

## 🎨 What You'll See

### **Main Board Display**

```
┌─────────────────────────────────────────┐
│  📱 Beautiful Game Header               │
│  Team Logos | Scores | Status           │
├──────────────────────┬──────────────────┤
│                      │                  │
│  🎯 10x10 Grid       │  📊 Board Info   │
│  - Team gradients    │  - Cost: $10     │
│  - Player initials   │  - Pot: $1000    │
│  - Quarter badges    │  - Winners       │
│  - Live highlighting │  - Stats         │
│                      │                  │
└──────────────────────┴──────────────────┘

[Buy Squares]  [Admin]
```

### **Buy Squares Flow**

1. Click "Buy Squares"
2. Select one or multiple squares (click to toggle)
3. Enter your name (on-screen keyboard if enabled)
4. Choose payment method
5. Squares are reserved!

### **Admin Dashboard**

- Board Management (coming soon!)
- Settings (keyboard toggle works!)
- Change PIN (coming soon!)

---

## 🔧 Development Commands

### **Database**

```bash
# View/edit database
npx prisma studio

# Reset database
rm -f prisma/dev.db
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### **Development**

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Check types
npx tsc --noEmit
```

### **Docker**

```bash
# Build and run
docker-compose up -d --build

# View logs
docker-compose logs -f nfl-squares

# Stop
docker-compose down

# Restart
docker-compose restart nfl-squares
```

---

## 📱 Mobile Testing

### **On Your Phone:**

1. Find your computer's IP address:
   ```bash
   ip addr show | grep inet
   ```

2. On your phone browser:
   ```
   http://YOUR_IP:3002
   ```

3. Test the responsive design!
4. Try the buy flow on touchscreen

---

## 🎯 What Works Right Now

### ✅ **Fully Functional**

- ✅ First-time setup (PIN + password)
- ✅ Admin login (PIN authentication)
- ✅ Board viewing (if manually created)
- ✅ Buy squares flow
- ✅ Multi-square selection
- ✅ On-screen keyboard (if enabled)
- ✅ Responsive design
- ✅ Team color gradients
- ✅ Beautiful UI

### 🚧 **Coming Soon**

- ⏳ Admin board creation UI
- ⏳ Finalize board (reveal numbers)
- ⏳ Mark payments paid/unpaid
- ⏳ Automatic winner calculation
- ⏳ QR code generation
- ⏳ Board archiving
- ⏳ Backup/restore

---

## 🎨 Styling Overview

### **Colors Used**

- **Background:** `#0a0f1e` (dark blue-black)
- **Primary:** `#3b82f6` (blue)
- **Secondary:** `#1e293b` (dark slate)
- **Accent:** Purple gradients
- **Success:** Green
- **Destructive:** Red

### **Components**

All shadcn/ui components from pickems:
- Button, Card, Dialog, Input, Label
- Badge, Switch, Tabs, Toast
- And more!

---

## 🐛 Troubleshooting

### **Port Already in Use**

```bash
# Kill process on port 3002
lsof -ti:3002 | xargs kill -9

# Or use a different port
PORT=3003 npm run dev
```

### **Database Locked**

```bash
# Close Prisma Studio and any other connections
# Then restart
```

### **Build Errors**

```bash
# Clean and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### **No Boards Showing**

1. Check database has boards: `npx prisma studio`
2. Check board status is not "archived"
3. Check console for API errors

---

## 📚 Helpful Resources

### **Documentation**

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- TailwindCSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

### **ESPN API**

- Game IDs: Check ESPN.com for game URLs
- Example: `espn.com/nfl/game/_/gameId/401547644`
- The `401547644` is the game ID

### **NFL Assets**

- Team colors: https://neilyboy.github.io/nfl-assets/
- All team data is already in `lib/espn-api.ts`

---

## 🎉 Next Steps

### **For Development:**

1. ✅ Run `npx prisma migrate dev`
2. ✅ Run `npm run dev`
3. ✅ Complete setup at `/setup`
4. ✅ Create test board via Prisma Studio
5. ✅ Test buy flow
6. 🚧 Build admin board creation UI
7. 🚧 Implement winner calculation

### **For Production:**

1. Update `.env` with production database path
2. Build Docker image
3. Deploy via docker-compose
4. Set up reverse proxy (Nginx)
5. Configure HTTPS
6. Done! 🎉

---

## 🔥 Cool Features to Try

### **Multi-Square Selection**

1. Go to Buy page
2. Click multiple squares
3. See total cost update
4. All purchased with one name!

### **Team Colors**

1. Notice grid rows/columns
2. Gradient backgrounds
3. Team-specific colors
4. Professional look!

### **On-Screen Keyboard**

1. Admin → Toggle keyboard ON
2. Go to Buy page
3. Click name field
4. Keyboard appears at bottom!

### **Auto-Cycling Boards**

1. Create multiple test boards
2. Watch them auto-cycle
3. Click arrows to manually navigate
4. Notice 20s pause after manual change

---

## 🎓 Understanding the Code

### **Key Files**

- `app/page.tsx` - Main board display
- `app/buy/page.tsx` - Square purchase flow
- `app/admin/page.tsx` - Admin dashboard
- `components/squares-grid.tsx` - The 10x10 grid
- `lib/espn-api.ts` - ESPN integration
- `lib/utils.ts` - Helper functions

### **Database Models**

- **AdminSettings** - PIN, password, settings
- **Board** - Game, costs, payouts
- **Square** - Individual squares
- **Winner** - Quarter winners
- **PaymentConfig** - Payment methods

---

## 💡 Pro Tips

1. **Use Prisma Studio** for quick database edits
2. **Check browser console** for API errors
3. **Test on mobile early** to catch responsive issues
4. **Use the keyboard toggle** - it's awesome on touchscreens!
5. **Create multiple test boards** to see auto-cycling

---

## 🚀 Ready to Build!

You now have:
- ✅ Beautiful foundation
- ✅ Working authentication
- ✅ Functional buy flow
- ✅ Stunning UI
- ✅ Docker deployment ready

**Next session: Let's build the admin board creation UI and winner calculation!**

---

**Need help?** Check:
- `PROJECT_STATUS.md` for detailed status
- `README.md` for project overview
- Browser console for errors
- Database via `npx prisma studio`

**Let's make something amazing!** 🏈✨
