// Minimal, strict unified-diff tools (no dependencies, no fuzz).
// createEditDiff: strict line insertions/deletions/replacements -> git-style unified diff + proposed text.
// applyUnifiedDiff: applies a unified diff to text IN MEMORY, failing on any mismatch.

function splitLines(text) {
  const endsWithNewline = text.endsWith('\n');
  const lines = text.split('\n');
  if (endsWithNewline) lines.pop();
  return { lines, endsWithNewline };
}

/**
 * General strict edit diff.
 * @param path repo-relative path (used for a/ b/ headers)
 * @param text original file text
 * @param changes [{ start: <0-based old line index>, deleteCount: <old lines removed>, lines: string[] }]
 *   Pure insertion: deleteCount 0. Deletion: lines []. Replacement: both. Changes must not overlap or share a start.
 */
export function createEditDiff(path, text, changes, { context = 3 } = {}) {
  const { lines, endsWithNewline } = splitLines(text);
  const sorted = [...changes].sort((a, b) => a.start - b.start);
  let prevEnd = -1; let prevStart = -1;
  for (const c of sorted) {
    if (!Number.isInteger(c.start) || !Number.isInteger(c.deleteCount) || c.start < 0 || c.deleteCount < 0 || c.start + c.deleteCount > lines.length) throw new Error(`bad change ${c.start}+${c.deleteCount}`);
    if (c.start === prevStart || c.start < prevEnd) throw new Error(`overlapping changes at line ${c.start + 1}`);
    if (c.deleteCount === 0 && c.lines.length === 0) throw new Error('empty change');
    if (!endsWithNewline && c.start + c.deleteCount >= lines.length) throw new Error('cannot change or append after a final line without newline');
    for (const l of c.lines) if (l.includes('\n') || l.includes('\r')) throw new Error('changed lines must not contain newlines');
    prevStart = c.start; prevEnd = c.start + c.deleteCount;
  }
  // Proposed text.
  const out = [];
  let k = 0;
  for (let i = 0; i <= lines.length;) {
    if (k < sorted.length && sorted[k].start === i) { out.push(...sorted[k].lines); i += sorted[k].deleteCount; k += 1; if (sorted[k - 1].deleteCount) continue; }
    if (i < lines.length) out.push(lines[i]);
    i += 1;
  }
  const proposed = out.join('\n') + (endsWithNewline ? '\n' : '');

  // Hunks: group changes whose context windows overlap or touch.
  const groups = [];
  for (const c of sorted) {
    const start = Math.max(0, c.start - context);
    const end = Math.min(lines.length, c.start + c.deleteCount + context); // exclusive
    const g = groups[groups.length - 1];
    if (g && start <= g.end) { g.end = Math.max(g.end, end); g.ch.push(c); } else groups.push({ start, end, ch: [c] });
  }
  const body = [];
  let delta = 0;
  const marker = (i, hunk) => { if (i === lines.length - 1 && !endsWithNewline) hunk.push('\\ No newline at end of file'); };
  for (const g of groups) {
    const hunk = [];
    let oldLen = 0; let newLen = 0;
    let i = g.start;
    while (i <= g.end) {
      const c = g.ch.find((x) => x.start === i);
      if (c && !c.done) {
        for (let j = 0; j < c.deleteCount; j += 1) { hunk.push(`-${lines[i + j]}`); marker(i + j, hunk); oldLen += 1; }
        for (const l of c.lines) { hunk.push(`+${l}`); newLen += 1; }
        c.done = true; i += c.deleteCount;
        continue;
      }
      if (i === g.end) break;
      hunk.push(` ${lines[i]}`); marker(i, hunk); oldLen += 1; newLen += 1; i += 1;
    }
    for (const c of g.ch) delete c.done;
    const oldStart = oldLen === 0 ? g.start : g.start + 1;
    const newStart = newLen === 0 ? g.start + delta : g.start + 1 + delta;
    body.push(`@@ -${oldStart},${oldLen} +${newStart},${newLen} @@`, ...hunk);
    delta += newLen - oldLen;
  }
  const diff = [`diff --git a/${path} b/${path}`, `--- a/${path}`, `+++ b/${path}`, ...body].join('\n') + '\n';
  return { diff, proposed };
}

