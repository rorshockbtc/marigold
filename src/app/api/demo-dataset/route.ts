import { NextResponse } from "next/server";

/**
 * Generates and serves a realistic synthetic voter roll CSV (`DEMO_roosevelt_statewide_voter_roll.csv`)
 * engineered with precise statistical, residential, commercial, clerical, and interstate relocation anomalies.
 * Designed for "State of Roosevelt (Demo)" zero-cloud training and video demonstrations.
 */

const FIRST_NAMES = [
  "JAMES", "MARY", "ROBERT", "PATRICIA", "JOHN", "JENNIFER", "MICHAEL", "LINDA",
  "DAVID", "ELIZABETH", "WILLIAM", "BARBARA", "RICHARD", "SUSAN", "JOSEPH", "JESSICA",
  "THOMAS", "SARAH", "CHARLES", "KAREN", "CHRISTOPHER", "NANCY", "DANIEL", "LISA",
  "MATTHEW", "MARGARET", "ANTHONY", "BETTY", "MARK", "SANDRA", "DONALD", "ASHLEY",
  "STEVEN", "KIMBERLY", "PAUL", "EMILY", "ANDREW", "DONNA", "JOSHUA", "MICHELLE",
  "KENNETH", "CAROL", "KEVIN", "AMANDA", "BRIAN", "MELISSA", "GEORGE", "DEBORAH",
  "EDWARD", "STEPHANIE", "RONALD", "REBECCA", "TIMOTHY", "LAURA", "JASON", "SHARON",
  "JEFFREY", "CYNTHIA", "RYAN", "KATHLEEN", "JACOB", "AMY", "GARY", "SHIRLEY",
  "NICHOLAS", "ANGELA", "ERIC", "HELEN", "JONATHAN", "ANNA", "STEPHEN", "BRENDA",
  "LARRY", "PAMELA", "JUSTIN", "NICOLE", "SCOTT", "EMMA", "BRANDON", "SAMANTHA",
  "BENJAMIN", "KATHERINE", "SAMUEL", "CHRISTINE", "GREGORY", "DEBRA", "ALEXANDER", "RACHEL"
];

const LAST_NAMES = [
  "SMITH", "JOHNSON", "WILLIAMS", "BROWN", "JONES", "GARCIA", "MILLER", "DAVIS",
  "RODRIGUEZ", "MARTINEZ", "HERNANDEZ", "LOPEZ", "GONZALEZ", "WILSON", "ANDERSON", "THOMAS",
  "TAYLOR", "MOORE", "JACKSON", "MARTIN", "LEE", "PEREZ", "THOMPSON", "WHITE",
  "HARRIS", "SANCHEZ", "CLARK", "RAMIREZ", "LEWIS", "ROBINSON", "WALKER", "YOUNG",
  "ALLEN", "KING", "WRIGHT", "SCOTT", "TORRES", "NGUYEN", "HILL", "FLORES",
  "GREEN", "ADAMS", "NELSON", "BAKER", "HALL", "RIVERA", "CAMPBELL", "MITCHELL",
  "CARTER", "ROBERTS", "GOMEZ", "PHILLIPS", "EVANS", "TURNER", "DIAZ", "PARKER",
  "CRUZ", "EDWARDS", "COLLINS", "REYES", "STEWART", "MORRIS", "MORALES", "MURPHY",
  "COOK", "ROGERS", "GUTIERREZ", "ORTIZ", "MORGAN", "COOPER", "PETERSON", "BAILEY",
  "REED", "KELLY", "HOWARD", "RAMOS", "KIM", "COX", "WARD", "RICHARDSON",
  "WATSON", "BROOKS", "CHAVEZ", "WOOD", "JAMES", "BENNETT", "GRAY", "MENDOZA"
];

