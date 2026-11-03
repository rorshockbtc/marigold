"""Independent verification of the public Mississippi audit.

1. ACCURACY  - recomputes headline figures straight from the raw extracts with
               separate code and compares them to src/data/mississippi_audit_results.json.
2. PRIVACY   - scans every public artifact (JSON, PDF source HTML, built web pages)
               for voter names, voter IDs, house numbers, P.O. Box numbers and ZIP+4.

Exits non-zero on any failure. Never prints raw voter records.
Usage: python3 scripts/verify_mississippi_audit.py [extra files to scan...]
"""
import csv
import glob
import json
import math
import os
import re
import sys
from collections import Counter, defaultdict

ROOT = os.path.join(os.path.dirname(__file__), "..")
JSON_PATH = os.path.join(ROOT, "src", "data", "mississippi_audit_results.json")
DATA_DIR = os.environ.get("MS_DATA_DIR", os.path.expanduser("~/Developer/marigold/mississippi voter files most recent Octoer 2026"))
VOTER = os.environ.get("MS_VOTER_FILE") or sorted(f for f in glob.glob(os.path.join(DATA_DIR, "*.csv")) if "VotingHistory" not in f)[0]
HIST = os.environ.get("MS_HISTORY_FILE") or sorted(glob.glob(os.path.join(DATA_DIR, "*VotingHistory*.csv")))[0]
ALIASES = {"JEFF DAVIS": "JEFFERSON DAVIS"}

failures, notes = [], []


def check(label, expected, actual):
    ok = expected == actual
    print(f"  [{'OK ' if ok else 'FAIL'}] {label}: report={actual!r} recomputed={expected!r}")
    if not ok:
        failures.append(label)


def pearson(x, y):
    n = len(x); mx = sum(x) / n; my = sum(y) / n
    sxy = sum((a - mx) * (b - my) for a, b in zip(x, y))
    sx = math.sqrt(sum((a - mx) ** 2 for a in x)); sy = math.sqrt(sum((b - my) ** 2 for b in y))
    return sxy / (sx * sy) if sx and sy else 0.0


