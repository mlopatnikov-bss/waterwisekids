# SUPERSEDED 2026-09-01 -- DO NOT RUN.
# One-off helper used to triage the false positives described in
# _contrast_probe.py. Its crop clip was computed in viewport coordinates while
# Playwright's screenshot clip is in page coordinates, so after scrollIntoView
# the saved crops are of the WRONG REGION. The computed-style output it printed
# was sound; the images were not. Use composited-contrast-probe.py instead.
raise SystemExit("superseded: use composited-contrast-probe.py")
