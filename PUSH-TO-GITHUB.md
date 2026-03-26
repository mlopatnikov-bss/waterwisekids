# Push WaterWiseKids to GitHub — Run These Commands

All files are already built and ready in this folder on your computer.
Open your terminal, navigate to this folder, and run these commands in order:

```bash
# Step 1 — Navigate to this folder (adjust path to match where you saved it)
cd /path/to/waterwisekids.com

# Step 2 — Initialize git
git init
git branch -m main

# Step 3 — Set your identity
git config user.email "mlopatnikov@gmail.com"
git config user.name "Michael Lopatnikov"

# Step 4 — Stage all files
git add -A

# Step 5 — Initial commit
git commit -m "Initial launch: Full WaterWiseKids national aquatics hub - 44 pages"

# Step 6 — Connect to your GitHub repo
git remote add origin https://github.com/mlopatnikov-bss/waterwisekids.git

# Step 7 — Push!
git push -u origin main
```

## After Pushing — Enable GitHub Pages

1. Go to https://github.com/mlopatnikov-bss/waterwisekids
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment" → Source: **Deploy from a branch**
4. Branch: **main** | Folder: **/ (root)**
5. Click **Save**

Your site will be live at: `https://mlopatnikov-bss.github.io/waterwisekids/`

## Add Your Custom Domain (waterwisekids.com)

In GitHub Pages settings → Custom domain → enter: `www.waterwisekids.com`

Then at your domain registrar (GoDaddy, Namecheap, etc.), add these DNS records:
```
Type: A     Name: @    Value: 185.199.108.153
Type: A     Name: @    Value: 185.199.109.153
Type: A     Name: @    Value: 185.199.110.153
Type: A     Name: @    Value: 185.199.111.153
Type: CNAME Name: www  Value: mlopatnikov-bss.github.io
```

DNS propagation takes 10 minutes to 48 hours.

## Future Updates (Every Time You Make Changes)

```bash
git add -A
git commit -m "Update: description of what changed"
git push origin main
```

GitHub Pages auto-deploys in ~60 seconds after each push.
