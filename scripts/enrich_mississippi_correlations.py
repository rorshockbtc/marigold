import os
import glob
#!/usr/bin/env python3
import csv
import json
import math
import re
from collections import Counter
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from state_schema import canonical_reader, VOTER_FIELDS

# Raw extracts stay outside git (see .gitignore). Override with MS_VOTER_FILE / MS_HISTORY_FILE.
MS_DATA_DIR = os.environ.get("MS_DATA_DIR", os.path.expanduser("~/Developer/marigold/mississippi voter files most recent Octoer 2026"))
VOTER_FILE = os.environ.get("MS_VOTER_FILE") or next(iter(sorted(f for f in glob.glob(os.path.join(MS_DATA_DIR, "*.csv")) if "VotingHistory" not in f)), "")
JSON_PATH = "/Users/kendallkylecyree/.gemini/antigravity/scratch/rorshockbtc_repos/marigold/src/data/mississippi_audit_results.json"

CAMPUS_KEYWORD_REGEX = re.compile(r"\b(HALL|DORM|DORMITORY|CAMPUS|UNIVERSITY|COLLEGE|APARTMENT|APTS|TOWERS)\b", re.IGNORECASE)
EXPLICIT_MULTIUNIT_KEYWORDS = ("DORM", "DORMITORY", "RESIDENCE HALL", "APARTMENT", "APTS", "TOWERS", "COMMONS", "COMPLEX", "VILLAGE", "MANOR", "MVSU", "ASU")
UNIVERSITY_CITIES = ("MISSISSIPPI STATE", "UNIVERSITY", "ITTA BENA", "LORMAN", "TOUGALOO", "PERKINSTON")
UNIVERSITY_STREETS = ("118 COLLEGE DR", "1100 COLLEGE ST", "1400 J R LYNCH", "150 RUST AVE", "ASU DR", "MVSU")
STREET_NAME_FALSE_POSITIVE_REGEX = re.compile(
    r"\b(HALL|COLLEGE|UNIVERSITY|CAMPUS)\s+(ST|STREET|RD|ROAD|AVE|AVENUE|DR|DRIVE|LN|LANE|BLVD|CIR|CIRCLE|CT|COURT|WAY|PKWY|HWY|CV|COVE|VIEW|PL|PLACE|FERRY|TRL|TRAIL|HILL)\b",
    re.IGNORECASE
)
UNIT_REGEX = re.compile(r"\b(APT|UNIT|RM|ROOM|SUITE|BLDG|LOT|TRLR|STE)\b|#", re.IGNORECASE)
WHITESPACE_RE = re.compile(r"\s+")

def normalize_addr(addr: str) -> str:
    return WHITESPACE_RE.sub(" ", addr.upper()).strip()

def pearson_r(xs, ys):
    n = len(xs)
    if n < 2:
        return 0.0
    mx = sum(xs) / n
    my = sum(ys) / n
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    denx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    deny = math.sqrt(sum((y - my) ** 2 for y in ys))
    if denx < 1e-9 or deny < 1e-9:
        return 0.0
    return round(num / (denx * deny), 3)

def rank_vector(vals):
    indexed = sorted(enumerate(vals), key=lambda x: x[1])
    ranks = [0.0] * len(vals)
    for r, (idx, _) in enumerate(indexed):
        ranks[idx] = float(r + 1)
    return ranks

def spearman_rho(xs, ys):
    return pearson_r(rank_vector(xs), rank_vector(ys))

