# Adams X Project — Monk Mode Lead Capture Page

A premium personal brand lead magnet landing page for **Adams X** — built to capture emails in exchange for the **7-Day Monk Mode Starter Kit**, with a waitlist for *Comeback: Unrecognizable*.

---

## 🚀 Deploy to Vercel (Step-by-Step)

### Prerequisites
- A [Vercel account](https://vercel.com) (free)
- A [Resend account](https://resend.com) with an API key
- Your domain verified in Resend (or use `onboarding@resend.dev` for testing)

---

### Step 1 — Upload to GitHub

1. Create a new **private** GitHub repository
2. Upload all project files (drag & drop on GitHub, or use Git)
3. **Do NOT upload** the `.env` file — it contains your real API key

---

### Step 2 — Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"** and select your GitHub repo
3. Leave all build settings as default (Vercel will auto-detect Node.js)
4. Click **"Deploy"**

---

### Step 3 — Add Environment Variables in Vercel

After the first deploy, go to your project in Vercel:

1. Click **Settings → Environment Variables**
2. Add the following variables:

| Variable Name | Value |
|---|---|
| `RESEND_API_KEY` | Your Resend API key (starts with `re_`) |
| `SENDER_EMAIL` | The email you verified in Resend (e.g. `hello@yourdomain.com`) |
| `NOTIFICATION_EMAIL` | Your personal email to receive lead alerts |

3. Click **Save** then go to **Deployments → Redeploy** to apply the variables.

---

### Step 4 — Custom Domain (Optional)

1. In Vercel, go to **Settings → Domains**
2. Add your custom domain and follow the DNS instructions

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Copy the example env file and fill in your keys
cp .env.example .env

# Start the dev server (auto-restarts on changes)
npm run dev
```

Visit: **http://localhost:8000**

---

## 📁 Project Structure

```
premium-lead-capture/
├── index.html          # Complete single-page landing page (HTML + CSS + JS)
├── server.js           # Express backend with Resend API integration
├── package.json        # Node.js dependencies
├── vercel.json         # Vercel deployment configuration
├── .env.example        # Environment variable template (safe to commit)
├── .env                # Your real secrets — DO NOT commit this
├── adams-x.jpg         # Brand photo
├── campaign_image_1.png # Generated brand campaign image 1
└── campaign_image_2.png # Generated brand campaign image 2
```

---

## ✉️ Email Flow

| Action | Who Gets Emailed |
|---|---|
| Visitor claims the Starter Kit | Visitor gets the welcome email; you get a lead alert |
| Visitor joins the Unrecognizable waitlist | Visitor gets a confirmation; you get a waitlist alert |

All waitlist emails are tagged `unrecognizable-waitlist` in Resend for easy filtering.

---

## ⚠️ Important Security Notes

- **Never commit your `.env` file** to GitHub
- Your `.gitignore` should include `.env` and `node_modules/`
- Use Vercel's Environment Variables dashboard to store secrets safely

---

Built by Adams X Project © 2026
