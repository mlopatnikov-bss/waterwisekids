#!/bin/bash
cd /Users/bss/Documents/Claude/Projects/WATERWISEKIDS.COM
git status
git fetch origin
git reset --hard origin/live
git status
echo "=== REPO FIXED ==="
echo "Press any key to close..."
read -n 1