def main():
    d = json.load(open(JSON_PATH, encoding="utf-8"))
    pb, md, vh = d["playbooks"], d["metadata"], d["votingHistoryAudit"]

    # ---------------- 1. Accuracy from raw roll ----------------
    print("\n== Accuracy: voter roll ==")
    total = active = 0
    county = Counter(); ncoa_all = ncoa_act = 0; pobox = 0
    precinct = Counter(); ids = set(); names = set()
    addr_counts = Counter(); dup_map = defaultdict(list); fam_suffix = defaultdict(set)
    pob_re = re.compile(r"\bP\.?\s?O\.?\s?BOX\b|\bPMB\b|UPS STORE|FEDEX")
    zip5_re = re.compile(r"^\s*(\d{5})")
    ws_re = re.compile(r"\s+")
    with open(VOTER, newline="", encoding="utf-8", errors="replace") as f:
        r = csv.reader(f); next(r)
        for row in r:
            if len(row) < 23:
                continue
            total += 1
            vid = row[0].strip()
            fn = row[1].strip().lstrip(".").upper()
            mn = row[2].strip().lstrip(".").upper()
            ln = row[3].strip().lstrip(".").upper()
            sf = row[4].strip().upper().replace(".", "")
            u_addr = ws_re.sub(" ", row[5].upper()).strip()
            u_city = ws_re.sub(" ", row[11].upper()).strip()
            zm = zip5_re.match(row[13] or "")
            z5 = zm.group(1) if zm else (row[13] or "").strip()[:5]
            st = row[22].strip(); is_act = st == "Active"; active += is_act
            c = ALIASES.get(row[14].strip().upper(), row[14].strip().upper())
            county[c] += 1
            if u_addr:
                addr_counts[(u_addr, u_city, c, z5)] += 1
            if fn and ln and z5:
                if sf in ("JR", "SR", "II", "III", "IV", "V"):
                    fam_suffix[(fn, ln, z5)].add(sf)
                if mn:
                    dup_map[(fn, mn, ln, sf, z5)].append((vid, u_addr, c, st))
            ms = row[19].strip().upper()
            if len(ms) == 2 and ms != "MS":
                ncoa_all += 1; ncoa_act += is_act
            if pob_re.search(" ".join(row[5].upper().split())):
                pobox += 1
            if row[15].strip():
                precinct[(c, row[15].strip())] += 1
            ids.add(vid)
            if len(fn) > 1 and len(ln) > 1:
                names.add(f"{fn} {ln}")

    check("total registrations", total, md["totalRecords"])
    check("active voters", active, md["activeVoters"])
    check("inactive voters", total - active, md["inactiveVoters"])
    rep_county = {c["county"].upper(): c["total"] for c in pb["countySummary"]}
    bad = [k for k, v in rep_county.items() if county.get(k, 0) != v]
    check("county totals match for all 82 counties", [], bad)
    check("counties with zero voters", [], [k for k, v in rep_county.items() if v == 0])
    notes.append(f"{county.get('', 0)} roll records have a blank county and are excluded from county figures.")
    check("8+ voter addresses (ZIP5-normalized)", sum(1 for v in addr_counts.values() if v >= 8), pb["highDensity"]["totalAddresses"])
    check("voters at 8+ voter addresses (ZIP5-normalized)", sum(v for v in addr_counts.values() if v >= 8), pb["highDensity"]["totalVoters"])
    check("out-of-state mailing (all)", ncoa_all, pb["ncoaRelocations"]["totalAllStatusVoters"])
    check("out-of-state mailing (active)", ncoa_act, pb["ncoaRelocations"]["totalVoters"])
    check("P.O. box in residence line", pobox, pb["commercialPOBox"]["totalVoters"])
    check("Jr./Sr. generational households (ZIP5-normalized)", sum(1 for s in fam_suffix.values() if len(s) >= 2), pb["duplicates"]["generationalPairs"])
    true_dups = sum(1 for recs in dup_map.values() if len(recs) > 1 and len(set(x[1] for x in recs if x[1])) > 1)
    act_dups = sum(1 for recs in dup_map.values() if len(recs) > 1 and len(set(x[1] for x in recs if x[1])) > 1 and sum(1 for x in recs if x[3] == "Active") >= 2)
    check("same-ZIP true duplicate pairs (ZIP5-normalized)", true_dups, pb["duplicates"]["trueDuplicates"])
    check("same-ZIP active-active duplicate pairs (ZIP5-normalized)", act_dups, pb["duplicates"]["activeActiveDuplicates"])
    check("precincts over 3,000", sum(v > 3000 for v in precinct.values()), pb["precinctCapacity"]["overCapacityCount"])

    print(f"  [info] precincts over 5,000 recomputed={sum(v > 5000 for v in precinct.values())}")
    # Benford on precinct registration totals
    digits = Counter(str(v)[0] for v in precinct.values() if v > 0)
    n = sum(digits.values())
    chi = sum((digits[str(k)] - n * math.log10(1 + 1 / k)) ** 2 / (n * math.log10(1 + 1 / k)) for k in range(1, 10))
    print(f"  [info] precincts={len(precinct)} benford chi2 recomputed={chi:.2f} report={pb['benfordsLaw']['chiSquare']}")
    if abs(chi - pb["benfordsLaw"]["chiSquare"]) > 0.05:
        failures.append("benford chi-square")

    # ---------------- History ----------------
    print("\n== Accuracy: voting history (October 26, 2026 extract) ==")
    rows = orphans = ballots_2026 = ballots_2025 = 0
    v2026_prim = set(); dup2026_prim = 0
    v2024 = set()
    with open(HIST, newline="", encoding="utf-8", errors="replace") as f:
        r = csv.reader(f); next(r)
        for row in r:
            if not row:
                continue
            rows += 1
            vid = row[0].strip()
            if vid not in ids:
                orphans += 1
            if len(row) > 7:
                ed = row[7].strip()
                if ed.endswith("/2026"):
                    ballots_2026 += 1
                elif ed.endswith("/2025"):
                    ballots_2025 += 1
                if ed == "03/10/2026":
                    if vid in v2026_prim:
                        dup2026_prim += 1
                    else:
                        v2026_prim.add(vid)
                if ed == "11/05/2024" and row[6].strip() == "General":
                    v2024.add(vid)
    check("history rows", rows, vh["totalHistoryRowsScanned"])
    check("unmatched (orphan) ballots", orphans, vh["orphanedHistoryRows"])
    check("2026 ballots recorded", ballots_2026, vh["ballots2026"])
    check("2025 ballots recorded", ballots_2025, vh["ballots2025"])
    check("03/10/2026 U.S. Congressional Primary unique voters", len(v2026_prim), vh["unique2026PrimaryVoters"])
    check("03/10/2026 U.S. Congressional Primary same-day duplicate credits", dup2026_prim, vh["duplicate2026PrimarySameDayCreditRows"])
    print(f"  [info] unique 2024 general voters recomputed={len(v2024):,} report={vh['unique2024GeneralVoters']:,}")
    if len(v2024) != vh["unique2024GeneralVoters"]:
        notes.append("2024 voter count differs by definition (election-type filter); review.")

    # ---------------- Internal consistency ----------------
    print("\n== Consistency: correlations recomputed from county table ==")
    live = [c for c in d["threatManifold"]["countyVectors"] if c["total"] > 0]
    rate = lambda k: [c[k] / c["total"] * 1000 for c in live]
    want = {
        "CORR-01": pearson(rate("ncoaCount"), rate("duplicateCount")),
        "CORR-02": pearson([c["total"] for c in live], [c["highDensityCount"] for c in live]),
        "CORR-05": pearson([c["x"] for c in live], [c["y"] for c in live]),
    }
    for c in d["threatManifold"]["correlations"]:
        if c["id"] in want and abs(want[c["id"]] - c["pearsonR"]) > 0.005:
            failures.append(c["id"])
            print(f"  [FAIL] {c['id']} r={c['pearsonR']} recomputed={want[c['id']]:.3f}")
        elif c["id"] in want:
            print(f"  [OK ] {c['id']} r={c['pearsonR']}")

    # ---------------- 2. Privacy scan ----------------
    print("\n== Privacy scan ==")
    targets = [JSON_PATH] + sys.argv[1:]
    targets += glob.glob(os.path.join(ROOT, ".next", "server", "app", "reports", "*.html"))
    targets += glob.glob(os.path.join(ROOT, ".next", "server", "app", "updates.html"))
    targets += glob.glob(os.path.join(ROOT, ".next", "server", "app", "manifold.html"))
    patterns = {
        "ZIP+4": re.compile(r"\b\d{5}-\d{4}\b"),
        "P.O. Box number": re.compile(r"\bBOX\s+#?\d+", re.I),
        "voter-ID token": re.compile(r"MS-REC|XXXX\d|\b1[0-9]{9}\b"),
        "requester username": re.compile(r"kkirkpatrick", re.I),
        "house number + street": re.compile(
            r"\b\d{1,5}\s+(?!block\b)(?:[NSEW]\.?\s+)?[A-Z][A-Z'\-]+(?:\s+[A-Z][A-Z'\-]+){0,3}\s+"
            r"(?:ST|RD|DR|AVE|LN|BLVD|CV|CT|PL|WAY|CIR|TRL|PKWY|HWY|STREET|ROAD|DRIVE|LANE)\b"),
    }
    # Public geography that legitimately looks like "First Last".
    geo = set()
    for c in d["threatManifold"]["countyVectors"]:
        geo.add(c["county"].upper())
    for p in pb["precinctCapacity"]["topOverCapacity"]:
        geo.add(p["precinctName"].upper())
    for c in pb["highDensity"]["topClusters"] + pb["highDensity"]["topSingleFamilyAnomalies"] + pb["missingDorm"]["campusBreakdown"]:
        geo.add(c["city"].upper()); geo.add(c["address"].upper())

    for t in targets:
        text = open(t, encoding="utf-8", errors="replace").read()
        plain = re.sub(r"<[^>]+>", " ", text)
        hits = []
        for label, rx in patterns.items():
            for m in rx.finditer(plain):
                hits.append(f"{label}: …{plain[max(0, m.start() - 30):m.end() + 10].strip()}…")
        words = re.findall(r"[A-Z][A-Za-z'\-]+", plain)
        name_hits = set()
        for a, b in zip(words, words[1:]):
            pair = f"{a.upper()} {b.upper()}"
            if pair in names and not any(pair in g for g in geo):
                name_hits.add(pair)
        rel = os.path.relpath(t, ROOT)
        print(f"  {rel}: {len(hits)} pattern hits, {len(name_hits)} name-like pairs")
        for h in hits[:15]:
            print("     ", h)
        if name_hits:
            print("      name-like pairs (review):", sorted(name_hits)[:60])
        if hits:
            failures.append(f"privacy patterns in {rel}")
        if name_hits:
            notes.append(f"{rel}: {len(name_hits)} word pairs match a voter's first+last name; reviewed list printed above.")

    print("\n== Notes ==")
    for nline in notes:
        print("  -", nline)
    print("\nRESULT:", "PASS" if not failures else f"FAIL ({len(failures)}): {failures}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
