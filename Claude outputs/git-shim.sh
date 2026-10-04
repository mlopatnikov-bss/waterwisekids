#!/usr/bin/env bash
# =============================================================================
# WWK git shim  —  safe git for scheduled tasks on the Mac mini device bridge
# Lives at: WATERWISEKIDS.COM/.deploy/git-shim.sh   (gitignored, never deployed)
#
# WHY THIS EXISTS
#   The device-bridge shell can create and RENAME files in the mounted repo but
#   cannot DELETE (unlink) them unless the session was granted delete permission.
#   Git removes its own *.lock files with unlink(). So every git command that
#   exits through a rollback path (status refresh, auto-maintenance, a failed
#   commit, a run killed mid-write) leaves a stale lock behind, and the next
#   task's git call dies with "Unable to create '.../index.lock': File exists".
#   rename() IS allowed, so this shim MOVES stale locks into
#   .git/.lock-quarantine/ instead of deleting them. No permission prompt needed.
#
# USAGE (run from anywhere)
#   bash .deploy/git-shim.sh preflight         # FIRST thing in every run
#   bash .deploy/git-shim.sh git <args...>     # use instead of plain `git`
#   bash .deploy/git-shim.sh status            # read-only health report
#   bash .deploy/git-shim.sh unlock [--force]  # clear locks now
#                                              #   --force ignores lock age; only
#                                              #   use when no other run is active
#   bash .deploy/git-shim.sh purge [days]      # cleanup task only: delete parked
#                                              #   locks + .deploy/.trash >N days (needs delete perm)
# EXIT CODES
#   0   ok
#   75  a FRESH lock is held by another run that is still working -> wait a
#       minute and re-run the same command (do not use --force)
#   77  this git command rewrites working-tree files (pull/rebase/reset/...)
#       and the session has no delete permission -> request it, re-run
#       (`git rm` never needs it: the shim untracks + parks files instead)
#   other = git's own exit code / real failure
#
# TUNABLES (env)
#   WWK_LOCK_STALE_SECS  lock older than this is stale          (default 180)
#   WWK_LOCK_WAIT_SECS   max wait for a fresh lock to clear     (default 60)
#   WWK_WT_STALE_SECS    orphaned worktree metadata age cutoff  (default 10800)
# =============================================================================
set -u

STALE_SECS="${WWK_LOCK_STALE_SECS:-180}"
WAIT_SECS="${WWK_LOCK_WAIT_SECS:-60}"
WT_STALE_SECS="${WWK_WT_STALE_SECS:-10800}"

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GITDIR="$REPO/.git"
QDIR="$GITDIR/.lock-quarantine"
QLOG="$QDIR/quarantine.log"

if [ ! -d "$GITDIR" ]; then
  echo "git-shim: no .git directory at $REPO" >&2
  exit 1
fi
cd "$REPO" || exit 1

# Every git call made through the shim gets these. They stop git from taking
# locks it does not need and from spawning work whose cleanup needs unlink().
export GIT_OPTIONAL_LOCKS=0          # status/diff never grab index.lock
export GIT_TERMINAL_PROMPT=0         # never hang waiting for credentials
SAFE_C=(
  -c maintenance.auto=false          # no background maintenance.lock
  -c gc.auto=0                       # no auto-gc (gc needs deletes)
  -c core.createObject=rename        # no link()+unlink() temp objects
  -c fetch.writeCommitGraph=false
)

now() { date +%s; }
ts()  { date -u +%Y-%m-%dT%H:%M:%SZ; }

age_of() {  # seconds since mtime; negative clock skew counts as fresh (0)
  local m; m=$(stat -c %Y "$1" 2>/dev/null) || { echo -1; return; }
  local a=$(( $(now) - m )); [ "$a" -lt 0 ] && a=0; echo "$a"
}

list_locks() {
  find "$GITDIR" -path "$QDIR" -prune -o -type f -name '*.lock' -print 2>/dev/null
}

