# WWK AI visibility panel

This fixed panel measures whether WaterWiseKids is cited, mentioned without a
link, or has a proprietary number repeated in answer-engine results. It is a
directional weekly panel, not a statistically representative market study.

Run `python3 tools/wwk-ai-visibility/build_panel.py` only when intentionally
creating a new version. Do not edit prompts mid-series. Copy
`weekly-results-template.csv` for each week and fill one row per platform and
prompt. Preserve evidence where platform terms allow it; record the path, not
answer text, in the CSV.

The six platform labels are measurement targets, not automated integrations.
Do not scrape logged-in consumer products or bypass rate limits. A human may
run the panel, or an approved vendor/API may be added later with its own
versioned methodology.

In GA4, monitor referrals from `chatgpt.com`, `perplexity.ai`,
`gemini.google.com`, `copilot.microsoft.com`, and `claude.ai` as supporting
traffic evidence. Referral counts do not prove a citation. In Cloudflare logs,
track allowed search/retrieval bots separately from training bots and document
any policy change date so bot-volume shifts are interpretable.