const STREET_NAMES = [
  "OAK ST", "MAPLE AVE", "WASHINGTON RD", "PINE ST", "ELM ST", "CEDAR LN", "WALNUT WAY",
  "BIRCH RD", "CHERRY AVE", "HICKORY LN", "PEACHTREE BLVD", "MAGNOLIA ST", "SYCAMORE RD",
  "WILLOW DR", "ASH ST", "CHESTNUT WAY", "CYPRESS LN", "POPLAR ST", "ACORN RD",
  "MEADOW LN", "HIGHLAND AVE", "SUNSET BLVD", "RIDGE RD", "VALLEY WAY", "LAKEVIEW DR",
  "FOREST RD", "HILLSIDE AVE", "RIVER DR", "SPRING ST", "BROOK LN", "ORCHARD RD"
];

const COUNTIES = [
  { county: "FRANKLIN", city: "ROOSEVELT CITY", zip: "99101", precinct: "PRECINCT-101" },
  { county: "LIBERTY", city: "HAMILTON", zip: "99201", precinct: "PRECINCT-204" },
  { county: "JEFFERSON", city: "OAKVILLE", zip: "99301", precinct: "PRECINCT-308" },
  { county: "ADAMS", city: "PLEASANT VALLEY", zip: "99401", precinct: "PRECINCT-412" }
];

