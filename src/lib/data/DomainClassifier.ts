import { DatasetDomain, ColumnTopology } from "./DataMapTopology";

export interface ClassificationResult {
  domain: DatasetDomain;
  displayName: string;
  recommendedPlaybooks: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export class DomainClassifier {
  /**
   * Auto-detects research domain and suggests specialized playbooks based on column topology
   */
  static classifyDataset(columns: ColumnTopology[]): ClassificationResult {
    const colNamesLower = columns.map(c => c.name.toLowerCase().replace(/[^a-z0-9]/g, ""));

    // Civic / Voter Integrity Signature
    const civicKeys = ["precinct", "voter", "voterid", "regdate", "party", "ballot", "residence", "jurisdiction"];
    const civicMatches = colNamesLower.filter(col => civicKeys.some(key => col.includes(key)));

    if (civicMatches.length >= 2 || colNamesLower.includes("voterid") || colNamesLower.includes("precinct")) {
      return {
        domain: "civic_audit",
        displayName: "Election Integrity & Voter Audit",
        recommendedPlaybooks: [
          { id: "density", name: "High-Density Address Anomaly", description: "Detects commercial or invalid residential addresses with abnormal occupant counts." },
          { id: "ghost", name: "Out-of-State / Relocated Voter", description: "Flags registered voters matching NCOA relocation databases." },
          { id: "age_null", name: "Age & Registration Anomaly", description: "Finds invalid registration dates or birthdate discrepancies." }
        ]
      };
    }

    // Sports Analytics Signature (e.g. Golf, Biomechanics)
    const sportsKeys = ["course", "par", "yardage", "greenspeed", "handicap", "hole", "stroke", "swing", "rpm"];
    const sportsMatches = colNamesLower.filter(col => sportsKeys.some(key => col.includes(key)));

    if (sportsMatches.length >= 2 || colNamesLower.includes("yardage") || colNamesLower.includes("greenspeed")) {
      return {
        domain: "sports_analytics",
        displayName: "Sports Analytics & Biomechanics",
        recommendedPlaybooks: [
          { id: "outlier_stroke", name: "Performance Outlier Detection", description: "Identifies statistically significant deviations in swing metrics or green speeds." },
          { id: "course_benchmark", name: "Course Benchmark Matrix", description: "Compares par vs yardage difficulty ratios across courses." }
        ]
      };
    }

    // Corporate Finance Signature
    const financeKeys = ["ticker", "ebitda", "revenue", "assets", "liabilities", "balance", "profit", "margin", "shares"];
    const financeMatches = colNamesLower.filter(col => financeKeys.some(key => col.includes(key)));

    if (financeMatches.length >= 2 || colNamesLower.includes("ticker") || colNamesLower.includes("ebitda")) {
      return {
        domain: "corporate_finance",
        displayName: "Corporate Finance & Academic Economics",
        recommendedPlaybooks: [
          { id: "financial_outlier", name: "Ratio Outlier Analysis", description: "Detects abnormal EBITDA and debt-to-equity ratios." },
          { id: "missing_audit", name: "Missing Reporting Audit", description: "Scans for missing quarterly financial disclosures." }
        ]
      };
    }

    // Academic Research / Document Archive Signature
    const academicKeys = ["doi", "abstract", "citation", "author", "journal", "publisher", "paper"];
    const academicMatches = colNamesLower.filter(col => academicKeys.some(key => col.includes(key)));

    if (academicMatches.length >= 2 || colNamesLower.includes("doi") || colNamesLower.includes("abstract")) {
      return {
        domain: "academic_research",
        displayName: "Academic Research & Literature Archive",
        recommendedPlaybooks: [
          { id: "citation_graph", name: "Citation Cross-Reference", description: "Maps inter-paper citation networks and author clusters." },
          { id: "keyword_density", name: "Abstract Concept Density", description: "Extracts primary research themes across papers." }
        ]
      };
    }

    // Default Generic Tabular
    return {
      domain: "generic_tabular",
      displayName: "General Tabular Research Dataset",
      recommendedPlaybooks: [
        { id: "general_quality", name: "Data Quality & Null Rate Audit", description: "Evaluates missing field percentages and column completeness." },
        { id: "general_outlier", name: "Z-Score Statistical Outlier Search", description: "Scans all numeric fields for statistical anomalies." }
      ]
    };
  }
}
