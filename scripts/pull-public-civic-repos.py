#!/usr/bin/env python3
"""
Marigold Public Civic Data Repository Ingestor (Zero-PII, Deterministic)
========================================================================
Downloads and cross-joins five keyless, public-domain / CC0 federal and
academic civic datasets by 5-digit county FIPS alongside Marigold's 2026
Mississippi (82 counties) and North Carolina (100 counties) Zero-PII audits.

Outputs inside `public/datasets/civic/`:
  1. us_county_election_admin_cvap_2024.csv
  2. ms_nc_audit_vs_federal_benchmarks_2026.csv
  3. fema_county_election_continuity_2020_2026.csv
  4. manifest.json
"""

from __future__ import annotations

import csv
import hashlib
import io
import json
import os
import re
import urllib.parse
import urllib.request
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "datasets" / "civic"
MS_AUDIT_PATH = ROOT / "src" / "data" / "mississippi_audit_results.json"
NC_AUDIT_PATH = ROOT / "src" / "data" / "north_carolina_audit_results.json"

UA = {"User-Agent": "Mozilla/5.0 (MarigoldCivicAudits/2.0; +https://marigoldinsights.org)"}

EAVS_2024_URL = (
    "https://www.eac.gov/sites/default/files/2026-02/"
    "2024_EAVS_for_Public_Release_nolabel_V2_csv.zip"
)
CVAP_2024_URL = (
    "https://www2.census.gov/programs-surveys/decennial/rdo/datasets/2024/"
    "2024-cvap/CVAP_2020-2024_ACS_csv_files.zip"
)
POPEST_2024_URL = (
    "https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/"
    "counties/totals/co-est2024-alldata.csv"
)
TONMCG_2024_URL = (
    "https://raw.githubusercontent.com/tonmcg/US_County_Level_Election_Results_08-24/"
    "master/2024_US_County_Level_Presidential_Results.csv"
)
TONMCG_2020_URL = (
    "https://raw.githubusercontent.com/tonmcg/US_County_Level_Election_Results_08-24/"
    "master/2020_US_County_Level_Presidential_Results.csv"
)
TONMCG_2016_URL = (
    "https://raw.githubusercontent.com/tonmcg/US_County_Level_Election_Results_08-24/"
    "master/2016_US_County_Level_Presidential_Results.csv"
)
MEDSL_2024_STATE_URL = (
    "https://raw.githubusercontent.com/MEDSL/2024-elections-official/"
    "main/2024-president-state.csv"
)
OPENFEMA_BASE_URL = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries"


def fetch_bytes(url: str, timeout: int = 45) -> Tuple[bytes, str]:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read()
    return data, hashlib.sha256(data).hexdigest()


def parse_nonneg_int(val: Any) -> Optional[int]:
    """Parse non-negative integers; convert EAVS sentinels (-99, -88, -77) to None."""
    if val is None:
        return None
    s = str(val).strip().replace(",", "")
    if not s or s.lower() in {"na", "nan", "null", "none", "."}:
        return None
    try:
        num = int(float(s))
        return num if num >= 0 else None
    except ValueError:
        return None


def norm_county_key(name: str) -> str:
    s = (name or "").upper().strip()
    s = re.sub(
        r"\s+(COUNTY|PARISH|BOROUGH|CENSUS AREA|MUNICIPALITY|CITY AND BOROUGH|CITY)$",
        "",
        s,
    )
    s = re.sub(r"[^A-Z0-9]", "", s)
    return s


def pct(num: Optional[int], den: Optional[int]) -> str:
    if num is None or den is None or den <= 0:
        return ""
    return f"{(num / den) * 100.0:.2f}"


def pct_delta(new_val: Optional[int], old_val: Optional[int]) -> str:
    if new_val is None or old_val is None or old_val <= 0:
        return ""
    return f"{((new_val - old_val) / old_val) * 100.0:.2f}"