/** Pure insertions (kept for the assets/compat API): [{ before, lines }]. */
export function createInsertionDiff(path, text, insertions, opts) {
  return createEditDiff(path, text, insertions.map((x) => ({ start: x.before, deleteCount: 0, lines: x.lines })), opts);
}

/** Reverse ONE parsed file patch (swap old/new), for strict reverse-apply checks. */
export function reverseFilePatch(filePatch) {
  return { ...filePatch, oldPath: filePatch.newPath, newPath: filePatch.oldPath,
    hunks: filePatch.hunks.map((h) => ({ oldStart: h.newStart, oldLen: h.newLen, newStart: h.oldStart, newLen: h.oldLen,
      lines: h.lines.map((l) => ({ ...l, tag: l.tag === '+' ? '-' : l.tag === '-' ? '+' : ' ' })) })) };
}

export function createNewFileDiff(path, text) {
  if (!text.endsWith('\n')) throw new Error('new files must end with a newline');
  const lines = text.slice(0, -1).split('\n');
  return [`diff --git a/${path} b/${path}`, 'new file mode 100644', '--- /dev/null', `+++ b/${path}`, `@@ -0,0 +1,${lines.length} @@`, ...lines.map((l) => `+${l}`)].join('\n') + '\n';
}

/** Parse a (possibly multi-file) unified diff. */
export function parseUnifiedDiff(diffText) {
  const rows = diffText.split('\n');
  if (rows[rows.length - 1] === '') rows.pop();
  const files = [];
  let f = null; let h = null;
  for (const row of rows) {
    if (row.startsWith('diff --git ')) { f = { oldPath: null, newPath: null, hunks: [], isNew: false }; files.push(f); h = null; continue; }
    if (!f) throw new Error(`diff text before file header: ${row.slice(0, 40)}`);
    if (row === 'new file mode 100644') { f.isNew = true; continue; }
    if (row.startsWith('--- ')) { f.oldPath = row.slice(4); continue; }
    if (row.startsWith('+++ ')) { f.newPath = row.slice(4); continue; }
    const m = row.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@$/);
    if (m) { h = { oldStart: +m[1], oldLen: m[2] === undefined ? 1 : +m[2], newStart: +m[3], newLen: m[4] === undefined ? 1 : +m[4], lines: [] }; f.hunks.push(h); continue; }
    if (!h) throw new Error(`unexpected line outside hunk: ${row.slice(0, 40)}`);
    if (row === '\\ No newline at end of file') { h.lines[h.lines.length - 1].noNewline = true; continue; }
    const tag = row[0];
    if (tag !== ' ' && tag !== '+' && tag !== '-') throw new Error(`bad hunk line: ${row.slice(0, 40)}`);
    h.lines.push({ tag, text: row.slice(1) });
  }
  return files;
}

/** Strictly apply ONE file's hunks to text. Throws on any mismatch. Returns new text. */
export function applyFilePatch(text, filePatch) {
  const src = text === null ? { lines: [], endsWithNewline: true } : splitLines(text);
  const out = [];
  let cursor = 0;
  let endsWithNewline = src.endsWithNewline;
  for (const h of filePatch.hunks) {
    const oldCount = h.lines.filter((l) => l.tag !== '+').length;
    const newCount = h.lines.filter((l) => l.tag !== '-').length;
    if (oldCount !== h.oldLen || newCount !== h.newLen) throw new Error(`hunk length mismatch at -${h.oldStart}`);
    const startIdx = h.oldLen === 0 ? h.oldStart : h.oldStart - 1;
    if (startIdx < cursor) throw new Error('overlapping hunks');
    while (cursor < startIdx) out.push(src.lines[cursor++]);
    for (const l of h.lines) {
      if (l.tag === '+') { out.push(l.text); if (l.noNewline) endsWithNewline = false; continue; }
      if (cursor >= src.lines.length || src.lines[cursor] !== l.text) throw new Error(`context mismatch at line ${cursor + 1}`);
      if (l.noNewline && (cursor !== src.lines.length - 1 || src.endsWithNewline)) throw new Error('no-newline marker mismatch');
      if (l.tag === ' ') out.push(l.text);
      cursor += 1;
    }
  }
  while (cursor < src.lines.length) out.push(src.lines[cursor++]);
  return out.join('\n') + (endsWithNewline && out.length ? '\n' : '');
}
