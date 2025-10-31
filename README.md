# Cartelia Backend MVP

Complete Node.js/Express backend for Cartelia - the all-in-one SaaS platform for restaurants to manage digital menus, QR codes, customer reviews, and marketing campaigns via email and WhatsApp.

## 🎯 What is Cartelia?

Cartelia helps restaurants:
- Create digital menus with QR codes
- Collect and manage customer reviews
- Build customer databases with GDPR-compliant consent
- Send marketing campaigns via email and WhatsApp
- Track analytics and engagement
- Accept reservations (feature toggle)
- Get AI-powered assistance with a mini-Copilot

## 🧱 Monorepo Structure

The repository now contains both the Node.js backend and the new Vite/React frontend.

```
/
├── src/                  # Backend source code (Express, Prisma)
├── prisma/               # Prisma schema and migrations
├── frontend/             # NEW – Cartelia dashboard & public frontend
│   ├── src/              # React application source
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies & scripts
│   └── README.md         # Frontend deployment guide
├── package.json          # Backend dependencies & scripts
└── README.md             # Backend setup documentation (this file)
```

See `frontend/README.md` for frontend-specific setup and deployment instructions.

## 📋 Prerequisites

Before you start, you'll need:

1. **Supabase Account** (free tier): [https://supabase.com](https://supabase.com)
2. **Railway Account** (free tier): [https://railway.app](https://railway.app)
3. **Node.js** (v18 or higher): [https://nodejs.org](https://nodejs.org)
4. **SendGrid Account** (for Cartelia shared domain + custom domains): [https://sendgrid.com](https://sendgrid.com)
5. **Google Cloud Account** (optional, required for Gmail OAuth + Google Reviews import): [https://cloud.google.com](https://cloud.google.com)

## 🚀 Setup Instructions

### Step 1: Create Your Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new account
2. Click "New Project" and choose a name (e.g., "cartelia-db")
3. Set a strong database password and select a region close to you
4. Wait for the project to be created (takes 1-2 minutes)

#### Configure Supabase Storage

5. Go to **Storage** in the left sidebar
6. Click "Create bucket" and create these three buckets:
   - `logos` (public)
   - `menu-images` (public)
   - `whatsapp-sessions` (private)
7. For each public bucket, go to "Policies" and enable public access for reading

#### Get Your Supabase Credentials

8. Go to **Settings** → **API** in the left sidebar
9. Copy these three values (you'll need them later):
   - **URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...`
   - **service_role key**: `eyJhbG...` (keep this secret!)

#### Get Your Database Connection String

10. Go to **Settings** → **Database**
11. Scroll to "Connection string" and copy the **URI** format
12. Replace `[YOUR-PASSWORD]` with your database password
13. It should look like: `postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres`

### Step 2: Download and Setup the Backend

1. Download this project and extract it
2. Open a terminal/command prompt in the project folder
3. Copy the example environment file:

```bash
cp .env.example .env
```

4. Open `.env` in a text editor and fill in the values:

```env
# Server
PORT=3000
NODE_ENV=production
PUBLIC_BASE_URL=https://your-app.railway.app

# Supabase (from Step 1)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Database (from Step 1)
DATABASE_URL=postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres

# Email Providers (see Step 5)
SENDGRID_API_KEY=SG.xxxxx                                      # For Cartelia subdomain and custom domain setup
SENDGRID_VERIFIED_DOMAIN=noreply.cartelia.app                 # Verified domain for Cartelia option

# Google OAuth (for Gmail email option - see Step 6)
GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_OAUTH_REDIRECT_URI=https://api.cartelia.app/email/oauth/google/callback

# Hugging Face (optional - for AI copilot)
HUGGINGFACE_MISTRAL_ENDPOINT=
HUGGINGFACE_API_TOKEN=

# Google Business Profile (optional - for review imports)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=

# CORS Origins (comma-separated list of allowed frontend URLs)
CORS_ORIGINS=http://localhost:3000,https://your-frontend.com
```

5. Install dependencies:

```bash
npm install
```

6. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
```

7. (Optional) Seed the database with sample data:

```bash
npm run prisma:seed
```

### Step 3: Test Locally

1. Start the development server:

```bash
npm run dev
```

2. Open your browser and go to [http://localhost:3000/health](http://localhost:3000/health)
3. You should see: `{"status":"ok"}`

4. Test an endpoint with curl:

```bash
curl http://localhost:3000/onboarding
```

### Step 4: Deploy to Railway

1. Go to [https://railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo" (or "Empty Project")
3. If using GitHub:
   - Connect your GitHub account
   - Select your repository
   - Railway will auto-detect Node.js
4. If using manual upload:
   - Create a new empty project
   - Click "Add Service" → "GitHub Repo" or upload files directly

#### Add Environment Variables

5. Click on your service → **Variables** tab
6. Click "Raw Editor" and paste all your environment variables from `.env`
7. **Important**: Update `PUBLIC_BASE_URL` to your Railway URL (e.g., `https://cartelia-backend-production.up.railway.app`)

#### Configure Build & Start Commands

8. Go to **Settings** → **Build**
9. Set Build Command: `npm run prisma:generate && npm run build`
10. Set Start Command: `npm run prisma:migrate:deploy && npm start`

#### Deploy

11. Click "Deploy" or push to your GitHub repo
12. Wait for deployment (2-3 minutes)
13. Click on the generated URL to test: `https://your-app.railway.app/health`

### Step 5: Configure Email Providers

Cartelia now supports three email providers per restaurant. After configuring the environment variables, owners can pick their preferred option directly from **Paramètres → Emails** in the dashboard.

#### 1. Cartelia (recommandé)
- Uses the shared domain `noreply.cartelia.app`
- Requires a SendGrid parent API key (`SENDGRID_API_KEY`) with access to the verified domain (`SENDGRID_VERIFIED_DOMAIN`)
- No DNS actions required per restaurant — signup is instant

#### 2. Mon Gmail (rapide)
- Perfect for quick onboarding and testing (limit ~500 emails/day per Gmail account)
- Create a Google Cloud project, enable the Gmail API, and create OAuth credentials
- Configure the redirect URI to point to your backend: `https://YOUR_API_DOMAIN/email/oauth/google/callback`
- Add `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, and `GOOGLE_OAUTH_REDIRECT_URI` to `.env`
- In the dashboard, restaurant owners click **Connecter Gmail** and complete the OAuth flow

#### 3. Mon domaine (professionnel)
- Creates an isolated SendGrid sub-user + API key per restaurant
- Provide your parent SendGrid API key (`SENDGRID_API_KEY`) with permission to manage sub-users
- In the dashboard, enter the restaurant's custom domain (e.g., `monresto.fr`) to receive the DNS records (TXT + CNAME)
- Add the records at your registrar, wait for propagation, then click **Vérifier**
- Once validated, emails are sent from `contact@monresto.fr` with enhanced deliverability

> **Migration note:** Existing restaurants default to the Cartelia option with an automatic address `resto_{id}@noreply.cartelia.app`.

### Step 6: Setup Google Business Profile - Optional

This allows importing reviews from Google My Business.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google My Business API"
4. Create OAuth 2.0 credentials
5. Follow Google's OAuth flow to get a refresh token
6. Add credentials to `.env`:

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REFRESH_TOKEN=xxxxx
```

**Note:** If not configured, the API will work but return empty review lists.

### Step 7: Pair WhatsApp

WhatsApp integration requires scanning a QR code to connect your phone.

1. Make sure your backend is running (locally or on Railway)
2. Create a test restaurant and user in your database
3. Call the WhatsApp QR endpoint:

```bash
curl -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  "https://your-app.railway.app/campaigns/integrations/whatsapp/qr?restaurantId=1"
```

4. The API returns a base64 QR code image
5. Display it in your frontend and scan with WhatsApp mobile app
6. Once connected, WhatsApp sessions persist in Supabase Storage

**Important:** Run this on a server with a persistent process. Railway's free tier may restart containers, requiring re-pairing.

## 📡 API Endpoints

### Authentication

All protected endpoints require: `Authorization: Bearer <supabase-jwt-token>`

#### `GET /auth/me`
Get current user and restaurant info.

**Response:**
```json
{
  "user": { "id": 1, "email": "owner@example.com" },
  "restaurants": [{ "id": 1, "name": "Le Petit Bistrot", "logo": "..." }]
}
```

#### `GET /onboarding`
Get onboarding steps for new users.

### QR Codes

#### `POST /qr/create`
Create a new QR code.

**Body:**
```json
{
  "restaurantId": 1,
  "type": "menu",
  "targetId": 1
}
```

**Response:**
```json
{
  "qrUrl": "https://api.cartelia.app/qr/1",
  "landingUrl": "https://api.cartelia.app/menu/1"
}
```

#### `GET /qr/:id`
Get QR code image (PNG).

#### `GET /qr/stats/scans?restaurantId=1`
Get scan statistics.

### Public Pages (No Auth Required)

#### `GET /menu/:id`
Get menu for display (tracks scan).

#### `GET /review/:id`
Get review page for restaurant.

#### `GET /register/:id`
Get registration form for restaurant.

#### `POST /public/register`
Register a new client.

**Body:**
```json
{
  "restaurantId": 1,
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "+33612345678",
  "whatsappConsent": true
}
```

### Reviews (Avis)

#### `GET /avis?restaurantId=1`
List all reviews.

#### `POST /avis/request`
Request reviews from clients.

**Body:**
```json
{
  "restaurantId": 1,
  "via": "email",
  "clientIds": [1, 2, 3]
}
```

#### `GET /avis/stats?restaurantId=1`
Get review statistics and trends.

#### `POST /avis/import-google`
Import reviews from Google Business Profile.

### Campaigns

#### `POST /campaigns/create`
Create a new campaign.

**Body:**
```json
{
  "restaurantId": 1,
  "type": "whatsapp",
  "message": "Bonjour! Venez découvrir notre nouveau menu."
}
```

#### `GET /campaigns?restaurantId=1`
List all campaigns.

#### `POST /campaigns/send`
Send a campaign.

**Body:**
```json
{
  "campaignId": 1,
  "restaurantId": 1,
  "segment": "consented",
  "limit": 50
}
```

**Important:** Enforces GDPR consent and 50 message cap per campaign.

#### `GET /campaigns/integrations/whatsapp/status?restaurantId=1`
Check if WhatsApp is paired.

#### `GET /campaigns/integrations/whatsapp/qr?restaurantId=1`
Get WhatsApp pairing QR code.

### Emails

#### `POST /email/setup`
Configure the sending provider for a restaurant.

**Body:**
```json
{
  "restaurantId": 1,
  "option": "cartelia_subdomain",
  "domain": "monresto.fr",
  "gmailCode": "4/0AfJoh..."
}
```
- `option`: `cartelia_subdomain` | `gmail` | `sendgrid_sub`
- `domain`: required only for `sendgrid_sub`
- `gmailCode`: provided by the OAuth callback when connecting a Gmail account

**Response:**
```json
{
  "success": true,
  "sender": "resto_1@noreply.cartelia.app",
  "verificationPending": false,
  "dnsRecords": []
}
```

#### `GET /email/status?restaurantId=1`
Returns the current provider, sender address, verification status, and quota usage for the day.

#### `POST /email/verify-domain`
Re-check custom domain DNS configuration for SendGrid sub-accounts.

**Body:**
```json
{
  "restaurantId": 1
}
```

#### `POST /email/send`
Internal helper used by other routes to send a single transactional email.

**Body:**
```json
{
  "restaurantId": 1,
  "to": [{ "email": "client@example.com", "name": "Jean" }],
  "subject": "Bienvenue !",
  "template": "welcome",
  "variables": { "restaurant": { "name": "Le Bistro" } }
}
```

#### `POST /email/send-bulk`
Batch helper for marketing campaigns. Applies per-restaurant quota checks.

**Body:**
```json
{
  "restaurantId": 1,
  "recipients": [{ "email": "client@example.com", "name": "Jean" }],
  "subject": "Offre spéciale",
  "html": "<p>Promo limitée</p>"
}
```

#### `GET /email/oauth/google/url`
Returns the Google OAuth consent URL for Gmail integration.

**Response:**
```json
{ "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }
```

#### `GET /email/oauth/google/callback`
OAuth callback endpoint. Redirects the browser back to the dashboard with a `gmailCode` query parameter that finalises the setup.

### Menus

#### `POST /menu`
Create a menu.

#### `PUT /menu/:id`
Update a menu.

#### `GET /menu/:id`
Get menu details.

#### `POST /menu/:id/upload-image`
Upload menu item image (multipart/form-data).

#### `GET /menu/:id/pdf`
Download menu as PDF.

### Copilot (AI Assistant)

#### `POST /copilot`
Send a command to the AI assistant.

**Body:**
```json
{
  "command": "créer qr menu",
  "restaurantId": 1
}
```

**Response:**
```json
{
  "action": "create-qr-menu",
  "params": { "restaurantId": 1 }
}
```

Or:
```json
{
  "text": "Pour créer un QR code..."
}
```

### Dashboard

#### `GET /dashboard/stats?restaurantId=1`
Get dashboard statistics.

### Reservations (Feature Toggle Required)

#### `POST /reservations`
Create a reservation.

#### `GET /reservations?restaurantId=1`
List reservations.

#### `POST /reservations/notify`
Send reservation notification.

### Feedback & Waitlist

#### `POST /feedback`
Submit feedback.

#### `POST /waitlist`
Join the global waitlist.

## 🔒 GDPR & Consent

Cartelia is designed with GDPR compliance in mind:

- **WhatsApp Consent**: The `Client.whatsappConsent` field must be `true` before sending any WhatsApp messages
- **Explicit Opt-in**: Registration forms include consent checkboxes
- **Enforcement**: Campaign sends automatically filter clients without consent
- **Storage**: All data stored in Supabase (EU region available)
- **Right to Access**: Restaurant owners can export client data via API
- **Right to Deletion**: Delete client records via Prisma or custom endpoints

### Best Practices

1. Always display consent language: "J'accepte de recevoir des messages WhatsApp de [Restaurant Name]"
2. Provide unsubscribe links in emails
3. Log all campaign sends for audit trails
4. Set `whatsappConsent: false` if client opts out

## 🧪 Testing with Postman

A Postman collection is available for quick testing. Import it:

1. Open Postman
2. Click "Import" → "File"
3. Select `postman_collection.json`
4. Update the `{{base_url}}` variable to your Railway URL
5. Add your Supabase JWT token to the Authorization header

## 🐛 Troubleshooting

### "Invalid token" errors
- Make sure you're using a valid Supabase JWT from `supabase.auth.getSession()`
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### WhatsApp won't pair
- Ensure Railway/server doesn't restart frequently (affects session)
- Check that `whatsapp-sessions` bucket exists and is private
- Try deleting old session files and re-pairing

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check that Supabase project is not paused (free tier pauses after 1 week of inactivity)
- Run `npm run prisma:migrate:deploy` to ensure migrations are applied

### Email sending fails
- Verify `BREVO_API_KEY` is valid
- Check Brevo dashboard for sending limits (300 emails/day on free plan)
- Ensure sender email is verified in Brevo

### Build fails on Railway
- Check that `prisma generate` runs before `build` script
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Check Railway logs for specific error messages

## 📊 Beta Testing Checklist

Before launching to 30-50 restaurants:

- [ ] Test all endpoints with real data
- [ ] Verify GDPR consent enforcement
- [ ] Test WhatsApp pairing on production
- [ ] Configure email sending limits in Brevo
- [ ] Set up monitoring/logging (e.g., Sentry, LogRocket)
- [ ] Create user documentation for restaurant owners
- [ ] Test with 3-5 pilot restaurants
- [ ] Load test with 1,000 waitlist signups
- [ ] Configure backups for Supabase database
- [ ] Set up domain and SSL certificate
- [ ] Create support channel (email, chat)
- [ ] Prepare onboarding materials (videos, guides)

## 🎓 Architecture Overview

```
Frontend (HTML/React) 
    ↓ (fetch/axios with JWT)
Backend (Node.js/Express)
    ↓
├── Supabase Auth (JWT verification)
├── Supabase Storage (files, WhatsApp sessions)
├── PostgreSQL (Prisma ORM)
├── Brevo API (transactional emails)
├── WhatsApp Web.js (campaigns)
├── Google Business Profile API (review imports)
└── Hugging Face (Mistral AI for Copilot)
```

## 📦 Project Structure

```
cartelia-backend/
├── src/
│   ├── lib/              # Integration clients
│   │   ├── prisma.ts
│   │   ├── supabase.ts
│   │   ├── storage.ts
│   │   ├── brevo.ts
│   │   ├── whatsapp.ts
│   │   ├── qr.ts
│   │   ├── pdf.ts
│   │   ├── mistral.ts
│   │   ├── gmb.ts
│   │   └── analytics.ts
│   ├── middleware/       # Auth middleware
│   │   └── auth.ts
│   ├── routes/           # API routes
│   │   ├── auth.ts
│   │   ├── onboarding.ts
│   │   ├── qr.ts
│   │   ├── public.ts
│   │   ├── avis.ts
│   │   ├── campaigns.ts
│   │   ├── menu.ts
│   │   ├── copilot.ts
│   │   ├── dashboard.ts
│   │   ├── reservations.ts
│   │   ├── feedback.ts
│   │   ├── waitlist.ts
│   │   └── index.ts
│   ├── types/            # TypeScript declarations
│   ├── config.ts         # Environment config
│   └── server.ts         # Express app
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # SQL migrations
│   └── seed.ts           # Sample data
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Brevo API Documentation](https://developers.brevo.com/)
- [WhatsApp Web.js Guide](https://wwebjs.dev/)

## 📝 License

MIT License - Feel free to use this for your restaurant projects!

## 🤝 Support

For issues or questions:
- GitHub Issues: [your-repo/issues]
- Email: support@cartelia.app
- Discord: [your-discord-link]

---

**Built with ❤️ for restaurants worldwide**