def load_census_cvap() -> Tuple[Dict[str, Dict[str, Any]], str]:
    print("1/5 Downloading Census 2020-2024 ACS CVAP Special Tabulation...")
    raw_zip, digest = fetch_bytes(CVAP_2024_URL, timeout=60)
    zf = zipfile.ZipFile(io.BytesIO(raw_zip))
    county_member = next(n for n in zf.namelist() if n.lower().endswith("county.csv"))
    text = zf.read(county_member).decode("latin-1", errors="replace")
    reader = csv.DictReader(io.StringIO(text))

    out: Dict[str, Dict[str, Any]] = {}
    for row in reader:
        if str(row.get("lnnumber", "")).strip() != "1":
            continue
        geoid = str(row.get("geoid", "")).strip()
        if "US" not in geoid:
            continue
        fips = geoid.split("US")[-1].zfill(5)
        if len(fips) != 5 or not fips.isdigit():
            continue
        geoname = str(row.get("geoname", "")).strip()
        parts = [p.strip() for p in geoname.split(",")]
        county_name = parts[0] if parts else geoname
        state_name = parts[-1] if len(parts) > 1 else ""
        out[fips] = {
            "county_fips": fips,
            "county_name": county_name,
            "state_name": state_name,
            "tot_est": parse_nonneg_int(row.get("tot_est")) or 0,
            "adu_est": parse_nonneg_int(row.get("adu_est")) or 0,
            "cit_est": parse_nonneg_int(row.get("cit_est")) or 0,
            "cvap_est": parse_nonneg_int(row.get("cvap_est")) or 0,
            "cvap_moe": parse_nonneg_int(row.get("cvap_moe")) or 0,
        }
    print(f"    -> Parsed {len(out)} counties from Census CVAP.")
    return out, digest


def load_census_popest() -> Tuple[Dict[str, Dict[str, Any]], str]:
    print("2/5 Downloading Census 2020-2024 County Population Estimates (Deaths & Migration)...")
    raw_bytes, digest = fetch_bytes(POPEST_2024_URL, timeout=45)
    text = raw_bytes.decode("latin-1", errors="replace")
    reader = csv.DictReader(io.StringIO(text))

    out: Dict[str, Dict[str, Any]] = {}
    for row in reader:
        if str(row.get("SUMLEV", "")).strip() != "050":
            continue
        fips = f"{str(row.get('STATE', '')).zfill(2)}{str(row.get('COUNTY', '')).zfill(3)}"
        deaths = sum(
            int(float(row.get(col) or 0))
            for col in ("DEATHS2020", "DEATHS2021", "DEATHS2022", "DEATHS2023", "DEATHS2024")
        )
        net_mig = sum(
            int(float(row.get(col) or 0))
            for col in (
                "DOMESTICMIG2020",
                "DOMESTICMIG2021",
                "DOMESTICMIG2022",
                "DOMESTICMIG2023",
                "DOMESTICMIG2024",
            )
        )
        out[fips] = {
            "state_name": str(row.get("STNAME", "")).strip(),
            "county_name": str(row.get("CTYNAME", "")).strip(),
            "pop_2024": parse_nonneg_int(row.get("POPESTIMATE2024")) or 0,
            "deaths_2020_2024": max(0, deaths),
            "net_domestic_mig_2020_2024": net_mig,
        }
    print(f"    -> Parsed {len(out)} counties from Census PopEst.")
    return out, digest


