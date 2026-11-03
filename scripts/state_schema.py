"""Header-driven column resolution so the pipeline works for any state's voter file.

Every playbook script reads rows in a fixed *canonical* order (the Mississippi SEMS
layout). `canonical_reader` resolves each canonical field by header name/synonym
(case/punctuation-insensitive), then yields rows re-ordered into canonical positions.
Missing optional fields come back as "". Missing required fields raise immediately,
so a new state's file can never be silently mis-mapped.

Add a state by appending synonyms below — no index edits elsewhere.
"""
import csv
import re

def _norm(h: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (h or "").lstrip("\ufeff").lower())

# Canonical voter-roll layout: position -> (field, required, synonyms)
VOTER_FIELDS = [
    ("voter_id", True, ["mappingvalue", "voterid", "sosvoterid", "voterregistrationnumber", "registrationnumber", "statevoterid", "regnum", "voterregnum", "ncid", "sosid"]),
    ("first_name", True, ["firstname", "fname", "namefirst", "voterfirstname"]),
    ("middle_name", False, ["middlename", "mname", "middle", "namemiddle"]),
    ("last_name", True, ["lastname", "lname", "namelast", "surname", "voterlastname"]),
    ("suffix", False, ["suffix", "namesuffix", "suffixname", "generation"]),
    ("res_address", True, ["residentialaddress", "residenceaddress", "resaddress", "streetaddress", "resstreetaddress", "address1", "address"]),
    ("house_num", False, ["housenum", "housenumber", "reshousenum"]),
    ("street_name", False, ["streetname", "resstreetname"]),
    ("street_type", False, ["streettype", "resstreettype"]),
    ("pre_dir", False, ["predirection", "predir"]),
    ("post_dir", False, ["postdirection", "postdir"]),
    ("res_city", True, ["rescity", "residentialcity", "residencecity", "city"]),
    ("res_state", False, ["resstate", "residentialstate", "state"]),
    ("res_zip", True, ["reszipcode", "reszip", "residentialzip", "zipcode", "zip", "zip5"]),
    ("county", True, ["rescounty", "countyname", "county", "countydesc", "cntydesc"]),
    ("precinct_code", False, ["precinctcode", "precinctid", "pctcode", "precinct"]),
    ("precinct_name", False, ["precinctname", "pctname", "precinctdesc"]),
    ("mail_address", False, ["mailingaddress", "mailaddress", "mailaddr1", "mailingaddress1"]),
    ("mail_city", False, ["mailcity", "mailingcity"]),
    ("mail_state", False, ["mailstate", "mailingstate"]),
    ("mail_zip", False, ["mailzipcode", "mailzip", "mailingzip", "mailingzipcode"]),
    ("reg_date", False, ["effectiveregndate", "registrationdate", "regdate", "dateregistered", "effectivedate"]),
    ("status", True, ["status", "voterstatus", "statuscode", "registrationstatus"]),
    ("date_voted", False, ["datevoted", "lastvoted", "lastvoteddate", "voteddate"]),
]

HISTORY_FIELDS = [
    ("voter_id", True, ["mappingvalue", "voterid", "sosvoterid", "voterregistrationnumber", "statevoterid", "ncid", "sosid"]),
    ("_1", False, []), ("_2", False, []), ("_3", False, []), ("_4", False, []),
    ("election_name", False, ["electionname", "electiondesc", "electiondescription"]),
    ("election_type", False, ["electiontype"]),
    ("election_date", True, ["electiondate", "electiondt", "dateofelection"]),
    ("party", False, ["politicalparty", "party", "votedparty", "partycd"]),
]

# Status values normalised to the canonical "Active"/"Inactive" used downstream.
STATUS_MAP = {"A": "Active", "ACTIVE": "Active", "ACT": "Active",
              "I": "Inactive", "INACTIVE": "Inactive", "INA": "Inactive"}


def resolve(headers, fields):
    norm = [_norm(h) for h in headers]
    idx, used, missing = [], set(), []
    for name, required, syns in fields:
        found = None
        for s in syns:
            for i, h in enumerate(norm):
                if h == s and i not in used:
                    found = i
                    break
            if found is not None:
                break
        if found is not None:
            used.add(found)
        elif required:
            missing.append(name)
        idx.append(found)
    if missing:
        raise ValueError(f"Required columns not found: {missing}. Headers: {headers}")
    return idx


def canonical_reader(fh, fields):
    """Yield (canonical_headers, row) with rows re-ordered into canonical positions."""
    r = csv.reader(fh)
    headers = next(r)
    idx = resolve(headers, fields)
    status_pos = next((p for p, f in enumerate(fields) if f[0] == "status"), None)
    for raw in r:
        n = len(raw)
        row = [raw[i] if i is not None and i < n else "" for i in idx]
        if status_pos is not None:
            s = row[status_pos].strip().upper()
            row[status_pos] = STATUS_MAP.get(s, row[status_pos].strip())
        yield row
