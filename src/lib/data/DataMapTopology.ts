export type DatasetDomain = 
  | "civic_audit"
  | "sports_analytics"
  | "academic_research"
  | "corporate_finance"
  | "document_archive"
  | "generic_tabular";

export interface ColumnTopology {
  name: string;
  dataType: "string" | "number" | "date" | "boolean" | "coordinates" | "text";
  nullRatePercentage: number;
  uniqueCardinality: number;
  sampleValues: string[];
}

export interface AnomalyNode {
  id: string;
  recordId: string;
  title: string;
  details: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  playbookId?: string;
  flaggedDate: string;
  notes: Array<{
    id: string;
    author: string;
    text: string;
    date: string;
  }>;
}

export interface VersionLineage {
  parentSha256?: string;
  createdDate: string;
  updatedDate: string;
  versionNumber: number;
  contractionWarning?: boolean;
}

export interface DataMapTopology {
  datasetId: string;
  datasetName: string;
  domain: DatasetDomain;
  sha256Signature: string;
  fileSizeBytes: number;
  totalRows: number;
  columns: ColumnTopology[];
  anomalyNodes: AnomalyNode[];
  lineage: VersionLineage;
  customTags: string[];
}

export class DataMapTopologyManager {
  /**
   * Generates a unified DataMapTopology object from parsed CSV rows and headers
   */
  static createTopologyFromData(
    datasetName: string,
    rows: Array<Record<string, any>>,
    fileSizeBytes: number,
    sha256Signature: string,
    domain: DatasetDomain = "generic_tabular"
  ): DataMapTopology {
    if (rows.length === 0) {
      return {
        datasetId: `ds-${Math.random().toString(36).substring(2, 9)}`,
        datasetName,
        domain,
        sha256Signature,
        fileSizeBytes,
        totalRows: 0,
        columns: [],
        anomalyNodes: [],
        lineage: {
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          versionNumber: 1
        },
        customTags: []
      };
    }

    const firstRow = rows[0];
    const colNames = Object.keys(firstRow);
    const columns: ColumnTopology[] = colNames.map(colName => {
      let nullCount = 0;
      const uniqueSet = new Set<string>();
      const sampleValues: string[] = [];

      for (let i = 0; i < Math.min(rows.length, 1000); i++) {
        const val = rows[i][colName];
        if (val === undefined || val === null || val === "") {
          nullCount++;
        } else {
          const strVal = String(val).trim();
          uniqueSet.add(strVal);
          if (sampleValues.length < 3 && !sampleValues.includes(strVal)) {
            sampleValues.push(strVal);
          }
        }
      }

      // Infer basic data type
      const firstVal = sampleValues[0] || "";
      let dataType: ColumnTopology["dataType"] = "string";
      if (!isNaN(Number(firstVal)) && firstVal !== "") {
        dataType = "number";
      } else if (!isNaN(Date.parse(firstVal)) && firstVal.length > 5 && (firstVal.includes("-") || firstVal.includes("/"))) {
        dataType = "date";
      } else if (firstVal.length > 100) {
        dataType = "text";
      }

      return {
        name: colName,
        dataType,
        nullRatePercentage: Math.round((nullCount / Math.min(rows.length, 1000)) * 100),
        uniqueCardinality: uniqueSet.size,
        sampleValues
      };
    });

    return {
      datasetId: `ds-${Math.random().toString(36).substring(2, 9)}`,
      datasetName,
      domain,
      sha256Signature,
      fileSizeBytes,
      totalRows: rows.length,
      columns,
      anomalyNodes: [],
      lineage: {
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        versionNumber: 1
      },
      customTags: []
    };
  }
}
