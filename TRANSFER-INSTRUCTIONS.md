# WaterWiseKids.com — Transfer to Mac Mini

## What's in this package

The `.auto-memory/` folder contains 12 memory files that give Claude full context about:
- Who you are and what this project is (Michael, British Swim School ops)
- The GitHub repo, branches, and deployment setup
- How to deploy (GitHub API via Chrome — the ONLY method that works)
- Brand voice, editorial guidelines, SEO strategy
- Content strategy and daily publishing workflow
- The autonomous workflow playbook for daily scheduled tasks
- Current deploy status and site architecture

## Setup Steps on Mac Mini

### 1. Clone the repo (if not already done)
Open Terminal on the Mac Mini and run:
```
cd ~/Documents
git clone https://github.com/mlopatnikov-bss/waterwisekids.git waterwisekids.com
cd waterwisekids.com
git checkout live
```

### 2. Open waterwisekids.com folder in Claude Cowork
In Claude Cowork on the Mac Mini:
- Select the `waterwisekids.com` folder as your workspace
- This gives Claude read/write access to the site files

### 3. Copy memory files
Copy the entire `.auto-memory/` folder from this transfer package into the Cowork project's memory location. In Claude Cowork, memory files live at:
```
[your cowork project path]/.auto-memory/
```
Copy all 12 files (including MEMORY.md) there. If Cowork already has a `.auto-memory/` folder from other work, merge the files in — don't overwrite MEMORY.md, append the entries instead.

### 4. Verify Chrome access to GitHub
Claude needs Chrome browser access to deploy. Make sure:
- Chrome is open and logged into GitHub as `mlopatnikov-bss`
- The Claude in Chrome extension is installed and connected
- Test by asking Claude: "Check if you can access the waterwisekids repo on GitHub"

### 5. Set up scheduled tasks
Once Claude has the memory files and repo access, ask it to:
- "Set up a daily scheduled task to publish new content to waterwisekids.com"
- "Set up a weekly SEO audit for waterwisekids.com"

The autonomous workflow playbook (already in memory) has the full process.

## Quick verification
After setup, ask Claude on the Mac Mini:
- "What do you know about the waterwisekids.com project?"
- "How do you deploy changes to the site?"
- "What's our content strategy?"

If Claude can answer all three from memory, the transfer is complete.

## Important notes
- **NEVER use git CLI from sandbox** to push to GitHub — it's blocked by proxy. Always use Chrome.
- **Deploy branch is `live`** (not `main`)
- **Auto-deploy bot** may be running on the Mac Mini — check for "WaterWiseKids AutoDeploy.app"
- **Cloudflare DNS** is managed under Mlopatnikov@gmail.com — purge cache if content doesn't update