// Benford's law exact leading digit weights (30.1%, 17.6%, 12.5%, 9.7%, 7.9%, 6.7%, 5.8%, 5.1%, 4.6%)
function getBenfordLeadingDigit(): number {
  const r = Math.random() * 100;
  if (r < 30.1) return 1;
  if (r < 47.7) return 2;
  if (r < 60.2) return 3;
  if (r < 69.9) return 4;
  if (r < 77.8) return 5;
  if (r < 84.5) return 6;
  if (r < 90.3) return 7;
  if (r < 95.4) return 8;
  return 9;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear = 2014, endYear = 2025): string {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    const rows: string[] = [];
    
    // Standard CSV Header matching universalMapper exactly
    rows.push([
      "voter_id",
      "first_name",
      "last_name",
      "full_name",
      "address",
      "city",
      "state",
      "zip",
      "county",
      "status",
      "date_registered",
      "precinct_code",
      "ncoa_flag",
      "mail_address",
      "mail_city",
      "mail_state",
      "mail_zip"
    ].join(","));

    let idCounter = 100001;

    // Helper to format a row string
    const addRow = (
      id: string,
      first: string,
      last: string,
      addr: string,
      city: string,
      st: string,
      zip: string,
      county: string,
      status: string,
      dateReg: string,
      precinct: string,
      ncoa: string = "",
      mailAddr: string = "",
      mailCity: string = "",
      mailState: string = "",
      mailZip: string = ""
    ) => {
      const full = `${first} ${last}`.trim();
      const escapedAddr = addr.includes(",") ? `"${addr}"` : addr;
      const escapedMail = mailAddr.includes(",") ? `"${mailAddr}"` : mailAddr;
      rows.push([
        id,
        first,
        last,
        full,
        escapedAddr,
        city,
        st,
        zip,
        county,
        status,
        dateReg,
        precinct,
        ncoa,
        escapedMail,
        mailCity,
        mailState,
        mailZip
      ].join(","));
    };

    // ==========================================
    // 1. ENGINEERED ANOMALIES (Phase 2, 3, 4)
    // ==========================================

    // Anomaly A: High-Density & Missing Dorm Unit (#1 & #2)
    // 64 active students at 100 CAMPUS DR without apartment/dorm numbers
    for (let i = 1; i <= 64; i++) {
      const fname = randomChoice(FIRST_NAMES);
      const lname = randomChoice(LAST_NAMES);
      addRow(
        `RSV-${idCounter++}`,
        fname,
        lname,
        "100 CAMPUS DR",
        "ROOSEVELT CITY",
        "RS",
        "99101",
        "FRANKLIN",
        "ACTIVE",
        randomDate(2022, 2024),
        "PRECINCT-101"
      );
    }

    // Anomaly B: Missing Apartment Unit in Large Urban Complex (#2)
    // 56 active residents at 400 ELM ST without APT/STE numbers
    for (let i = 1; i <= 56; i++) {
      const fname = randomChoice(FIRST_NAMES);
      const lname = randomChoice(LAST_NAMES);
      addRow(
        `RSV-${idCounter++}`,
        fname,
        lname,
        "400 ELM ST",
        "HAMILTON",
        "RS",
        "99201",
        "LIBERTY",
        "ACTIVE",
        randomDate(2018, 2024),
        "PRECINCT-204"
      );
    }

    // Anomaly C: Commercial Mail Disguises & Suites (#3 & #4)
    // 18 active voters registered inside a commercial UPS store suite
    for (let i = 1; i <= 18; i++) {
      const fname = randomChoice(FIRST_NAMES);
      const lname = randomChoice(LAST_NAMES);
      addRow(
        `RSV-${idCounter++}`,
        fname,
        lname,
        "500 COMMERCE WAY STE 200",
        "HAMILTON",
        "RS",
        "99201",
        "LIBERTY",
        "ACTIVE",
        randomDate(2021, 2025),
        "PRECINCT-204"
      );
    }

    // 12 active voters registered directly to P.O. Boxes or UPS store PMB boxes
    for (let i = 1; i <= 12; i++) {
      const fname = randomChoice(FIRST_NAMES);
      const lname = randomChoice(LAST_NAMES);
      const boxTypes = ["P.O. BOX 1042", "PO BOX 884", "123 MAIN ST PO BOX 5", "880 HIGHWAY 1 UPS STORE #14"];
      addRow(
        `RSV-${idCounter++}`,
        fname,
        lname,
        boxTypes[i % boxTypes.length],
        "OAKVILLE",
        "RS",
        "99301",
        "JEFFERSON",
        "ACTIVE",
        randomDate(2016, 2023),
        "PRECINCT-308"
      );
    }

    // Anomaly D: Single-Day Registration Spike (#6)
    // 145 active voters registered across Liberty County on exactly 2024-10-06
    for (let i = 1; i <= 145; i++) {
      const fname = randomChoice(FIRST_NAMES);
      const lname = randomChoice(LAST_NAMES);
      const stName = randomChoice(STREET_NAMES);
      const num = getBenfordLeadingDigit() * 100 + Math.floor(Math.random() * 89) + 10;
      addRow(
        `RSV-${idCounter++}`,
        fname,
        lname,
        `${num} ${stName}`,
        "HAMILTON",
        "RS",
        "99201",
        "LIBERTY",
        "ACTIVE",
        "2024-10-06",
        "PRECINCT-204"
      );
    }

    // Anomaly E: Phantom Precincts (#7)
    // 16 active voters with UNASSIGNED precinct codes
    for (let i = 1; i <= 16; i++) {
      const fname = randomChoice(FIRST_NAMES);
      const lname = randomChoice(LAST_NAMES);
      const stName = randomChoice(STREET_NAMES);
      const num = getBenfordLeadingDigit() * 100 + Math.floor(Math.random() * 89) + 10;
      addRow(
        `RSV-${idCounter++}`,
        fname,
        lname,
        `${num} ${stName}`,
        "PLEASANT VALLEY",
        "RS",
        "99401",
        "ADAMS",
        "ACTIVE",
        randomDate(2019, 2024),
        "UNASSIGNED"
      );
    }

    // Anomaly F: Out-of-State Mailing Loophole & NCOA (#8)
    // 24 active voters domiciled in Roosevelt but receiving mail in distant out-of-state cities
    const outStates = [
      { addr: "1400 LAKE SHORE DR APT 12B", city: "CHICAGO", st: "IL", zip: "60610" },
      { addr: "300 CONGRESS AVE STE 400", city: "AUSTIN", st: "TX", zip: "78701" },
      { addr: "550 SUNSET BLVD UNIT 9", city: "LOS ANGELES", st: "CA", zip: "90028" },
      { addr: "100 OCEAN DR PH 2", city: "MIAMI", st: "FL", zip: "33139" }
    ];
    for (let i = 1; i <= 24; i++) {
      const fname = randomChoice(FIRST_NAMES);
      const lname = randomChoice(LAST_NAMES);
      const stName = randomChoice(STREET_NAMES);
      const num = getBenfordLeadingDigit() * 100 + Math.floor(Math.random() * 89) + 10;
      const targetOut = outStates[i % outStates.length];
      addRow(
        `RSV-${idCounter++}`,
        fname,
        lname,
        `${num} ${stName}`,
        "ROOSEVELT CITY",
        "RS",
        "99101",
        "FRANKLIN",
        "ACTIVE",
        randomDate(2015, 2022),
        "PRECINCT-101",
        "Y", // NCOA flagged
        targetOut.addr,
        targetOut.city,
        targetOut.st,
        targetOut.zip
      );
    }

    // Anomaly G: Intra-County Duplicates (#5)
    // 5 pairs of identical Name & Zip registered across different street addresses in Jefferson County
    const dupNames = [
      { first: "JOHN", last: "MILLER" },
      { first: "ROBERT", last: "TAYLOR" },
      { first: "MARY", last: "JOHNSON" },
      { first: "DAVID", last: "ANDERSON" },
      { first: "SARAH", last: "DAVIS" }
    ];
    for (const d of dupNames) {
      // Address 1
      addRow(
        `RSV-${idCounter++}`,
        d.first,
        d.last,
        `${getBenfordLeadingDigit() * 100 + 12} MAPLE AVE`,
        "OAKVILLE",
        "RS",
        "99301",
        "JEFFERSON",
        "ACTIVE",
        "2018-05-12",
        "PRECINCT-308"
      );
      // Address 2 (Same Name, Same Zip, Different Street)
      addRow(
        `RSV-${idCounter++}`,
        d.first,
        d.last,
        `${getBenfordLeadingDigit() * 100 + 84} WILLOW DR`,
        "OAKVILLE",
        "RS",
        "99301",
        "JEFFERSON",
        "ACTIVE",
        "2023-11-04",
        "PRECINCT-308"
      );
    }

    // Anomaly H: Clerical Typos / 1-Character Names (#4)
    // 12 records with 1-character first or last names
    const typoExamples = [
      { first: "J", last: "SMITH" },
      { first: "ROBERT", last: "M" },
      { first: "A", last: "JOHNSON" },
      { first: "SARAH", last: "K" },
      { first: "T", last: "WILLIAMS" },
      { first: "MICHAEL", last: "B" }
    ];
    for (let i = 0; i < 12; i++) {
      const ex = typoExamples[i % typoExamples.length];
      const stName = randomChoice(STREET_NAMES);
      const num = getBenfordLeadingDigit() * 100 + Math.floor(Math.random() * 89) + 10;
      addRow(
        `RSV-${idCounter++}`,
        ex.first,
        ex.last,
        `${num} ${stName}`,
        "PLEASANT VALLEY",
        "RS",
        "99401",
        "ADAMS",
        "ACTIVE",
        randomDate(2017, 2024),
        "PRECINCT-412"
      );
    }

    // ==========================================
    // 2. NORMAL RESIDENTIAL BASELINE (~1,480 ROWS)
    // ==========================================
    // Generates normal 1-3 person households adhering strictly to Benford's Law distribution curves
    const targetBaseRows = 1480;
    let baseCount = 0;
    while (baseCount < targetBaseRows) {
      const loc = randomChoice(COUNTIES);
      const stName = randomChoice(STREET_NAMES);
      // Leading digit weighted by Benford's law
      const leading = getBenfordLeadingDigit();
      const restNum = Math.floor(Math.random() * 90) + 10;
      const householdAddr = `${leading}${restNum} ${stName}`;

      // Household size 1 to 3 voters
      const householdSize = Math.floor(Math.random() * 3) + 1;
      const familyLastName = randomChoice(LAST_NAMES);

      for (let h = 0; h < householdSize && baseCount < targetBaseRows; h++) {
        const fname = randomChoice(FIRST_NAMES);
        addRow(
          `RSV-${idCounter++}`,
          fname,
          familyLastName,
          householdAddr,
          loc.city,
          "RS",
          loc.zip,
          loc.county,
          "ACTIVE",
          randomDate(2012, 2025),
          loc.precinct
        );
        baseCount++;
      }
    }

    const csvContent = rows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="DEMO_roosevelt_statewide_voter_roll.csv"',
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error: any) {
    console.error("Failed to generate demo dataset CSV:", error);
    return NextResponse.json({ error: "Failed to generate demo dataset" }, { status: 500 });
  }
}
