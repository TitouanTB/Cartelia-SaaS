# Vercel Deployment Configuration

## Environment Variables (REQUIRED)

**IMPORTANT**: These must be set in Vercel Dashboard → Settings → Environment Variables

Set these for **Production** environment:

```
VITE_SUPABASE_URL=https://dcstytsxdyxayujmfxmn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjc3R5dHN4ZHl4YXl1am1meG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzYzOTIsImV4cCI6MjA3NzI1MjM5Mn0.NutsskGKLrD55p-1RF8p1Yvihyjl8CQVWHm-Ac4w7KM
VITE_API_BASE_URL=https://cartelia-saas-production.up.railway.app
```

**Note**: If backend is not deployed yet, use `http://localhost:3000` as a temporary value for VITE_API_BASE_URL, but this will only work for local testing.

## Vercel Project Settings

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm ci --legacy-peer-deps && npm run build`
- **Install Command**: `npm ci --legacy-peer-deps`
- **Output Directory**: `dist`
- **Node.js Version**: 22.x

## Deployment Steps

1. **Fix vercel.json schema** (✅ Done in this commit)
   - Removed invalid `"public": "public"` field that caused schema validation error
   - Vercel.json now has only valid fields for Vite projects

2. **Set Environment Variables in Vercel Dashboard**
   - Go to: https://vercel.com/[your-team]/cartelia-saas/settings/environment-variables
   - Add each variable listed above
   - Set scope to: **Production** (and optionally Preview + Development)
   - Click "Save"

3. **Trigger Redeploy**
   - Push this commit to main branch
   - Vercel will auto-trigger a new deployment
   - Or manually: Deployments tab → Click "Redeploy" on latest deployment

4. **Validate Deployment**
   - Wait for build to complete (~60 seconds)
   - Check deployment status: should show "✓ Production" with green checkmark
   - Visit: https://cartelia-saas.vercel.app
   - Test login/signup flows
   - Check browser console (F12) for any errors

## Troubleshooting

### Build fails with "Missing environment variables"
- Go to Vercel Dashboard → Settings → Environment Variables
- Ensure all 3 variables are present with correct spelling (case-sensitive)
- Ensure they're assigned to "Production" environment
- Redeploy

### Build fails with "Schema validation"
- This should be fixed by this commit (removed invalid `public` field)
- If still failing, check vercel.json for any syntax errors

### Page loads but authentication doesn't work
- Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- Open browser console (F12) to see detailed error messages
- Verify Supabase project is active and auth is enabled

### API calls fail with CORS errors
- Check that backend is deployed and accessible
- Verify VITE_API_BASE_URL is correct (should be production Railway URL)
- Check backend CORS settings allow frontend domain

## Post-Deployment Checklist

- [ ] Vercel build status: ✓ Production (green checkmark)
- [ ] Login page loads without errors
- [ ] Signup flow works (confirmation email sent)
- [ ] Email confirmation link redirects to dashboard
- [ ] Login flow works (instant redirect to dashboard)
- [ ] Password visibility toggle works
- [ ] Session persists on page refresh (F5)
- [ ] Mobile responsive (test on iPhone/Android)
- [ ] No console errors (F12 → Console)

## Support

If deployment issues persist:
1. Check Vercel deployment logs for specific error messages
2. Verify all environment variables are correctly set
3. Test locally with same environment variables to isolate issue
4. Check Supabase dashboard for auth configuration issues
