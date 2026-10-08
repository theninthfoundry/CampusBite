# CampusBite — Smart Canteen Management System

A smart digital canteen ordering and kitchen management system built for students and canteen staff. Features smart preparation ETA estimation, real-time kitchen tracking, inventory safety thresholds with auto-disabling of depleted dishes, and co-occurrence recommendations.

---

## 🚀 Live Web App & Deployment

CampusBite is now available as a **responsive Web Application** deployable to the internet in seconds.

### Option 1: Run Locally (Instant, No Install Needed)
Double-click `index.html` in your file explorer, or run:
```powershell
npx serve .
```

### Option 2: Deploy Free via GitHub Pages (Automated CI/CD)
1. Initialize git and push to your GitHub repository:
   ```powershell
   git init
   git add .
   git commit -m "feat: CampusBite smart canteen system"
   git branch -M main
   git remote add origin https://github.com/theninthfoundry/CampusBite.git
   git push -u origin main
   ```
2. In your GitHub repository:
   * Go to **Settings** → **Pages**.
   * Under **Build and deployment** → **Source**, select **GitHub Actions**.
   * The included `.github/workflows/deploy.yml` workflow will automatically build and publish your site at:
     **https://theninthfoundry.github.io/CampusBite/**

### Option 3: Deploy Free via Vercel (1-Click)
1. Push your repository to GitHub.
2. Go to [https://vercel.com/new](https://vercel.com/new) and import your `campusbite` repository.
3. Click **Deploy** (using the included `vercel.json`). Your app is live with a custom HTTPS URL instantly!

---

## 🔑 Demo Login Accounts

| Role | Email / Student ID | Password | Portal Features |
| :--- | :--- | :--- | :--- |
| **Student** | `demo@campus.edu` *(or `25R11A0501`)* | `student123` | Menu search, tray, dynamic ETA, live order tracking |
| **Student** | `chandrashekar@campus.edu` *(or `25R11A0522`)* | `student123` | Menu search, tray, dynamic ETA, live order tracking |
| **Canteen Admin** | `admin@campus.edu` | `admin123` | Live Kitchen Kanban, menu editor, inventory & restock, analytics |

---

## 💡 Core Smart Features

1. **Dynamic Kitchen ETA**:
   $$\text{ETA} = \max(\text{prep\_time of tray items}) + (2 \times \text{queued orders in kitchen})$$
2. **Auto-Stock Safety & Auto-Disabling**:
   When ingredient stock falls to or below `min_qty`, dependent dishes are automatically switched to sold out. Restocking ingredient stock re-enables dishes.
3. **Smart Co-Occurrence Recommendations**:
   Finds the user's most frequently ordered dish and recommends accompanying items frequently paired by students.
4. **Real-time Live Sync**:
   Cross-tab `localStorage` synchronization allows testing student ordering in one tab and kitchen staff processing in another with instant updates.

---

## ☕ JavaFX Desktop Version (OOPJ PBL)

To run the native JavaFX desktop version:
```powershell
mvn javafx:run
```
*(Requires Java 17+ and Apache Maven).*
