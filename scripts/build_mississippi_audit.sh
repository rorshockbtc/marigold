#!/usr/bin/env bash
# Rebuild the public Mississippi audit end to end. Raw extracts are read from
# $MS_DATA_DIR (never committed). Fails if accuracy or privacy checks fail.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/run_mississippi_playbooks.py
python3 scripts/enrich_mississippi_correlations.py
python3 scripts/sanitize_public_audit.py
npx tsx scripts/generate_mississippi_pdf.ts
npm run build
python3 scripts/verify_mississippi_audit.py /tmp/ms_report.html
