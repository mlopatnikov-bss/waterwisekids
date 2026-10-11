# Static mobile source transform

Run with Node 22 and jsdom 30.1.2 installed.

`node --expose-gc --max-old-space-size=512 tools/wwk-mobile-static/render.cjs /absolute/repository /absolute/isolated-preview`

The committed `assets/css/wwk-v4.css` and `assets/js/wwk-v4.js` are the canonical component sources. Unmarked pages with the standard header are rendered with full static navigation and task blocks. Already marked pages remain unchanged. Output is isolated; existing repository files are never edited. Non-HTML source assets are linked read-only; do not write through those links. Copy only reviewed changed HTML and the three mobile assets during a release.

Preserve canonical directory source data, contacts, SEO metadata, all page text, near-me assets and the installed publication guards. Rebuild the guide data from current site sources before release. This tool does not alter existing scheduled tasks, provide publication approval or bypass release checks. Existing content owners must run the transform for newly generated pages before claiming full mobile consistency.

Resource limits: run one build or browser validation at a time. The renderer closes each DOM, yields and collects garbage between pages. A capped build must finish successfully before its manifest is accepted.