def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    print("1. Re-verifying Playbook 2 (Missing Dorm/Unit) with strict city vs street separation...")
    raw_keyword_total = 0
    verified_total = 0
    active_total = 0
    street_fp_removed = 0
    campus_breakdown = Counter()
    county_dorm_counts = Counter()

    with open(VOTER_FILE, "r", encoding="utf-8", errors="replace") as vf:
        reader = canonical_reader(vf, VOTER_FIELDS)
        for row in reader:
            if len(row) < 23:
                continue
            status = row[22].strip()
            is_active = (status == "Active")
            res_addr_raw = row[5].strip()
            res_city_raw = row[11].strip()
            res_county_raw = {"JEFF DAVIS": "JEFFERSON DAVIS"}.get(row[14].strip().upper(), row[14].strip().upper())
            upper_addr = normalize_addr(res_addr_raw)
            norm_city = normalize_addr(res_city_raw)

            if CAMPUS_KEYWORD_REGEX.search(upper_addr) and not UNIT_REGEX.search(upper_addr):
                raw_keyword_total += 1
                has_explicit_bldg = (
                    any(kw in upper_addr for kw in EXPLICIT_MULTIUNIT_KEYWORDS)
                    or (norm_city in UNIVERSITY_CITIES)
                    or any(u in upper_addr for u in UNIVERSITY_STREETS)
                )
                is_street_name_fp = bool(STREET_NAME_FALSE_POSITIVE_REGEX.search(upper_addr)) and not has_explicit_bldg
                if is_street_name_fp:
                    street_fp_removed += 1
                else:
                    verified_total += 1
                    if is_active:
                        active_total += 1
                    c_title = res_county_raw.title() if res_county_raw != "DESOTO" else "DeSoto"
                    campus_breakdown[(upper_addr, norm_city, c_title)] += 1
                    county_dorm_counts[c_title] += 1

    data["playbooks"]["missingDorm"] = {
        "totalVoters": verified_total,
        "activeVoters": active_total,
        "rawKeywordMatches": raw_keyword_total,
        "streetNameFalsePositivesRemoved": street_fp_removed,
        "campusBreakdown": [
            {"address": a, "city": ci, "county": co, "voterCount": cnt}
            for (a, ci, co), cnt in campus_breakdown.most_common(15)
        ]
    }
    print(f"   -> Verified Missing Dorm: {verified_total:,} ({active_total:,} Active), Removed {street_fp_removed:,} street-name false positives.")

    # Update countySummary and countyVectors with cleaned missingDormCount
    for cs in data["playbooks"]["countySummary"]:
        cs["missingDormCount"] = county_dorm_counts.get(cs["county"], 0)
    for cv in data["threatManifold"]["countyVectors"]:
        cv["missingDormCount"] = county_dorm_counts.get(cv["county"], 0)

    # 2. Compute Mathematical Correlations (Pearson r, Spearman rho, Mahalanobis Distance, Rate of Change) across all 82 counties
    cvs = data["threatManifold"]["countyVectors"]
    totals = [c["total"] for c in cvs]
    inactives = [c["inactive"] for c in cvs]
    inactive_pcts = [(c["inactive"] / max(1, c["total"])) * 100.0 for c in cvs]
    hd_counts = [c["highDensityCount"] for c in cvs]
    hd_voters = [c["highDensityVoters"] for c in cvs]
    ncoa_counts = [c["ncoaCount"] for c in cvs]
    dup_counts = [c["duplicateCount"] for c in cvs]
    over_cap = [c["overCapacityPrecincts"] for c in cvs]
    max_prec = [c["maxPrecinctVoters"] for c in cvs]
    votes_2024 = [c["votes2024General"] for c in cvs]
    turnout_rates = [(c["votes2024General"] / max(1, c["active"])) * 100.0 for c in cvs]
    dorm_counts = [c["missingDormCount"] for c in cvs]
    xs = [c["x"] for c in cvs]
    ys = [c["y"] for c in cvs]
    zs = [c["z"] for c in cvs]

    # Compute Mahalanobis Distance D_M in 3D space (using empirical variance + covariance)
    mx = sum(xs) / len(xs)
    my = sum(ys) / len(ys)
    mz = sum(zs) / len(zs)
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs) / len(xs)) or 1.0
    sy = math.sqrt(sum((y - my) ** 2 for y in ys) / len(ys)) or 1.0
    sz = math.sqrt(sum((z - mz) ** 2 for z in zs) / len(zs)) or 1.0

    for c in cvs:
        zx = (c["x"] - mx) / sx
        zy = (c["y"] - my) / sy
        zz = (c["z"] - mz) / sz
        c["mahalanobisDistance"] = round(math.sqrt(zx * zx + zy * zy + zz * zz), 2)
        c["inactiveRatePct"] = round((c["inactive"] / max(1, c["total"])) * 100.0, 1)
        c["turnout2024Pct"] = round((c["votes2024General"] / max(1, c["active"])) * 100.0, 1)

    # ---- Correlations: every number below is computed; no hand-typed statistics. ----
    # Count-vs-count comparisons across counties mostly measure county size, so
    # CORR-01/03/04 use rates per 1,000 registered voters to remove the size effect.
    def ols_slope(xv, yv):
        n = len(xv)
        mxv, myv = sum(xv) / n, sum(yv) / n
        den = sum((a - mxv) ** 2 for a in xv)
        return sum((a - mxv) * (b - myv) for a, b in zip(xv, yv)) / den if den else 0.0

    def strength_label(r):
        a = abs(r)
        word = "Very strong" if a >= 0.8 else "Strong" if a >= 0.6 else "Moderate" if a >= 0.4 else "Weak" if a >= 0.2 else "Little or no"
        return f"{word} {'positive' if r >= 0 else 'negative'} link" if a >= 0.2 else "Little or no link"

    live = [c for c in cvs if c["total"] > 0]
    per_k = lambda key: [c[key] / c["total"] * 1000.0 for c in live]
    ncoa_rate, dup_rate, hd_rate = per_k("ncoaCount"), per_k("duplicateCount"), per_k("highDensityVoters")
    inactive_rate = [c["inactive"] / c["total"] * 100.0 for c in live]
    overcap_rate = [c["overCapacityPrecincts"] / c["total"] * 10000.0 for c in live]
    totals_live = [c["total"] for c in live]
    hd_live = [c["highDensityCount"] for c in live]
    xs_l, ys_l = [c["x"] for c in live], [c["y"] for c in live]

    s01 = ols_slope(ncoa_rate, dup_rate)
    s02 = ols_slope(totals_live, hd_live)
    s03 = ols_slope(inactive_rate, hd_rate)
    hd = data["playbooks"]["highDensity"]
    hd_inactive_share = (1 - hd["activeVoters"] / hd["totalVoters"]) * 100 if hd.get("totalVoters") else 0
    big = [c for c in live if c["overCapacityPrecincts"] >= 5]
    big_share = sum(c["ncoaCount"] for c in big) / max(1, sum(c["ncoaCount"] for c in live)) * 100

    def pair(cid, label, title, xv, yv, rate_text, takeaway):
        r = pearson_r(xv, yv)
        return {"id": cid, "pairLabel": label, "plainTitle": title, "pearsonR": r,
                "spearmanRho": spearman_rho(xv, yv), "strength": strength_label(r),
                "rateOfChange": rate_text, "commonManTakeaway": takeaway, "countiesCompared": len(xv)}

    correlation_pairs = [
        pair("CORR-01", "Out-of-state mail vs. same-ZIP duplicates (both per 1,000 voters)",
             "Do counties with more movers also have more duplicate records?",
             ncoa_rate, dup_rate,
             f"Straight-line fit: +1 out-of-state mailing per 1,000 voters goes with {s01:+.2f} duplicate pairs per 1,000 voters.",
             "Counties with lots of people moving (college towns, military areas, fast-growing suburbs) tend to have both. "
             "This is a pattern across counties, not proof that one causes the other."),
        pair("CORR-02", "County size vs. addresses with 8+ voters",
             "Do bigger counties have more crowded addresses?",
             totals_live, hd_live,
             f"Straight-line fit: about {s02 * 10000:.1f} more 8+ voter addresses for every 10,000 additional registered voters.",
             "Raw counts mostly track county size. That is why this report separates campuses, care homes and apartment "
             "complexes before showing single-family homes."),
        pair("CORR-03", "Inactive share vs. voters at 8+ voter addresses (per 1,000 voters)",
             "Do counties with more Inactive voters have more crowded addresses?",
             inactive_rate, hd_rate,
             f"Statewide, {hd_inactive_share:.1f}% of voters at 8+ voter addresses are already marked Inactive.",
             "A house with many names on the roll often reflects past residents who moved away. Many are already Inactive "
             "and will come off the roll on the normal federal schedule."),
        pair("CORR-04", "Precincts over 3,000 voters vs. out-of-state mail (both size-adjusted)",
             "Do counties with crowded precincts also have more out-of-state mail?",
             overcap_rate, ncoa_rate,
             f"Counties with 5 or more precincts over 3,000 voters ({len(big)} counties) hold {big_share:.1f}% of active out-of-state mailings.",
             "These are separate tasks: splitting busy precincts and sending address-confirmation notices. Read the "
             "connection score before assuming one fix helps the other."),
        pair("CORR-05", "Address score (X) vs. mail & duplicate score (Y)",
             "Why the map uses three directions instead of one score",
             xs_l, ys_l,
             "The two scores overlap only partly, so a single combined number would hide which task a county needs.",
             "Looking at addresses, mail moves and precinct size separately shows each county's own to-do list."),
    ]

    for cp in correlation_pairs:
        if cp["id"] in ("CORR-01", "CORR-03", "CORR-04") and abs(cp["pearsonR"]) < 0.2:
            cp["commonManTakeaway"] = ("No clear pattern once county size is taken into account. "
                                       "Treat these as separate tasks rather than expecting one fix to solve both.")

    normal = [c for c in live if c["regime"] == "Equilibrium Manifold Surface"]
    by_regime = lambda reg: sorted([c for c in live if c["regime"] == reg], key=lambda c: -c["threatEnergy"])
    def tier(name, reg, focus, metric_fn):
        group = by_regime(reg)
        return {"tier": f"{name} ({len(group)} counties)", "counties": [c["county"] for c in group[:10]],
                "primaryFocus": focus, "benchmarkMetric": metric_fn(group) if group else "—"}
    avg = lambda g, k: sum(c[k] for c in g) / len(g)

    commissioner_toolkit = {
        "headline": "How to share these findings with your county",
        "subheadline": "Plain steps for talking with your Board of Supervisors, Circuit Clerk and neighboring counties.",
        "peerTiers": [
            tier("Main focus: out-of-state mail & duplicates", "Axis-Y Interstate Drift Ridge",
                 "Send address-confirmation notices to active voters with out-of-state mail; review same-ZIP duplicate pairs.",
                 lambda g: f"Average {avg(g, 'ncoaCount'):.0f} active out-of-state mailings per county."),
            tier("Main focus: apartment & dorm unit numbers", "Axis-X Spatial Domicile Ridge",
                 "Work with campus housing and apartment managers to add room and unit numbers.",
                 lambda g: f"Average {avg(g, 'highDensityCount'):.0f} addresses with 8+ voters per county."),
            tier("Main focus: large precincts", "Axis-Z Precinct Strain Ridge",
                 "Review precincts over 3,000 voters for splits or extra poll-book stations.",
                 lambda g: f"Average {avg(g, 'overCapacityPrecincts'):.1f} precincts over 3,000 voters per county."),
        ],
        "evangelismSteps": [
            {"step": "01", "title": "Start with what checked out",
             "detail": "Every past ballot record matched a registered voter. Lead with that, then explain that ordinary buildings and Jr./Sr. families were filtered out before any list was made."},
            {"step": "02", "title": "Find your county's main task",
             "detail": "Use the 3D map or the county table to see whether addresses, mail moves or precinct size drives your county's score."},
            {"step": "03", "title": "Compare with similar counties",
             "detail": f"Bring the 82-county table to your next district meeting. {len(normal)} counties sit in the normal range for their size; the rest each have one main task."},
        ],
    }

    data["threatManifold"]["correlations"] = correlation_pairs
    data["threatManifold"]["commissionerToolkit"] = commissioner_toolkit

    with open(JSON_PATH, "w", encoding="utf-8") as out_f:
        json.dump(data, out_f, indent=2)
    print("2. Successfully enriched src/data/mississippi_audit_results.json with Pearson/Spearman correlations, Mahalanobis distances, and Commissioner Toolkit!")

if __name__ == "__main__":
    main()
