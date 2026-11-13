#!/usr/bin/env python3
"""
Marigold Server-Side FOSS Data Refinery (Step 1A)
================================================
Deterministically downloads and joins 5 keyless federal Public Health & Fiscal/Banking sources
onto the 5-digit `county_fips` spine in `public/datasets/civic/`:

  1. CDC PLACES 2024 County GIS-Friendly Release (`i46a-9kgh`)
  2. HHS Registered Acute Hospital Facilities (`vz64-k9wr`) — counts only; zero facility addresses/names retained
  3. CDC NCHS Model-Based Drug Poisoning Mortality (`rpvx-m2md`)
  4. IRS SOI 2022-2023 County-to-County Tax Migration (`countyinflow2223.csv` / `countyoutflow2223.csv`, latin-1)
  5. FDIC 2024 Summary of Deposits API (`banks.data.fdic.gov/api/sod`, paginated)

Outputs strictly Zero-PII county aggregates:
  - public/datasets/civic/us_county_public_health_access_2024.csv
  - public/datasets/civic/us_county_irs_migration_fdic_banking_2024.csv
  - /tmp/marigold_public_lake_cache/verified_highlights.json
"""

from __future__ import annotations

import csv
import hashlib
import json
import math
import os
import statistics
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

MARIGOLD_ROOT = Path(__file__).resolve().parent.parent
CIVIC_DIR = MARIGOLD_ROOT / "public" / "datasets" / "civic"
CACHE_DIR = Path("/tmp/marigold_public_lake_cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)
CIVIC_DIR.mkdir(parents=True, exist_ok=True)

USER_AGENT = "Mozilla/5.0 MarigoldCivicResearch/1.0 (+https://marigoldinsights.org)"

SOURCES = {
    "cdc_places_2024": "https://data.cdc.gov/api/views/i46a-9kgh/rows.csv?accessType=DOWNLOAD",
    "hhs_hospitals": "https://healthdata.gov/api/views/vz64-k9wr/rows.csv?accessType=DOWNLOAD",
    "cdc_nchs_drug_mortality": "https://data.cdc.gov/api/views/rpvx-m2md/rows.csv?accessType=DOWNLOAD",
    "irs_inflow_2223": "https://www.irs.gov/pub/irs-soi/countyinflow2223.csv",
    "irs_outflow_2223": "https://www.irs.gov/pub/irs-soi/countyoutflow2223.csv",
}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def fetch_cached(key: str, url: str) -> Tuple[Path, str]:
    ext = ".csv"
    dest = CACHE_DIR / f"{key}{ext}"
    if not dest.exists() or dest.stat().st_size == 0:
        print(f"Downloading {key} from {url} ...")
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read()
        dest.write_bytes(raw)
        print(f"  Saved {len(raw):,} bytes -> {dest}")
    else:
        print(f"Using cached {key} ({dest.stat().st_size:,} bytes)")
    return dest, sha256_file(dest)


def fetch_fdic_sod_2024() -> Tuple[Path, str, int]:
    dest = CACHE_DIR / "fdic_sod_2024_raw.json"
    if not dest.exists() or dest.stat().st_size == 0:
        print("Fetching paginated FDIC 2024 Summary of Deposits (banks.data.fdic.gov) ...")
        all_rows = []
        offset = 0
        limit = 10000
        total = None
        while total is None or offset < total:
            url = (
                f"https://banks.data.fdic.gov/api/sod?filters=YEAR%3A2024"
                f"&fields=STCNTYBR,DEPSUMBR,CERT&limit={limit}&offset={offset}&format=json"
            )
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=30) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            if total is None:
                total = int(payload["meta"]["total"])
            batch = [item["data"] for item in payload.get("data", [])]
            if not batch:
                break
            all_rows.extend(batch)
            offset += len(batch)
            print(f"  FDIC fetched {len(all_rows):,} / {total:,}")
        raw_bytes = json.dumps(all_rows).encode("utf-8")
        dest.write_bytes(raw_bytes)
    else:
        all_rows = json.loads(dest.read_text("utf-8"))
        print(f"Using cached FDIC 2024 ({len(all_rows):,} branch rows)")
    return dest, sha256_file(dest), len(all_rows)


