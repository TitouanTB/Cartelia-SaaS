# Cartelia Frontend

Modern React frontend for Cartelia - the all-in-one SaaS platform for restaurant marketing.

## 🚀 Tech Stack

- **Vite** - Fast build tool and dev server
- **React 19** with TypeScript
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Supabase JS Client** - Authentication
- **Chart.js** - Analytics visualization
- **Lucide React** - Icon library

## 📁 Project Structure

```
frontend/
├── src/
│   ├── lib/                    # Core utilities
│   │   ├── api.ts             # API client with auth
│   │   ├── auth.ts            # Auth helpers
│   │   ├── supabase.ts        # Supabase client
│   │   └── storage.ts         # File upload helpers
│   ├── providers/             # React context providers
│   │   └── AuthProvider.tsx  # Authentication state
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── modules/           # Feature components
│   │   │   └── CopilotPanel.tsx
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   └── Modal.tsx
│   │   └── Toast.tsx          # Toast notifications
│   ├── pages/
│   │   ├── auth/              # Login, Signup
│   │   ├── dashboard/         # Protected pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AvisPage.tsx
│   │   │   ├── MarketingPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── QRPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── HelpPage.tsx
│   │   └── public/            # Public pages (no auth)
│   │       ├── MenuPublicPage.tsx
│   │       ├── ReviewPublicPage.tsx
│   │       ├── RegisterPublicPage.tsx
│   │       └── WaitlistPage.tsx
│   ├── App.tsx                # Main router
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── .env.example               # Environment variables template
├── package.json
├── vite.config.ts
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Backend API running (see main README)
- Supabase account with auth configured

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=http://localhost:3000
```

**Where to find these values:**
- `VITE_SUPABASE_URL`: Supabase project settings → API → URL
- `VITE_SUPABASE_ANON_KEY`: Supabase project settings → API → anon public key
- `VITE_API_BASE_URL`: Your backend server URL (local: `http://localhost:3000`, production: your Railway/deployed URL)

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in `dist/`.

## 🌐 Deployment (Vercel, Netlify, or Cloudflare Pages)

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy from the frontend directory:
   ```bash
   cd frontend
   vercel
   ```

3. Follow the prompts:
   - **Project name**: `cartelia-frontend`
   - **Root directory**: `./` (already in frontend folder)
   - **Build command**: `npm run build`
   - **Output directory**: `dist`

4. Set environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_API_BASE_URL` (your production backend URL)
   - See [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md) for the exact production values currently used in Vercel.

5. Redeploy:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   cd frontend
   netlify deploy --prod
   ```

3. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. Set environment variables in Netlify dashboard:
   - Site settings → Environment variables
   - Add the same variables as above

### Option 3: Deploy to Cloudflare Pages