quarantine() {  # $1 = path, $2 = reason
  local f="$1" why="$2" rel dest
  [ -e "$f" ] || return 0
  mkdir -p "$QDIR"
  rel="${f#"$GITDIR"/}"
  dest="$QDIR/$(date -u +%Y%m%dT%H%M%SZ)_$$__${rel//\//__}"
  if mv -f "$f" "$dest" 2>/dev/null; then
    echo "$(ts) moved .git/$rel ($why)" >> "$QLOG"
    echo "  cleared .git/$rel ($why)"
    return 0
  fi
  echo "  FAILED to move .git/$rel" >&2
  return 1
}

apply_safe_config() {  # persist the safe settings so plain `git` also behaves
  local k v
  for kv in maintenance.auto=false gc.auto=0 core.createObject=rename fetch.writeCommitGraph=false; do
    k="${kv%%=*}"; v="${kv#*=}"
    [ "$(git config --local --get "$k" 2>/dev/null)" = "$v" ] && continue
    git config --local "$k" "$v" 2>/dev/null && echo "  set $k=$v"
  done
}

reap_orphan_worktrees() {
  # A worktree whose directory is gone and whose metadata has not been touched
  # for WT_STALE_SECS is an orphan left by `rm -rf /tmp/wwk-*`. (Each session
  # has its own /tmp, so "directory missing" alone is NOT enough — another run
  # may be using it right now in its own sandbox. Hence the age cutoff.)
  [ -d "$GITDIR/worktrees" ] || return 0
  local d name target newest a
  for d in "$GITDIR"/worktrees/*/; do
    [ -d "$d" ] || continue
    name="$(basename "$d")"
    target="$(cat "$d/gitdir" 2>/dev/null)"; target="${target%/.git}"
    [ -n "$target" ] && [ -d "$target" ] && continue
    newest=$(find "$d" -type f -printf '%T@\n' 2>/dev/null | sort -n | tail -1)
    newest=${newest%.*}; [ -z "$newest" ] && newest=0
    a=$(( $(now) - newest ))
    if [ "$a" -ge "$WT_STALE_SECS" ]; then
      quarantine "${d%/}" "orphaned worktree '$name' -> ${target:-?}, idle ${a}s"
    else
      echo "  note: worktree '$name' -> ${target:-?} not visible here but active ${a}s ago; left alone"
    fi
  done
}

# Clear stale locks; wait (bounded) for fresh ones. Returns 0 or 75.
clear_locks() {
  local force="${1:-}" deadline f a fresh
  deadline=$(( $(now) + WAIT_SECS ))
  while :; do
    fresh=()
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      a=$(age_of "$f"); [ "$a" -lt 0 ] && continue
      if [ "$force" = "--force" ] || [ "$a" -ge "$STALE_SECS" ]; then
        quarantine "$f" "stale ${a}s"
      else
        fresh+=("${f#"$GITDIR"/} (${a}s old)")
      fi
    done < <(list_locks)
    [ "${#fresh[@]}" -eq 0 ] && return 0
    if [ "$(now)" -ge "$deadline" ]; then
      echo "  BUSY: fresh lock(s) held by another run: ${fresh[*]}" >&2
      echo "  -> wait a minute and re-run. Do NOT use --force while another task is active." >&2
      return 75
    fi
    sleep 5
  done
}

report() {
  local br ab dirty
  br=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  ab=$(git rev-list --left-right --count "HEAD...origin/$br" 2>/dev/null | awk '{print $1" ahead / "$2" behind"}')
  dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  echo "  branch=$br  vs origin/$br: ${ab:-unknown (no upstream fetched)}  dirty=$dirty"
  for s in rebase-merge rebase-apply MERGE_HEAD CHERRY_PICK_HEAD; do
    [ -e "$GITDIR/$s" ] && echo "  WARNING: .git/$s present (an interrupted rebase/merge). Resolve before committing."
  done
  return 0
}

cmd_preflight() {
  echo "git-shim preflight @ $(ts)  repo=$REPO"
  clear_locks "" ; local rc=$?
  [ $rc -ne 0 ] && return $rc
  reap_orphan_worktrees
  apply_safe_config
  report
  if has_delete_perm; then echo "  delete permission: YES"
  else echo "  delete permission: NO — commits/push/rm work; pull/rebase/reset will exit 77 (request permission then)"; fi
  echo "git-shim: OK"
}

cmd_unlock() {
  echo "git-shim unlock ${1:-} @ $(ts)"
  clear_locks "${1:-}"; local rc=$?
  [ $rc -eq 0 ] && reap_orphan_worktrees && echo "git-shim: locks clear"
  return $rc
}

cmd_status() {
  echo "git-shim status @ $(ts)  repo=$REPO"
  local n=0 f
  while IFS= read -r f; do
    [ -n "$f" ] || continue; n=$((n+1))
    echo "  lock: .git/${f#"$GITDIR"/}  age=$(age_of "$f")s"
  done < <(list_locks)
  [ $n -eq 0 ] && echo "  locks: none"
  if [ -d "$GITDIR/worktrees" ]; then
    echo "  registered worktrees:"; git worktree list 2>/dev/null | sed 's/^/    /'
  fi
  mkdir -p "$QDIR"; local p="$QDIR/.delete-probe"
  : > "$p" 2>/dev/null
  if rm -f "$p" 2>/dev/null; then echo "  delete permission: YES (gc/prune allowed)"
  else echo "  delete permission: NO (normal for scheduled runs; the shim works without it)"; fi
  echo "  quarantined so far: $(find "$QDIR" -mindepth 1 -maxdepth 1 ! -name quarantine.log ! -name .delete-probe | wc -l | tr -d ' ')"
  report
}

has_delete_perm() {  # probe: can this session unlink inside the repo?
  mkdir -p "$QDIR" 2>/dev/null
  local p="$QDIR/.delete-probe"
  : > "$p" 2>/dev/null || return 1
  rm -f "$p" 2>/dev/null
}

need_perm_msg() {
  cat >&2 <<EOF
git-shim: EXIT 77 — 'git $1' rewrites or removes working-tree files, which needs
delete permission in this session (git replaces a file by deleting it first).
  -> Call device_request_delete_permission with
     paths=["/Users/bss/Documents/Claude/Projects/WATERWISEKIDS.COM"]
     reason="git needs to update/remove site files during pull/rebase"
     (scheduled tasks in auto mode get this approved automatically)
  -> Then re-run the exact same shim command.
Nothing was changed.
EOF
}

# Remove tracked files from the site WITHOUT delete permission:
# untrack them in git (index rewrite = rename, allowed) and park the working
# copies in .deploy/.trash/<date>/ (gitignored, never deployed).
git_rm_without_delete() {
  local args=("$@") paths=() flags=() seen_dd=0 a list rc f dest day
  for a in "${args[@]}"; do
    if [ $seen_dd -eq 1 ]; then paths+=("$a"); continue; fi
    case "$a" in
      --) seen_dd=1;;
      -n|--dry-run) git "${SAFE_C[@]}" rm "${args[@]}"; return $?;;
      -*) flags+=("$a");;
      *) paths+=("$a");;
    esac
  done
  [ ${#paths[@]} -gt 0 ] || { git "${SAFE_C[@]}" rm "${args[@]}"; return $?; }
  list="$(git ls-files -- "${paths[@]}")"
  git "${SAFE_C[@]}" rm --cached "${flags[@]}" -- "${paths[@]}"; rc=$?
  [ $rc -eq 0 ] || return $rc
  day=$(date -u +%Y-%m-%d)
  while IFS= read -r f; do
    [ -n "$f" ] && [ -e "$REPO/$f" ] || continue
    git ls-files --error-unmatch -- "$f" >/dev/null 2>&1 && continue   # still tracked
    dest="$REPO/.deploy/.trash/$day/$f"
    mkdir -p "$(dirname "$dest")" && mv -f "$REPO/$f" "$dest" \
      && echo "$(ts) git rm $f -> .deploy/.trash/$day/" >> "$REPO/.deploy/.trash/trash.log"
  done <<< "$list"
  echo "git-shim: untracked + parked working copies in .deploy/.trash/$day/ (no delete permission needed)"
  return 0
}

cmd_git() {
  clear_locks "" || return $?
  # Commands that rewrite/remove working-tree files need unlink().
  case "${1:-}" in
    rm)
      if ! has_delete_perm && [[ " $* " != *" --cached "* ]]; then
        shift; git_rm_without_delete "$@"; return $?
      fi;;
    pull|merge|rebase|checkout|switch|reset|restore|stash|cherry-pick|revert|am|clean)
      if ! has_delete_perm; then need_perm_msg "$1"; return 77; fi;;
  esac
  local attempt out rc start f lk a
  for attempt in 1 2 3 4; do
    start=$(now)
    out="$(git "${SAFE_C[@]}" "$@" 2>&1)"; rc=$?
    [ -n "$out" ] && printf '%s\n' "$out"
    # Locks THIS command created but could not unlink: they are ours -> move now.
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      case "$f" in /*) ;; *) f="$REPO/$f";; esac
      quarantine "$f" "left by this git call (unlink blocked)"
    done < <(printf '%s\n' "$out" | grep -oE "unable to unlink '[^']+\.lock'" | sed -E "s/^unable to unlink '//; s/'$//")
    [ $rc -eq 0 ] && return 0
    # Blocked by someone else's lock?
    lk=$(printf '%s\n' "$out" | grep -oE "Unable to create '[^']+\.lock'" | head -1 | sed -E "s/^Unable to create '//; s/'$//")
    [ -z "$lk" ] && return $rc
    case "$lk" in /*) ;; *) lk="$REPO/$lk";; esac
    if [ -e "$lk" ]; then
      a=$(age_of "$lk")
      if [ "$a" -ge "$STALE_SECS" ]; then
        quarantine "$lk" "stale ${a}s, blocked git"
      else
        echo "  git-shim: waiting on fresh lock ${lk#"$REPO"/} (${a}s old), retry $attempt/3" >&2
        sleep 15
      fi
    fi
  done
  echo "git-shim: gave up after retries; lock still held by an active run -> re-run later" >&2
  return 75
}

cmd_purge() {  # only works in a session that HAS delete permission
  local days="${1:-7}" n=0 f
  [ -d "$QDIR" ] || { echo "git-shim purge: nothing quarantined"; return 0; }
  while IFS= read -r f; do
    rm -rf "$f" 2>/dev/null && n=$((n+1))
  done < <(find "$QDIR" -mindepth 1 -maxdepth 1 ! -name quarantine.log ! -name .delete-probe -mtime +"$days")
  if [ -d "$REPO/.deploy/.trash" ]; then
    while IFS= read -r f; do
      rm -rf "$f" 2>/dev/null && n=$((n+1))
    done < <(find "$REPO/.deploy/.trash" -mindepth 1 -maxdepth 1 ! -name trash.log -mtime +"$days")
  fi
  echo "git-shim purge: removed $n parked item(s) older than ${days}d"
  return 0
}

case "${1:-}" in
  preflight) shift; cmd_preflight "$@";;
  purge)     shift; cmd_purge "$@";;
  unlock)    shift; cmd_unlock "$@";;
  status)    shift; cmd_status "$@";;
  git)       shift; cmd_git "$@";;
  *) sed -n '2,41p' "${BASH_SOURCE[0]}"; exit 2;;
esac
