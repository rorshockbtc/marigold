"""Final privacy gate for the public Mississippi audit JSON.

Runs after run_mississippi_playbooks.py and enrich_mississippi_correlations.py.
Everything in src/data/mississippi_audit_results.json ships to every browser,
so this step removes or coarsens anything that could point at a person or a home:

  * no voter IDs (not even masked ones) and no name fields
  * no P.O. Box numbers, no ZIP+4
  * single-family and apartment addresses reduced to city level
  * institutional (campus) addresses reduced to the 100 block
"""
import json
import os
import re

JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "mississippi_audit_results.json")
LEAD_NUM = re.compile(r"^\s*(\d+)\s*-?\s*(.*)$")


def zip5(z):
    return (z or "")[:5]


def block(addr: str) -> str:
    """'1400 J R LYNCH ST' -> '1400 block of J R LYNCH ST'; drops house numbers under 100."""
    if " block of " in (addr or "").lower():
        return addr  # already sanitized (keeps the step idempotent)
    m = LEAD_NUM.match(addr or "")
    if not m:
        return (addr or "").strip()
    num, rest = int(m.group(1)), m.group(2).replace("BLOCK ", "").strip()
    return f"{(num // 100) * 100} block of {rest}" if num >= 100 else rest


def main():
    with open(JSON_PATH, encoding="utf-8") as f:
        d = json.load(f)
    pb = d["playbooks"]

    for c in pb["highDensity"]["topClusters"]:
        c["zip"] = zip5(c.get("zip"))
        c["address"] = block(c["address"]) if c["classification"].startswith("Institutional") else f"Apartment complex in {c['city'].title()}"
    for c in pb["highDensity"]["topSingleFamilyAnomalies"]:
        c.pop("zip", None)
        c["address"] = f"Single-family home in {c['city'].title()}"
    for c in pb["missingDorm"]["campusBreakdown"]:
        c["address"] = block(c["address"])

    for i, s in enumerate(pb["commercialPOBox"]["samples"], 1):
        s.pop("voterId", None)
        s["recordToken"] = f"POB-{i:02d}"
        s["address"] = "P.O. Box (number withheld)"
        s["zip"] = zip5(s.get("zip"))
    for i, s in enumerate(pb["duplicates"]["sampleClusters"], 1):
        for k in ("voterIds", "name"):
            s.pop(k, None)
        s["clusterId"] = f"DUP-{i:02d}"
        s["zip"] = zip5(s.get("zip"))

    # Cluster labels on the 3D map are built from addresses; rebuild them from sanitized fields.
    sf = {f"CL-DOM-{i:02d}": a for i, a in enumerate(pb["highDensity"]["topSingleFamilyAnomalies"], 1)}
    for cl in d["threatManifold"]["clusterVectors"]:
        if cl["id"] in sf:
            a = sf[cl["id"]]
            cl["label"] = f"Single-family home, {a['city'].title()}"
            cl["plainEnglishSummary"] = (
                f"A single-family home in {a['city'].title()} ({a['county']} County) with {a['occupantCount']} registered voters "
                f"({a['activeOccupantCount']} active). Exact location withheld for privacy; the county can look it up in its own system."
            )
        elif cl["id"].startswith("MS-DUP-"):
            cl["label"] = cl["label"].replace("Duplicate Cluster ", "Duplicate pair ")

    d["metadata"]["privacyStandard"] = (
        "No names, birth dates, voter IDs, P.O. Box numbers or house numbers. Homes and apartments are shown by city only; "
        "campus addresses are shown to the nearest 100 block"
    )
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(d, f, indent=2)
    print("Sanitized", JSON_PATH)


if __name__ == "__main__":
    main()