1. Push your code to GitHub/GitLab
2. Go to Cloudflare Pages dashboard
3. Create new project → Connect Git repository
4. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`
5. Add environment variables in project settings

## 🔑 Key Features

### Authentication
- Email/password login via Supabase Auth
- Session persistence with local storage
- Protected routes with automatic redirect
- Multi-restaurant support with restaurant switcher

### Dashboard Pages

**Dashboard**
- KPI cards (reviews, reactivated clients, revenue, ROI)
- Copilot suggestions
- Recent activity feed
- Fetches data from `GET /dashboard/stats?restaurantId=`

**Avis (Reviews)**
- Review list with filters (rating, status)
- Reply to reviews with AI suggestions
- Request reviews from clients
- Display stats with charts
- Endpoints: `GET /avis`, `POST /avis/reply`, `POST /avis/request`

**Marketing**
- Campaign list (name, channel, audience, sends, CTR)
- Create campaign wizard (audience, message, scheduling)
- Template library for quick campaigns
- Send campaigns via WhatsApp or email
- Endpoints: `GET /campaigns`, `POST /campaigns/create`, `POST /campaigns/send`

**Analytics**
- Reviews trend chart (Chart.js)
- ROI by channel
- Scans by location
- Date range filters
- Endpoint: `GET /dashboard/stats`

**QR & NFC**
- Create QR codes (menu, register, review)
- QR code list with stats (scans, conversions)
- Download/share QR images
- Endpoints: `GET /qr`, `POST /qr/create`

**Settings**
- WhatsApp pairing with QR scan
- WhatsApp status (connected/disconnected)
- Branding (restaurant name, logo, primary color)
- Endpoints: `GET /campaigns/integrations/whatsapp/status`, `GET /campaigns/integrations/whatsapp/qr`, `POST /restaurant/update`

**Onboarding**
- Timeline of onboarding steps fetched from backend
- Contextual action cards per step
- Feedback textarea sent to `POST /feedback`
- Accessible from dashboard quick actions

**Help**
- Documentation links
- Support contact (email, WhatsApp)
- Feedback form for beta users
- Endpoint: `POST /feedback`

### Copilot Chat
- Floating panel with chat interface
- Send commands to AI assistant
- Execute actions or get text responses
- Endpoint: `POST /copilot`

### Public Pages (No Authentication Required)

**Menu (`/menu/:id`)**
- Display restaurant menu with categories
- Track scans automatically
- Responsive design for mobile
- Endpoint: `GET /menu/:id`

**Review (`/review/:id`)**
- Landing page to collect reviews
- Links to Google and WhatsApp review forms
- Track scan
- Endpoint: `GET /review/:id`

**Register (`/register/:id`)**
- Client registration form
- GDPR consent checkbox (WhatsApp/email)
- Success confirmation
- Endpoints: `GET /register/:id`, `POST /public/register`

**Waitlist (`/waitlist`)**
- Marketing landing page
- Features, how-it-works, benefits
- Waitlist signup form
- Endpoint: `POST /waitlist`

## 🎨 Design System

The app follows a violet-themed dark UI design:

**Colors:**
- Primary: `#9317FD`
- Background: `#0F1115`
- Secondary BG: `#1a1d24`
- Text: `#ffffff`
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`

**Radius:**
- Default: `18px`
- Small: `12px`
- Large: `24px`

**Components:**
- Buttons with gradient hover effects
- Cards with subtle borders
- Badges for status indicators
- Modals with backdrop blur
- Toast notifications
- Skeleton loaders

## 🧪 Development Tips

### Adding a New Page

1. Create a new file in `src/pages/dashboard/` (or `src/pages/public/` for public pages)
2. Add the route in `src/App.tsx`:
   ```tsx
   <Route path="new-page" element={<NewPage />} />
   ```
3. Add navigation link in `src/components/layout/Sidebar.tsx` (for dashboard pages)

### Adding a New API Endpoint

Use the `api` client from `src/lib/api.ts`:

```tsx
import { api } from '../lib/api';

// GET request
const data = await api.get<ResponseType>('/endpoint?param=value');

// POST request
const result = await api.post<ResponseType>('/endpoint', {
  body: 'data',
});
```

All requests automatically include the Supabase JWT token in the `Authorization` header.

### Using React Query

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['key', id],
  queryFn: () => api.get(`/endpoint?id=${id}`),
  enabled: !!id, // only run if id exists
});

// Mutation (POST, PUT, DELETE)
const mutation = useMutation({
  mutationFn: (data) => api.post('/endpoint', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['key'] });
  },
});
```

### Toast Notifications

```tsx
import { useToast } from '../components/Toast';

function MyComponent() {
  const { success, error, info, warning } = useToast();

  const handleAction = async () => {
    try {
      await api.post('/endpoint', data);
      success('Action completed!');
    } catch (err) {
      error('Something went wrong');
    }
  };
}
```

## 📦 Build & Preview

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 🐛 Troubleshooting

**Problem: "Missing environment variables" error**
- Make sure `.env` file exists in `frontend/` directory
- Check that all required variables are set
- Restart dev server after changing `.env`

**Problem: CORS errors when calling API**
- Verify backend `CORS_ORIGINS` includes your frontend URL
- For local dev, backend should allow `http://localhost:5173`

**Problem: Authentication not working**
- Check Supabase URL and anon key are correct
- Verify backend Supabase keys match
- Clear browser local storage and try again

**Problem: Styles not loading**
- Clear browser cache
- Check that `index.css` is imported in `main.tsx`
- Run `npm run build` to see if there are CSS errors

## 📝 License

Part of the Cartelia project. See main repository README for license details.
