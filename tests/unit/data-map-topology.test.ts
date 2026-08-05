import { describe, it, expect } from 'vitest';
import { DataMapTopologyManager } from '@/lib/data/DataMapTopology';
import { DomainClassifier } from '@/lib/data/DomainClassifier';

describe('Data Map Topology & Domain Classifier Suite', () => {
  it('should auto-classify voter roll dataset as civic_audit domain', () => {
    const rows = [
      { name: "John Doe", address: "123 Main St", precinct: "PCT-01", voter_id: "MS1001" },
      { name: "Jane Smith", address: "456 Oak Rd", precinct: "PCT-02", voter_id: "MS1002" }
    ];

    const topology = DataMapTopologyManager.createTopologyFromData(
      "Mississippi Voter Roll",
      rows,
      800 * 1024 * 1024,
      "sha256-dummy-hash"
    );

    const classification = DomainClassifier.classifyDataset(topology.columns);

    expect(classification.domain).toBe("civic_audit");
    expect(classification.displayName).toContain("Election Integrity");
    expect(classification.recommendedPlaybooks.length).toBeGreaterThan(0);
  });

  it('should auto-classify golf course dataset as sports_analytics domain', () => {
    const rows = [
      { course_name: "Pine Valley", par: 70, yardage: 7057, greenspeed: 12.5 },
      { course_name: "Augusta National", par: 72, yardage: 7510, greenspeed: 13.0 }
    ];

    const topology = DataMapTopologyManager.createTopologyFromData(
      "Golf Course Biomechanics",
      rows,
      15 * 1024 * 1024,
      "sha256-golf-hash"
    );

    const classification = DomainClassifier.classifyDataset(topology.columns);

    expect(classification.domain).toBe("sports_analytics");
    expect(classification.displayName).toContain("Sports Analytics");
  });

  it('should auto-classify corporate finance dataset as corporate_finance domain', () => {
    const rows = [
      { ticker: "AAPL", revenue: 383000000000, ebitda: 125000000000, assets: 352000000000 },
      { ticker: "MSFT", revenue: 211000000000, ebitda: 102000000000, assets: 411000000000 }
    ];

    const topology = DataMapTopologyManager.createTopologyFromData(
      "Corporate Finance Research",
      rows,
      50 * 1024 * 1024,
      "sha256-finance-hash"
    );

    const classification = DomainClassifier.classifyDataset(topology.columns);

    expect(classification.domain).toBe("corporate_finance");
    expect(classification.displayName).toContain("Corporate Finance");
  });
});