def norm_fips(raw: object) -> Optional[str]:
    if raw is None:
        return None
    s = str(raw).strip()
    if not s:
        return None
    # Handle float strings like "37019.0"
    if "." in s:
        try:
            s = str(int(float(s)))
        except ValueError:
            return None
    digits = "".join(ch for ch in s if ch.isdigit())
    if not digits:
        return None
    digits = digits.zfill(5)
    if len(digits) != 5 or digits == "00000":
        return None
    return digits


def parse_float_clean(raw: object) -> Optional[float]:
    if raw is None:
        return None
    s = str(raw).strip()
    if not s or s.upper() in {"NA", "N/A", "NULL", "NONE", "."}:
        return None
    try:
        v = float(s)
    except ValueError:
        return None
    if math.isnan(v) or math.isinf(v):
        return None
    if v in (-99.0, -88.0, -77.0, -999.0, -888.0, -777.0):
        return None
    return v


def parse_int_clean(raw: object, allow_negative: bool = False) -> Optional[int]:
    v = parse_float_clean(raw)
    if v is None:
        return None
    iv = int(round(v))
    if not allow_negative and iv < 0:
        return 0
    return iv


def fmt_num(v: Optional[float], decimals: int = 2) -> str:
    if v is None:
        return ""
    return f"{v:.{decimals}f}"


def fmt_int(v: Optional[int]) -> str:
    if v is None:
        return ""
    return str(v)