def load_eavs_2024(cvap: Dict[str, Dict[str, Any]]) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, int], str]:
    print("3/5 Downloading U.S. EAC 2024 EAVS V2.0 (Feb 2026 release)...")
    raw_zip, digest = fetch_bytes(EAVS_2024_URL, timeout=60)
    zf = zipfile.ZipFile(io.BytesIO(raw_zip))
    csv_member = next(n for n in zf.namelist() if n.lower().endswith(".csv"))
    text = zf.read(csv_member).decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(text))

    # Build normalized WI county lookup (`55xxx`) since EAVS uses municipal codes + "- <COUNTY> COUNTY"
    wi_county_by_norm: Dict[str, str] = {}
    for fips_code, info in cvap.items():
        if fips_code.startswith("55"):
            wi_county_by_norm[norm_county_key(info["county_name"])] = fips_code

    # States with 1-digit leading FIPS prefixes where spreadsheets sometimes strip leading zero (9-digit FIPSCode)
    single_digit_prefix_states = {"AL", "AK", "AZ", "AR", "CA", "CO", "CT"}

    fields = (
        ("A1a", "eavs_total_registered"),
        ("A1b", "eavs_active_voters"),
        ("A1c", "eavs_inactive_voters"),
        ("A10a", "eavs_confirmation_notices"),
        ("A12a", "eavs_removals_total"),
        ("C1a", "eavs_mail_transmitted"),
        ("C1c", "eavs_mail_undeliverable"),
        ("E1a", "eavs_provisional_cast"),
        ("E1d", "eavs_provisional_rejected"),
        ("F1a", "eavs_turnout_2024"),
    )

    by_fips: Dict[str, Dict[str, Any]] = {}
    jurisdiction_count = 0
    subcounty_rolled = 0

    for row in reader:
        jurisdiction_count += 1
        raw_fips = str(row.get("FIPSCode", "")).strip()
        state_abbr = str(row.get("State_Abbr", "")).strip().upper()
        state_full = str(row.get("State_Full", "")).strip().title()
        jur_name = str(row.get("Jurisdiction_Name", "")).strip()

        fips = ""
        if state_abbr == "WI" and " - " in jur_name:
            cnty_part = jur_name.split(" - ")[-1].strip()
            fips = wi_county_by_norm.get(norm_county_key(cnty_part), "")
        if not fips:
            if not raw_fips.isdigit():
                continue
            if len(raw_fips) == 9 and state_abbr in single_digit_prefix_states:
                raw_fips = "0" + raw_fips
            elif len(raw_fips) < 10 and raw_fips.isdigit():
                raw_fips = raw_fips.zfill(10)
            fips = raw_fips[:5]

        if len(fips) != 5 or not fips.isdigit():
            continue

        if fips not in by_fips:
            by_fips[fips] = {
                "state_abbr": state_abbr,
                "state_name": state_full,
                "jurisdiction_name": jur_name.title(),
                "sub_units": 0,
                **{dest: 0 for _, dest in fields},
            }
        else:
            subcounty_rolled += 1

        entry = by_fips[fips]
        entry["sub_units"] += 1
        for src_col, dest_col in fields:
            val = parse_nonneg_int(row.get(src_col))
            if val is not None:
                entry[dest_col] += val

    stats = {
        "rawJurisdictions": jurisdiction_count,
        "countyFipsCount": len(by_fips),
        "subCountyUnitsAggregated": subcounty_rolled,
    }
    print(f"    -> Aggregated {jurisdiction_count} EAVS jurisdictions into {len(by_fips)} county FIPS rows.")
    return by_fips, stats, digest


def load_election_returns() -> Tuple[Dict[str, Dict[str, Optional[int]]], Dict[str, int], Dict[str, str]]:
    print("4/5 Downloading tonmcg County Returns (2016/2020/2024) + MEDSL 2024 State Totals...")
    by_fips: Dict[str, Dict[str, Optional[int]]] = defaultdict(
        lambda: {"votes_2016": None, "votes_2020": None, "votes_2024": None}
    )
    digests: Dict[str, str] = {}

    for year_key, url in (
        ("votes_2016", TONMCG_2016_URL),
        ("votes_2020", TONMCG_2020_URL),
        ("votes_2024", TONMCG_2024_URL),
    ):
        raw_bytes, dig = fetch_bytes(url, timeout=30)
        digests[year_key] = dig
        reader = csv.DictReader(io.StringIO(raw_bytes.decode("utf-8", errors="replace")))
        for row in reader:
            raw_fips = str(row.get("county_fips") or row.get("combined_fips") or "").strip()
            if "." in raw_fips:
                raw_fips = raw_fips.split(".")[0]
            if not raw_fips.isdigit():
                continue
            fips = raw_fips.zfill(5)
            tv = parse_nonneg_int(row.get("total_votes"))
            if tv is not None:
                prev = by_fips[fips][year_key] or 0
                by_fips[fips][year_key] = prev + tv

    # Also verify state totals via MEDSL 2024-elections-official
    medsl_bytes, medsl_dig = fetch_bytes(MEDSL_2024_STATE_URL, timeout=30)
    digests["medsl_2024_state"] = medsl_dig
    medsl_state_totals: Dict[str, int] = defaultdict(int)
    reader = csv.DictReader(io.StringIO(medsl_bytes.decode("utf-8", errors="replace")))
    for row in reader:
        st = str(row.get("state_po", "")).strip().upper()
        votes = parse_nonneg_int(row.get("votes")) or 0
        # Handle MEDSL total/mode summing cleanly without double-counting TOTAL rows
        mode = str(row.get("mode", "")).strip().upper()
        if st:
            if mode == "TOTAL" or not mode:
                medsl_state_totals[st] += votes
    # Fallback sum if a state has no TOTAL mode row
    if not medsl_state_totals:
        reader = csv.DictReader(io.StringIO(medsl_bytes.decode("utf-8", errors="replace")))
        for row in reader:
            st = str(row.get("state_po", "")).strip().upper()
            votes = parse_nonneg_int(row.get("votes")) or 0
            if st:
                medsl_state_totals[st] += votes

    print(f"    -> Parsed election returns for {len(by_fips)} county FIPS rows.")
    return by_fips, dict(medsl_state_totals), digests


