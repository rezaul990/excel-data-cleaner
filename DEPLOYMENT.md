# Deployment Guide - Netlify via GitHub

## Step 1: Prepare Your Project

✅ Already done! Your project is ready with:
- `netlify.toml` - Netlify configuration
- `.gitignore` - Git ignore rules
- `README.md` - Project documentation
- Git initialized

## Step 2: Push to GitHub

1. Create a new repository on GitHub (https://github.com/new)
   - Name: `excel-data-cleaner` (or your preferred name)
   - Keep it public or private
   - Don't initialize with README (we already have one)

2. Add your GitHub repository as remote:
```bash
git remote add origin https://github.com/YOUR_USERNAME/excel-data-cleaner.git
```

3. Add all files:
```bash
git add .
```

4. Commit:
```bash
git commit -m "Initial commit - Excel Data Cleaner"
```

5. Push to GitHub:
```bash
git push -u origin main
```

## Step 3: Deploy to Netlify

### Option A: Netlify Dashboard (Recommended)

1. Go to [Netlify](https://app.netlify.com/)
2. Sign up/Login (you can use GitHub account)
3. Click "Add new site" → "Import an existing project"
4. Choose "GitHub" as your Git provider
5. Authorize Netlify to access your GitHub
6. Select your `excel-data-cleaner` repository
7. Netlify will auto-detect settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
8. Click "Deploy site"

### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## Step 4: Configure (Optional)

After deployment, you can:
- Change site name: Site settings → Change site name
- Add custom domain: Domain settings → Add custom domain
- Enable HTTPS: Automatically enabled by Netlify

## Build Settings (Auto-detected from netlify.toml)

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

## Continuous Deployment

Once connected, every push to your `main` branch will automatically:
1. Trigger a new build on Netlify
2. Deploy the updated site
3. Your site will be live in ~2 minutes

## Your Site URL

After deployment, your site will be available at:
```
https://YOUR-SITE-NAME.netlify.app
```

## Troubleshooting

### Build fails?
- Check Node version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs in Netlify dashboard

### Site not loading?
- Check redirects in `netlify.toml`
- Verify publish directory is `dist`

### Need help?
Contact the developer:
- WhatsApp: +880 1712-394851
- Facebook: https://www.facebook.com/rezaul2000

## Next Steps

1. Test your deployed site
2. Share the URL with users
3. Monitor usage in Netlify analytics
4. Update code and push to auto-deploy

Happy deploying! 🚀