def main() -> None:
    raw_hashes: Dict[str, str] = {}

    cdc_path, raw_hashes["cdc_places_2024"] = fetch_cached("cdc_places_2024", SOURCES["cdc_places_2024"])
    hhs_path, raw_hashes["hhs_hospitals"] = fetch_cached("hhs_hospitals", SOURCES["hhs_hospitals"])
    nchs_path, raw_hashes["cdc_nchs_drug_mortality"] = fetch_cached("cdc_nchs_drug_mortality", SOURCES["cdc_nchs_drug_mortality"])
    irs_in_path, raw_hashes["irs_inflow_2223"] = fetch_cached("irs_inflow_2223", SOURCES["irs_inflow_2223"])
    irs_out_path, raw_hashes["irs_outflow_2223"] = fetch_cached("irs_outflow_2223", SOURCES["irs_outflow_2223"])
    fdic_path, raw_hashes["fdic_sod_2024"], fdic_branch_raw_count = fetch_fdic_sod_2024()

    # 0. Load existing civic atlas baseline
    atlas_path = CIVIC_DIR / "us_county_election_admin_cvap_2024.csv"
    atlas_by_fips: Dict[str, Dict[str, str]] = {}
    with open(atlas_path, "r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            fips = norm_fips(row.get("county_fips"))
            if fips:
                atlas_by_fips[fips] = row
    print(f"Loaded {len(atlas_by_fips):,} existing civic atlas counties")

    # 1. Load CDC PLACES 2024 County GIS
    places_by_fips: Dict[str, Dict[str, str]] = {}
    with open(cdc_path, "r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            fips = norm_fips(row.get("CountyFIPS"))
            if not fips:
                continue
            places_by_fips[fips] = row
    print(f"Loaded {len(places_by_fips):,} CDC PLACES 2024 counties")

    # 2. Load HHS Hospitals -> strict Zero-PII county count only
    hhs_ccns_by_fips: Dict[str, set] = defaultdict(set)
    hhs_raw_rows = 0
    with open(hhs_path, "r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            hhs_raw_rows += 1
            fips = norm_fips(row.get("fips_code"))
            if not fips:
                continue
            fac_id = (row.get("ccn") or "").strip() or (row.get("hhs_id") or "").strip()
            if fac_id:
                hhs_ccns_by_fips[fips].add(fac_id)
    print(f"Aggregated {hhs_raw_rows:,} HHS hospital rows across {len(hhs_ccns_by_fips):,} counties (zero facility names/addresses retained)")

    # 3. Load CDC NCHS Drug Poisoning Mortality (latest year per FIPS)
    nchs_latest: Dict[str, Tuple[int, Optional[float]]] = {}
    with open(nchs_path, "r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            fips = norm_fips(row.get("FIPS") or row.get("fips"))
            if not fips:
                continue
            yr = parse_int_clean(row.get("Year") or row.get("year")) or 0
            rate = parse_float_clean(
                row.get("Model-based Death Rate") or row.get("model_based_death_rate")
            )
            if rate is None:
                continue
            prev = nchs_latest.get(fips)
            if prev is None or yr >= prev[0]:
                nchs_latest[fips] = (yr, rate)
    print(f"Loaded {len(nchs_latest):,} NCHS county drug mortality rates")

    # 4. Empirical Bayes state-shrunk disability prevalence + civic_health_barrier_z
    state_rates: Dict[str, List[Tuple[str, float, float]]] = defaultdict(list)
    for fips, row in places_by_fips.items():
        st = (row.get("StateAbbr") or "").strip()
        dis = parse_float_clean(row.get("DISABILITY_AdjPrev"))
        pop18 = parse_float_clean(row.get("TotalPop18plus")) or parse_float_clean(row.get("TotalPopulation")) or 1000.0
        if st and dis is not None and pop18 > 0:
            state_rates[st].append((fips, dis, pop18))

    eb_disability: Dict[str, float] = {}
    for st, items in state_rates.items():
        vals = [r for _, r, _ in items]
        mu = statistics.mean(vals)
        # Approximate sampling variance p*(100-p)/N_eff using BRFSS county-level effective sample floor
        # Total variance across counties = tau^2 + mean(sampling_var)
        s_vars = [(mu * max(1.0, 100.0 - mu)) / max(100.0, min(pop, 25000.0)) for _, _, pop in items]
        total_var = statistics.pvariance(vals) if len(vals) > 1 else 0.0
        mean_s_var = statistics.mean(s_vars) if s_vars else 1.0
        tau2 = max(0.01, total_var - mean_s_var)
        for (fips, rate, pop), sv in zip(items, s_vars):
            weight = tau2 / (tau2 + sv)
            eb_disability[fips] = weight * rate + (1.0 - weight) * mu

    # Compute standardized health barrier score (mean z-score across disability, lack of transport, uninsured)
    barrier_components: Dict[str, Tuple[Optional[float], Optional[float], Optional[float]]] = {}
    dis_list, trp_list, uni_list = [], [], []
    for fips, row in places_by_fips.items():
        d = eb_disability.get(fips) or parse_float_clean(row.get("DISABILITY_AdjPrev"))
        t = parse_float_clean(row.get("LACKTRPT_AdjPrev"))
        u = parse_float_clean(row.get("ACCESS2_AdjPrev"))
        barrier_components[fips] = (d, t, u)
        if d is not None:
            dis_list.append(d)
        if t is not None:
            trp_list.append(t)
        if u is not None:
            uni_list.append(u)

    mu_d, sd_d = statistics.mean(dis_list), statistics.pstdev(dis_list) or 1.0
    mu_t, sd_t = statistics.mean(trp_list), statistics.pstdev(trp_list) or 1.0
    mu_u, sd_u = statistics.mean(uni_list), statistics.pstdev(uni_list) or 1.0

    # Write us_county_public_health_access_2024.csv
    health_out_path = CIVIC_DIR / "us_county_public_health_access_2024.csv"
    health_cols = [
        "county_fips",
        "state_abbr",
        "county_name",
        "total_pop_2024",
        "cvap_2024",
        "disability_adj_prev",
        "eb_smoothed_disability_pct",
        "mobility_adj_prev",
        "cognition_adj_prev",
        "lack_transport_adj_prev",
        "uninsured_adj_prev",
        "diabetes_adj_prev",
        "hypertension_adj_prev",
        "obesity_adj_prev",
        "depression_adj_prev",
        "food_insecurity_adj_prev",
        "hhs_hospitals_count",
        "hospital_desert_flag",
        "nchs_drug_mortality_rate",
        "eavs_mail_undeliverable",
        "eavs_provisional_cast",
        "fema_disasters_2020_2026",
        "civic_health_barrier_z",
    ]
    health_rows = []
    for fips in sorted(places_by_fips.keys()):
        prow = places_by_fips[fips]
        arow = atlas_by_fips.get(fips, {})
        st = (prow.get("StateAbbr") or arow.get("state_abbr") or "").strip()
        cname = (prow.get("CountyName") or arow.get("county_name") or "").strip()
        if st == "US" or not st:
            continue
        pop_val = parse_int_clean(str(prow.get("TotalPopulation") or "").replace(",", ""))
        cvap_val = parse_int_clean(arow.get("cvap_2024"))
        dis = parse_float_clean(prow.get("DISABILITY_AdjPrev"))
        eb_dis = eb_disability.get(fips)
        mob = parse_float_clean(prow.get("MOBILITY_AdjPrev"))
        cog = parse_float_clean(prow.get("COGNITION_AdjPrev"))
        trp = parse_float_clean(prow.get("LACKTRPT_AdjPrev"))
        uni = parse_float_clean(prow.get("ACCESS2_AdjPrev"))
        diab = parse_float_clean(prow.get("DIABETES_AdjPrev"))
        bp = parse_float_clean(prow.get("BPHIGH_AdjPrev"))
        ob = parse_float_clean(prow.get("OBESITY_AdjPrev"))
        dep = parse_float_clean(prow.get("DEPRESSION_AdjPrev"))
        food = parse_float_clean(prow.get("FOODINSECU_AdjPrev"))
        hosp_cnt = len(hhs_ccns_by_fips.get(fips, set()))
        hosp_desert = 1 if hosp_cnt == 0 else 0
        nchs_rate = nchs_latest[fips][1] if fips in nchs_latest else None
        eavs_mail_u = parse_int_clean(arow.get("eavs_mail_undeliverable"))
        eavs_prov = parse_int_clean(arow.get("eavs_provisional_cast"))
        fema_cnt = parse_int_clean(arow.get("fema_disasters_2020_2026"))

        z_parts = []
        if eb_dis is not None:
            z_parts.append((eb_dis - mu_d) / sd_d)
        if trp is not None:
            z_parts.append((trp - mu_t) / sd_t)
        if uni is not None:
            z_parts.append((uni - mu_u) / sd_u)
        barrier_z = statistics.mean(z_parts) if z_parts else None

        health_rows.append({
            "county_fips": fips,
            "state_abbr": st,
            "county_name": cname,
            "total_pop_2024": fmt_int(pop_val),
            "cvap_2024": fmt_int(cvap_val),
            "disability_adj_prev": fmt_num(dis, 2),
            "eb_smoothed_disability_pct": fmt_num(eb_dis, 2),
            "mobility_adj_prev": fmt_num(mob, 2),
            "cognition_adj_prev": fmt_num(cog, 2),
            "lack_transport_adj_prev": fmt_num(trp, 2),
            "uninsured_adj_prev": fmt_num(uni, 2),
            "diabetes_adj_prev": fmt_num(diab, 2),
            "hypertension_adj_prev": fmt_num(bp, 2),
            "obesity_adj_prev": fmt_num(ob, 2),
            "depression_adj_prev": fmt_num(dep, 2),
            "food_insecurity_adj_prev": fmt_num(food, 2),
            "hhs_hospitals_count": str(hosp_cnt),
            "hospital_desert_flag": str(hosp_desert),
            "nchs_drug_mortality_rate": fmt_num(nchs_rate, 2),
            "eavs_mail_undeliverable": fmt_int(eavs_mail_u),
            "eavs_provisional_cast": fmt_int(eavs_prov),
            "fema_disasters_2020_2026": fmt_int(fema_cnt),
            "civic_health_barrier_z": fmt_num(barrier_z, 3),
        })

    with open(health_out_path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=health_cols)
        w.writeheader()
        w.writerows(health_rows)
    health_sha = sha256_file(health_out_path)
    print(f"Wrote {len(health_rows):,} rows -> {health_out_path.name} (SHA-256: {health_sha})")

    # 5. Parse IRS SOI 2022-2023 Migration (latin-1 encoding!)
    irs_inflow: Dict[str, Tuple[int, int, int]] = {}
    with open(irs_in_path, "r", encoding="latin-1", newline="") as f:
        for row in csv.DictReader(f):
            try:
                y1_s = int(row["y1_statefips"])
                y1_c = int(row["y1_countyfips"])
                y2_s = int(row["y2_statefips"])
                y2_c = int(row["y2_countyfips"])
            except (ValueError, KeyError):
                continue
            if y1_s == 96 and y1_c == 0 and 1 <= y2_s <= 56 and y2_c > 0:
                fips = f"{y2_s:02d}{y2_c:03d}"
                n1 = max(0, int(float(row["n1"])))
                n2 = max(0, int(float(row["n2"])))
                agi = max(0, int(float(row["agi"])))
                irs_inflow[fips] = (n1, n2, agi)

    irs_outflow: Dict[str, Tuple[int, int, int]] = {}
    with open(irs_out_path, "r", encoding="latin-1", newline="") as f:
        for row in csv.DictReader(f):
            try:
                y1_s = int(row["y1_statefips"])
                y1_c = int(row["y1_countyfips"])
                y2_s = int(row["y2_statefips"])
                y2_c = int(row["y2_countyfips"])
            except (ValueError, KeyError):
                continue
            if y2_s == 96 and y2_c == 0 and 1 <= y1_s <= 56 and y1_c > 0:
                fips = f"{y1_s:02d}{y1_c:03d}"
                n1 = max(0, int(float(row["n1"])))
                n2 = max(0, int(float(row["n2"])))
                agi = max(0, int(float(row["agi"])))
                irs_outflow[fips] = (n1, n2, agi)
    print(f"Loaded IRS 2022-2023 migration: {len(irs_inflow):,} inflow counties, {len(irs_outflow):,} outflow counties")

    # 6. Aggregate FDIC 2024 Summary of Deposits
    fdic_raw = json.loads(fdic_path.read_text("utf-8"))
    fdic_branches: Dict[str, int] = defaultdict(int)
    fdic_certs: Dict[str, set] = defaultdict(set)
    fdic_dep_k: Dict[str, int] = defaultdict(int)
    for item in fdic_raw:
        fips = norm_fips(item.get("STCNTYBR"))
        if not fips:
            continue
        fdic_branches[fips] += 1
        if item.get("CERT") is not None:
            fdic_certs[fips].add(str(item["CERT"]))
        dep = item.get("DEPSUMBR")
        if dep is not None:
            try:
                fdic_dep_k[fips] += int(round(float(dep)))
            except (ValueError, TypeError):
                pass
    print(f"Aggregated {fdic_branch_raw_count:,} FDIC branches across {len(fdic_branches):,} counties")

    # Join all counties present in atlas (50 states + DC, excluding PR if IRS/FDIC unavailable, or include all atlas counties with 5-digit fips)
    fiscal_fips_set = sorted((set(irs_inflow.keys()) & set(irs_outflow.keys())) | (set(atlas_by_fips.keys()) & (set(places_by_fips.keys()) | set(fdic_branches.keys()))))
    fiscal_out_path = CIVIC_DIR / "us_county_irs_migration_fdic_banking_2024.csv"
    fiscal_cols = [
        "county_fips",
        "state_abbr",
        "county_name",
        "cvap_2024",
        "active_to_cvap_pct",
        "irs_inflow_returns",
        "irs_outflow_returns",
        "irs_net_returns",
        "irs_inflow_individuals",
        "irs_outflow_individuals",
        "irs_net_individuals",
        "irs_inflow_agi_thousands",
        "irs_outflow_agi_thousands",
        "irs_net_agi_thousands",
        "irs_net_agi_millions",
        "net_domestic_mig_2020_2024",
        "fdic_branches_2024",
        "fdic_unique_banks_2024",
        "fdic_deposits_millions_2024",
        "banking_desert_flag",
    ]
    fiscal_rows = []
    for fips in fiscal_fips_set:
        arow = atlas_by_fips.get(fips, {})
        prow = places_by_fips.get(fips, {})
        st = (arow.get("state_abbr") or prow.get("StateAbbr") or "").strip()
        cname = (arow.get("county_name") or prow.get("CountyName") or "").strip()
        if not st or not cname:
            continue
        in_ret, in_ind, in_agi = irs_inflow.get(fips, (0, 0, 0))
        out_ret, out_ind, out_agi = irs_outflow.get(fips, (0, 0, 0))
        has_irs = (fips in irs_inflow) or (fips in irs_outflow)
        net_ret = (in_ret - out_ret) if has_irs else None
        net_ind = (in_ind - out_ind) if has_irs else None
        net_agi_k = (in_agi - out_agi) if has_irs else None
        net_agi_m = (net_agi_k / 1000.0) if net_agi_k is not None else None

        br = fdic_branches.get(fips, 0)
        uniq = len(fdic_certs.get(fips, set()))
        dep_m = fdic_dep_k.get(fips, 0) / 1000.0
        desert = 1 if br == 0 else 0

        fiscal_rows.append({
            "county_fips": fips,
            "state_abbr": st,
            "county_name": cname,
            "cvap_2024": fmt_int(parse_int_clean(arow.get("cvap_2024"))),
            "active_to_cvap_pct": fmt_num(parse_float_clean(arow.get("active_to_cvap_pct")), 2),
            "irs_inflow_returns": str(in_ret) if has_irs else "",
            "irs_outflow_returns": str(out_ret) if has_irs else "",
            "irs_net_returns": fmt_int(net_ret),
            "irs_inflow_individuals": str(in_ind) if has_irs else "",
            "irs_outflow_individuals": str(out_ind) if has_irs else "",
            "irs_net_individuals": fmt_int(net_ind),
            "irs_inflow_agi_thousands": str(in_agi) if has_irs else "",
            "irs_outflow_agi_thousands": str(out_agi) if has_irs else "",
            "irs_net_agi_thousands": fmt_int(net_agi_k),
            "irs_net_agi_millions": fmt_num(net_agi_m, 2),
            "net_domestic_mig_2020_2024": fmt_int(parse_int_clean(arow.get("net_domestic_mig_2020_2024"), allow_negative=True)),
            "fdic_branches_2024": str(br),
            "fdic_unique_banks_2024": str(uniq),
            "fdic_deposits_millions_2024": fmt_num(dep_m, 2),
            "banking_desert_flag": str(desert),
        })

    with open(fiscal_out_path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fiscal_cols)
        w.writeheader()
        w.writerows(fiscal_rows)
    fiscal_sha = sha256_file(fiscal_out_path)
    print(f"Wrote {len(fiscal_rows):,} rows -> {fiscal_out_path.name} (SHA-256: {fiscal_sha})")

    # Compute verified summary highlights for Pipes editorial curations
    ms_health = [r for r in health_rows if r["state_abbr"] == "MS"]
    nc_health = [r for r in health_rows if r["state_abbr"] == "NC"]
    ms_fisc = [r for r in fiscal_rows if r["state_abbr"] == "MS"]
    nc_fisc = [r for r in fiscal_rows if r["state_abbr"] == "NC"]

    def safe_mean(rows_list: List[Dict[str, str]], col: str) -> float:
        vals = [float(r[col]) for r in rows_list if r.get(col)]
        return round(statistics.mean(vals), 2) if vals else 0.0

    highlights = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "rawSourceSha256": raw_hashes,
        "outputs": {
            "healthCsv": {"filename": health_out_path.name, "rows": len(health_rows), "sha256": health_sha, "bytes": health_out_path.stat().st_size},
            "fiscalCsv": {"filename": fiscal_out_path.name, "rows": len(fiscal_rows), "sha256": fiscal_sha, "bytes": fiscal_out_path.stat().st_size},
        },
        "national": {
            "healthCounties": len(health_rows),
            "hospitalDesertCounties": sum(1 for r in health_rows if r["hospital_desert_flag"] == "1"),
            "totalHhsHospitalsMatched": sum(int(r["hhs_hospitals_count"]) for r in health_rows),
            "meanDisabilityPct": safe_mean(health_rows, "disability_adj_prev"),
            "meanLackTransportPct": safe_mean(health_rows, "lack_transport_adj_prev"),
            "fiscalCounties": len(fiscal_rows),
            "fdicRawBranchRows": fdic_branch_raw_count,
            "fdicMatchedBranches": sum(int(r["fdic_branches_2024"]) for r in fiscal_rows),
            "fdicTotalDepositsMillions": round(sum(float(r["fdic_deposits_millions_2024"]) for r in fiscal_rows if r["fdic_deposits_millions_2024"]), 2),
            "bankingDesertCounties": sum(1 for r in fiscal_rows if r["banking_desert_flag"] == "1"),
        },
        "mississippi": {
            "counties": len(ms_health),
            "hospitalDeserts": sum(1 for r in ms_health if r["hospital_desert_flag"] == "1"),
            "meanDisabilityPct": safe_mean(ms_health, "disability_adj_prev"),
            "meanLackTransportPct": safe_mean(ms_health, "lack_transport_adj_prev"),
            "meanDiabetesPct": safe_mean(ms_health, "diabetes_adj_prev"),
            "fdicBranches": sum(int(r["fdic_branches_2024"]) for r in ms_fisc),
            "fdicDepositsMillions": round(sum(float(r["fdic_deposits_millions_2024"]) for r in ms_fisc if r["fdic_deposits_millions_2024"]), 2),
            "bankingDeserts": sum(1 for r in ms_fisc if r["banking_desert_flag"] == "1"),
            "irsTotalNetReturns": sum(int(r["irs_net_returns"]) for r in ms_fisc if r["irs_net_returns"]),
            "irsTotalNetAgiMillions": round(sum(float(r["irs_net_agi_millions"]) for r in ms_fisc if r["irs_net_agi_millions"]), 2),
            "topHealthBarrier": sorted(ms_health, key=lambda r: float(r["civic_health_barrier_z"] or -99), reverse=True)[:3],
            "topIrsOutflowAgi": sorted([r for r in ms_fisc if r["irs_net_agi_millions"]], key=lambda r: float(r["irs_net_agi_millions"]))[:3],
            "topIrsInflowAgi": sorted([r for r in ms_fisc if r["irs_net_agi_millions"]], key=lambda r: float(r["irs_net_agi_millions"]), reverse=True)[:3],
        },
        "northCarolina": {
            "counties": len(nc_health),
            "hospitalDeserts": sum(1 for r in nc_health if r["hospital_desert_flag"] == "1"),
            "meanDisabilityPct": safe_mean(nc_health, "disability_adj_prev"),
            "meanLackTransportPct": safe_mean(nc_health, "lack_transport_adj_prev"),
            "meanDiabetesPct": safe_mean(nc_health, "diabetes_adj_prev"),
            "fdicBranches": sum(int(r["fdic_branches_2024"]) for r in nc_fisc),
            "fdicDepositsMillions": round(sum(float(r["fdic_deposits_millions_2024"]) for r in nc_fisc if r["fdic_deposits_millions_2024"]), 2),
            "bankingDeserts": sum(1 for r in nc_fisc if r["banking_desert_flag"] == "1"),
            "irsTotalNetReturns": sum(int(r["irs_net_returns"]) for r in nc_fisc if r["irs_net_returns"]),
            "irsTotalNetAgiMillions": round(sum(float(r["irs_net_agi_millions"]) for r in nc_fisc if r["irs_net_agi_millions"]), 2),
            "topHealthBarrier": sorted(nc_health, key=lambda r: float(r["civic_health_barrier_z"] or -99), reverse=True)[:3],
            "topIrsInflowAgi": sorted([r for r in nc_fisc if r["irs_net_agi_millions"]], key=lambda r: float(r["irs_net_agi_millions"]), reverse=True)[:5],
            "topFdicDeposits": sorted(nc_fisc, key=lambda r: float(r["fdic_deposits_millions_2024"] or 0), reverse=True)[:3],
        },
        "topUsIrsInflow": sorted([r for r in fiscal_rows if r["irs_net_agi_millions"]], key=lambda r: float(r["irs_net_agi_millions"]), reverse=True)[:5],
        "topUsIrsOutflow": sorted([r for r in fiscal_rows if r["irs_net_agi_millions"]], key=lambda r: float(r["irs_net_agi_millions"]))[:5],
    }

    highlights_path = CACHE_DIR / "verified_highlights.json"
    highlights_path.write_text(json.dumps(highlights, indent=2), encoding="utf-8")
    print(f"\nVerified Highlights written to {highlights_path}")
    print(json.dumps({k: v for k, v in highlights.items() if k != "rawSourceSha256"}, indent=2)[:2500])


if __name__ == "__main__":
    main()