def load_openfema_disasters() -> Tuple[Dict[str, Dict[str, Any]], int, str]:
    print("5/5 Downloading OpenFEMA DisasterDeclarationsSummaries v2 (2020-2026)...")
    by_fips: Dict[str, Dict[str, Any]] = {}
    all_pages_hash = hashlib.sha256()
    skip = 0
    page_size = 1000
    total_records = 0

    while True:
        params = urllib.parse.urlencode(
            {
                "$filter": "declarationDate ge '2020-01-01T00:00:00.000z'",
                "$select": "disasterNumber,state,fipsStateCode,fipsCountyCode,designatedArea,incidentType,declarationTitle,declarationDate",
                "$orderby": "declarationDate desc,disasterNumber desc",
                "$top": str(page_size),
                "$skip": str(skip),
            }
        )
        url = f"{OPENFEMA_BASE_URL}?{params}"
        raw_bytes, _ = fetch_bytes(url, timeout=45)
        all_pages_hash.update(raw_bytes)
        payload = json.loads(raw_bytes.decode("utf-8"))
        rows = payload.get("DisasterDeclarationsSummaries", [])
        if not rows:
            break
        total_records += len(rows)

        for r in rows:
            st_code = str(r.get("fipsStateCode", "")).strip().zfill(2)
            cnty_code = str(r.get("fipsCountyCode", "")).strip().zfill(3)
            if cnty_code == "000" or not st_code.isdigit() or not cnty_code.isdigit():
                continue
            fips = st_code + cnty_code
            dnum = str(r.get("disasterNumber", ""))
            decl_date = str(r.get("declarationDate", ""))[:10]
            incident = str(r.get("incidentType", "")).strip()
            title = str(r.get("declarationTitle", "")).strip()
            state_abbr = str(r.get("state", "")).strip().upper()
            area = re.sub(r"\s*\((County|Parish|Borough)\)$", "", str(r.get("designatedArea", "")).strip(), flags=re.I)

            if fips not in by_fips:
                by_fips[fips] = {
                    "state_abbr": state_abbr,
                    "county_name": area,
                    "disaster_numbers": set(),
                    "disaster_2024_numbers": set(),
                    "helene_nc_flag": False,
                    "latest_date": "",
                    "latest_incident": "",
                    "latest_title": "",
                }

            entry = by_fips[fips]
            if dnum:
                entry["disaster_numbers"].add(dnum)
                if decl_date.startswith("2024-"):
                    entry["disaster_2024_numbers"].add(dnum)
                if dnum == "4827" and state_abbr == "NC":
                    entry["helene_nc_flag"] = True

            if decl_date >= entry["latest_date"]:
                entry["latest_date"] = decl_date
                entry["latest_incident"] = incident
                entry["latest_title"] = title

        if len(rows) < page_size:
            break
        skip += page_size

    print(f"    -> Fetched {total_records} OpenFEMA declaration rows across {len(by_fips)} county FIPS.")
    return by_fips, total_records, all_pages_hash.hexdigest()


def build_state_abbr_lookup(eavs: Dict[str, Dict[str, Any]], fema: Dict[str, Dict[str, Any]]) -> Dict[str, str]:
    state_map: Dict[str, str] = {}
    for fips, row in eavs.items():
        if row.get("state_abbr"):
            state_map[fips[:2]] = row["state_abbr"]
    for fips, row in fema.items():
        if row.get("state_abbr") and fips[:2] not in state_map:
            state_map[fips[:2]] = row["state_abbr"]
    # Explicit fallbacks for 50 states + DC
    fallback = {
        "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT",
        "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL",
        "18": "IN", "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD",
        "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT", "31": "NE",
        "32": "NV", "33": "NH", "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
        "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
        "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA", "54": "WV",
        "55": "WI", "56": "WY",
    }
    for k, v in fallback.items():
        state_map.setdefault(k, v)
    return state_map


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    cvap, cvap_sha = load_census_cvap()
    popest, popest_sha = load_census_popest()
    eavs, eavs_stats, eavs_sha = load_eavs_2024(cvap)
    returns, medsl_state_totals, returns_shas = load_election_returns()
    fema, fema_raw_rows, fema_sha = load_openfema_disasters()

    state_abbr_by_prefix = build_state_abbr_lookup(eavs, fema)

    # Universe of 5-digit county FIPS (all 50 states + DC from CVAP)
    all_fips = sorted(f for f in cvap.keys() if f[:2] in state_abbr_by_prefix)

    # ------------------------------------------------------------------
    # CSV 1: us_county_election_admin_cvap_2024.csv
    # ------------------------------------------------------------------
    us_path = OUT_DIR / "us_county_election_admin_cvap_2024.csv"
    us_headers = [
        "county_fips", "state_abbr", "state_name", "county_name",
        "pop_2024", "adult_vap_2024", "cvap_2024", "cvap_moe_90",
        "deaths_2020_2024", "net_domestic_mig_2020_2024",
        "eavs_total_registered", "eavs_active_voters", "eavs_inactive_voters",
        "active_to_cvap_pct", "total_reg_to_cvap_pct",
        "eavs_confirmation_notices", "eavs_removals_total",
        "eavs_mail_transmitted", "eavs_mail_undeliverable",
        "eavs_provisional_cast", "eavs_provisional_rejected", "eavs_turnout_2024",
        "certified_votes_2016", "certified_votes_2020", "certified_votes_2024",
        "turnout_to_cvap_pct", "fema_disasters_2020_2026", "fema_latest_incident",
    ]

    nat_totals = defaultdict(int)
    us_rows_written = 0
    with open(us_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(us_headers)
        for fips in all_fips:
            c = cvap[fips]
            p = popest.get(fips, {})
            e = eavs.get(fips, {})
            r = returns.get(fips, {})
            fm = fema.get(fips, {})

            st_abbr = e.get("state_abbr") or state_abbr_by_prefix.get(fips[:2], "")
            st_name = p.get("state_name") or c.get("state_name") or ""
            cnty_name = p.get("county_name") or c.get("county_name") or ""

            pop24 = p.get("pop_2024") if p.get("pop_2024") else c["tot_est"]
            adu = c["adu_est"]
            cvap_est = c["cvap_est"]
            cvap_moe = c["cvap_moe"]
            deaths = p.get("deaths_2020_2024", 0)
            mig = p.get("net_domestic_mig_2020_2024", 0)

            reg_tot = e.get("eavs_total_registered")
            reg_act = e.get("eavs_active_voters")
            reg_inact = e.get("eavs_inactive_voters")
            notices = e.get("eavs_confirmation_notices")
            removals = e.get("eavs_removals_total")
            mail_tx = e.get("eavs_mail_transmitted")
            mail_undel = e.get("eavs_mail_undeliverable")
            prov_cast = e.get("eavs_provisional_cast")
            prov_rej = e.get("eavs_provisional_rejected")
            eavs_to = e.get("eavs_turnout_2024")

            v16 = r.get("votes_2016")
            v20 = r.get("votes_2020")
            v24 = r.get("votes_2024")
            disasters = len(fm.get("disaster_numbers", set()))
            latest_inc = fm.get("latest_incident", "")

            if st_abbr != "PR":
                nat_totals["cvap_2024"] += cvap_est
                nat_totals["eavs_total_registered"] += reg_tot or 0
                nat_totals["eavs_active_voters"] += reg_act or 0
                nat_totals["eavs_inactive_voters"] += reg_inact or 0
                nat_totals["eavs_confirmation_notices"] += notices or 0
                nat_totals["eavs_removals_total"] += removals or 0
                nat_totals["eavs_mail_transmitted"] += mail_tx or 0
                nat_totals["eavs_mail_undeliverable"] += mail_undel or 0
                nat_totals["eavs_provisional_cast"] += prov_cast or 0
                nat_totals["eavs_provisional_rejected"] += prov_rej or 0
                nat_totals["certified_votes_2024"] += v24 or 0
                nat_totals["certified_votes_2020"] += v20 or 0
                nat_totals["deaths_2020_2024"] += deaths or 0

            w.writerow([
                fips, st_abbr, st_name, cnty_name,
                pop24, adu, cvap_est, cvap_moe,
                deaths, mig,
                "" if reg_tot is None else reg_tot,
                "" if reg_act is None else reg_act,
                "" if reg_inact is None else reg_inact,
                pct(reg_act, cvap_est),
                pct(reg_tot, cvap_est),
                "" if notices is None else notices,
                "" if removals is None else removals,
                "" if mail_tx is None else mail_tx,
                "" if mail_undel is None else mail_undel,
                "" if prov_cast is None else prov_cast,
                "" if prov_rej is None else prov_rej,
                "" if eavs_to is None else eavs_to,
                "" if v16 is None else v16,
                "" if v20 is None else v20,
                "" if v24 is None else v24,
                pct(v24, cvap_est),
                disasters,
                latest_inc,
            ])
            us_rows_written += 1

    # ------------------------------------------------------------------
    # CSV 2: ms_nc_audit_vs_federal_benchmarks_2026.csv
    # ------------------------------------------------------------------
    ms_audit = json.loads(MS_AUDIT_PATH.read_text(encoding="utf-8"))
    nc_audit = json.loads(NC_AUDIT_PATH.read_text(encoding="utf-8"))

    # Lookup Census FIPS by (prefix, norm_county_key)
    fips_by_state_county: Dict[Tuple[str, str], str] = {}
    for fips, c in cvap.items():
        prefix = fips[:2]
        if prefix in {"28", "37"}:
            fips_by_state_county[(prefix, norm_county_key(c["county_name"]))] = fips

    ms_nc_path = OUT_DIR / "ms_nc_audit_vs_federal_benchmarks_2026.csv"
    ms_nc_headers = [
        "county_fips", "state_abbr", "county_name",
        "marigold_total_reg_2026", "marigold_active_2026", "marigold_inactive_2026",
        "marigold_new_reg_2026", "marigold_priority_score", "marigold_cleanliness_score",
        "marigold_high_density_8plus", "marigold_out_of_state_mail", "marigold_same_zip_dups",
        "marigold_large_precincts_3k",
        "cvap_2024", "cvap_moe_90", "marigold_active_to_cvap_pct", "marigold_total_to_cvap_pct",
        "cvap_upper_bound_90", "exceeds_cvap_moe_flag",
        "deaths_2020_2024", "net_domestic_mig_2020_2024",
        "eavs_2024_notices", "eavs_2024_removals",
        "certified_votes_2020", "certified_votes_2024", "marigold_2024_ballot_credits",
        "fema_disasters_2020_2026", "fema_helene_nc_flag",
    ]

    ms_nc_summary: Dict[str, Any] = {
        "MS": {"counties": 0, "cvap_2024": 0, "marigold_active_2026": 0, "marigold_total_reg_2026": 0, "eavs_2024_notices": 0, "eavs_2024_removals": 0, "exceeds_moe_count": 0},
        "NC": {"counties": 0, "cvap_2024": 0, "marigold_active_2026": 0, "marigold_total_reg_2026": 0, "eavs_2024_notices": 0, "eavs_2024_removals": 0, "exceeds_moe_count": 0, "helene_counties": 0, "helene_votes_2020": 0, "helene_votes_2024": 0},
    }

    ms_nc_rows_written = 0
    with open(ms_nc_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(ms_nc_headers)
        for st_abbr, st_prefix, audit_data in (
            ("MS", "28", ms_audit),
            ("NC", "37", nc_audit),
        ):
            vectors = audit_data["threatManifold"]["countyVectors"]
            for cv in vectors:
                cname = str(cv["county"]).strip()
                fips = fips_by_state_county.get((st_prefix, norm_county_key(cname)))
                if not fips:
                    raise RuntimeError(f"Unmatched {st_abbr} county name: {cname}")
                c = cvap[fips]
                p = popest[fips]
                e = eavs.get(fips, {})
                r = returns.get(fips, {})
                fm = fema.get(fips, {})

                m_tot = int(cv.get("total", 0))
                m_act = int(cv.get("active", 0))
                m_inact = int(cv.get("inactive", 0))
                m_new26 = int(cv.get("registrations2026", 0))
                m_prio = round(float(cv.get("manifoldZ", 0.0)), 2)
                m_clean = round(float(cv.get("cleanlinessScore", 0.0)), 1)
                m_hd = int(cv.get("highDensityCount", 0))
                m_ncoa = int(cv.get("ncoaCount", 0))
                m_dups = int(cv.get("duplicateCount", 0))
                m_prec = int(cv.get("overCapacityPrecincts", 0))
                m_v24_credits = int(cv.get("votes2024General", 0))

                cvap_est = c["cvap_est"]
                cvap_moe = c["cvap_moe"]
                upper_bound = cvap_est + cvap_moe
                exceeds_moe = m_act > upper_bound

                notices = e.get("eavs_confirmation_notices", 0)
                removals = e.get("eavs_removals_total", 0)
                v20 = r.get("votes_2020") or 0
                v24 = r.get("votes_2024") or 0
                disasters = len(fm.get("disaster_numbers", set()))
                helene = bool(fm.get("helene_nc_flag", False))

                s = ms_nc_summary[st_abbr]
                s["counties"] += 1
                s["cvap_2024"] += cvap_est
                s["marigold_active_2026"] += m_act
                s["marigold_total_reg_2026"] += m_tot
                s["eavs_2024_notices"] += notices
                s["eavs_2024_removals"] += removals
                if exceeds_moe:
                    s["exceeds_moe_count"] += 1
                if st_abbr == "NC" and helene:
                    s["helene_counties"] += 1
                    s["helene_votes_2020"] += v20
                    s["helene_votes_2024"] += v24

                w.writerow([
                    fips, st_abbr, cname,
                    m_tot, m_act, m_inact, m_new26, m_prio, m_clean,
                    m_hd, m_ncoa, m_dups, m_prec,
                    cvap_est, cvap_moe,
                    pct(m_act, cvap_est), pct(m_tot, cvap_est),
                    upper_bound, "YES" if exceeds_moe else "NO",
                    p.get("deaths_2020_2024", 0), p.get("net_domestic_mig_2020_2024", 0),
                    notices, removals,
                    v20, v24, m_v24_credits,
                    disasters, "YES" if helene else "NO",
                ])
                ms_nc_rows_written += 1

    # ------------------------------------------------------------------
    # CSV 3: fema_county_election_continuity_2020_2026.csv
    # ------------------------------------------------------------------
    fema_path = OUT_DIR / "fema_county_election_continuity_2020_2026.csv"
    fema_headers = [
        "county_fips", "state_abbr", "county_name",
        "fema_disasters_2020_2026", "fema_2024_election_year_disasters",
        "fema_latest_incident", "fema_latest_title",
        "cvap_2024", "certified_votes_2020", "certified_votes_2024",
        "turnout_change_2020_to_2024_pct",
        "eavs_mail_transmitted", "eavs_mail_undeliverable", "eavs_provisional_cast",
    ]
    fema_sortable = []
    for fips, fm in fema.items():
        if fips not in cvap:
            continue
        dis_cnt = len(fm["disaster_numbers"])
        if dis_cnt < 1:
            continue
        dis_24 = len(fm["disaster_2024_numbers"])
        c = cvap[fips]
        e = eavs.get(fips, {})
        r = returns.get(fips, {})
        v20 = r.get("votes_2020")
        v24 = r.get("votes_2024")
        fema_sortable.append((
            (-dis_24, -dis_cnt, fips),
            [
                fips,
                fm["state_abbr"] or state_abbr_by_prefix.get(fips[:2], ""),
                c["county_name"],
                dis_cnt,
                dis_24,
                fm["latest_incident"],
                fm["latest_title"],
                c["cvap_est"],
                "" if v20 is None else v20,
                "" if v24 is None else v24,
                pct_delta(v24, v20),
                e.get("eavs_mail_transmitted", ""),
                e.get("eavs_mail_undeliverable", ""),
                e.get("eavs_provisional_cast", ""),
            ],
        ))
    fema_sortable.sort(key=lambda x: x[0])

    with open(fema_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(fema_headers)
        for _, row_vals in fema_sortable:
            w.writerow(row_vals)

    # ------------------------------------------------------------------
    # Manifest with SHA-256 verification and empirical summary stats
    # ------------------------------------------------------------------
    def file_meta(path: Path) -> Dict[str, Any]:
        raw = path.read_bytes()
        lines = raw.decode("utf-8").splitlines()
        return {
            "filename": path.name,
            "publicPath": f"/datasets/civic/{path.name}",
            "bytes": len(raw),
            "rows": max(0, len(lines) - 1),
            "sha256": hashlib.sha256(raw).hexdigest(),
            "columns": lines[0].split(",") if lines else [],
        }

    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "zeroPiiCompliant": True,
        "privacyRule": "County-level aggregate public records only; zero voter names, birth dates, voter IDs, or street addresses.",
        "upstreamSources": [
            {
                "id": "eac-eavs-2024-v2",
                "name": "U.S. Election Assistance Commission 2024 EAVS V2.0 (Feb 2026)",
                "url": EAVS_2024_URL,
                "sha256": eavs_sha,
                "license": "17 U.S.C. 105 Federal Public Domain",
                "stats": eavs_stats,
            },
            {
                "id": "census-cvap-2020-2024",
                "name": "U.S. Census Bureau 2020-2024 ACS CVAP Special Tabulation",
                "url": CVAP_2024_URL,
                "sha256": cvap_sha,
                "license": "17 U.S.C. 105 Federal Public Domain",
            },
            {
                "id": "census-popest-2024",
                "name": "U.S. Census Bureau 2020-2024 County Population Estimates (Deaths & Domestic Migration)",
                "url": POPEST_2024_URL,
                "sha256": popest_sha,
                "license": "17 U.S.C. 105 Federal Public Domain",
            },
            {
                "id": "medsl-tonmcg-returns-2016-2024",
                "name": "MEDSL & tonmcg County Presidential Election Returns (2016-2024)",
                "url": TONMCG_2024_URL,
                "sha256": returns_shas,
                "license": "CC0 / Open Academic Public Data",
            },
            {
                "id": "openfema-disasters-2020-2026",
                "name": "OpenFEMA DisasterDeclarationsSummaries v2 (2020-2026)",
                "url": OPENFEMA_BASE_URL,
                "sha256": fema_sha,
                "rawRecordsFetched": fema_raw_rows,
                "license": "17 U.S.C. 105 Federal Public Domain",
            },
        ],
        "datasets": {
            "usCountyAtlas": file_meta(us_path),
            "msNcBenchmarks": file_meta(ms_nc_path),
            "femaContinuity": file_meta(fema_path),
        },
        "empiricalHighlights": {
            "national": dict(nat_totals),
            "msNcComparison": ms_nc_summary,
            "medsl2024StateTotalsSample": {
                "MS": medsl_state_totals.get("MS", 0),
                "NC": medsl_state_totals.get("NC", 0),
            },
        },
    }

    manifest_path = OUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(
        f"\nDONE! Wrote {us_rows_written} US counties, {ms_nc_rows_written} MS/NC counties, "
        f"and {len(fema_sortable)} FEMA disaster counties to {OUT_DIR}"
    )
    print("Empirical Highlights:", json.dumps(manifest["empiricalHighlights"], indent=2))


if __name__ == "__main__":
    main()
